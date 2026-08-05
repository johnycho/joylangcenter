// 게시글 조회수 설정 + 클라이언트 헬퍼
//
// 백엔드: tools/joy-cusdis-slack-relay 의 api/views.js (Upstash Redis 카운터).
// VIEWS_API 가 비어 있으면 조회수 UI 는 조용히 렌더링되지 않습니다.

export const VIEWS_API = 'https://joy-cusdis-slack-relay.vercel.app/api/views';

// 끝 슬래시 제거(서버 정규화와 일치) — permalink 와 location.pathname 을 같은 키로 맞춘다.
const norm = (id: string) => id.replace(/\/+$/, '');

const yyyymmdd = () => {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
};

/** 여러 글의 조회수를 한 번에 조회 (게시판 목록용) */
export async function fetchViews(ids: string[]): Promise<Record<string, number>> {
  if (!VIEWS_API || !ids.length) return {};
  try {
    const q = ids.map(norm).map(encodeURIComponent).join(',');
    const res = await fetch(`${VIEWS_API}?ids=${q}`);
    const j = await res.json();
    return (j && j.counts) || {};
  } catch (_) {
    return {};
  }
}

/**
 * 조회 기록 + 현재값 반환 (게시글 상세용).
 * 기기당 하루 1회만 +1(localStorage). 오늘 이미 봤으면 GET 으로 현재값만 읽는다.
 */
export async function recordView(id: string): Promise<number | null> {
  if (!VIEWS_API) return null;
  const key = norm(id);
  let alreadyToday = false;
  try {
    alreadyToday = typeof localStorage !== 'undefined' && localStorage.getItem(`jv:viewed:${key}`) === yyyymmdd();
  } catch (_) {}

  if (alreadyToday) {
    const counts = await fetchViews([key]);
    return key in counts ? counts[key] : null;
  }

  try {
    const res = await fetch(VIEWS_API, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({id: key}),
    });
    const j = await res.json();
    if (j && j.ok) {
      try {
        localStorage.setItem(`jv:viewed:${key}`, yyyymmdd());
      } catch (_) {}
      return typeof j.count === 'number' ? j.count : null;
    }
  } catch (_) {}
  return null;
}
