import React, {useEffect, useRef, useState} from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import {useLocation} from '@docusaurus/router';
import {CUSDIS_HOST, CUSDIS_APP_ID} from '@site/src/cusdis';

const SCRIPT_ID = 'cusdis-embed-script';
const STYLE_ID = 'cusdis-brand-style';

// 위젯 UI 한국어화 (SDK 로드 전에 window.CUSDIS_LOCALE 설정)
const KO_LOCALE = {
  powered_by: 'Cusdis 제공',
  post_comment: '등록',
  loading: '로딩중...',
  email: '이메일 (선택)',
  nickname: '이름',
  reply_placeholder: '내용',
  reply_btn: '답글쓰기',
  sending: '전송중...',
  mod_badge: 'Admin',
  content_is_required: '내용이 필요합니다',
  nickname_is_required: '이름이 필요합니다',
  comment_has_been_sent: '댓글이 등록되었습니다.',
};

// 위 comment_has_been_sent 안에 포함된, 제출 완료 감지용 문구
const SENT_MARKER = '등록되었습니다';

// iframe 내부(동일 출처 srcdoc)에 주입할 브랜드 스타일
const BRAND_CSS = `
  /* iframe 내부에도 NanumSquareRound 로드 (부모 @font-face 는 상속되지 않음).
     실제 굵기(400/700)를 로드해 이름·뱃지 등의 볼드를 또렷하게(폴백 폰트의 과한 볼드 방지) */
  @font-face {
    font-family: 'NanumSquareRound'; font-style: normal; font-weight: 400; font-display: swap;
    src: url('https://cdn.jsdelivr.net/gh/innks/NanumSquareRound/NanumSquareRoundR.woff2') format('woff2'),
         url('https://cdn.jsdelivr.net/gh/innks/NanumSquareRound/NanumSquareRoundR.woff') format('woff');
  }
  @font-face {
    font-family: 'NanumSquareRound'; font-style: normal; font-weight: 700; font-display: swap;
    src: url('https://cdn.jsdelivr.net/gh/innks/NanumSquareRound/NanumSquareRoundB.woff2') format('woff2'),
         url('https://cdn.jsdelivr.net/gh/innks/NanumSquareRound/NanumSquareRoundB.woff') format('woff');
  }
  /* display: flow-root 로 BFC 를 만들어 자식의 상/하 여백이 body 밖으로 새는 것을 막는다.
     (그래야 body.scrollHeight 로 측정한 높이가 실제 콘텐츠와 정확히 일치해 내부 스크롤이 안 생김) */
  html, body { overflow: hidden !important; }
  body { font-family: 'NanumSquareRound', Arial, '나눔고딕', 'NanumGothic', sans-serif; color: #333; margin: 0; display: flow-root; }

  /* 입력창 */
  input, textarea {
    border: 1px solid #e5e2dc !important; border-radius: 10px !important;
    padding: 0.5rem 0.65rem !important; font-size: 0.82rem !important;
    background: #fff !important; color: #333 !important;
    transition: border-color .15s, box-shadow .15s;
  }
  input:focus, textarea:focus {
    outline: none !important; border-color: #f2921d !important;
    box-shadow: 0 0 0 3px rgba(242,146,29,.15) !important;
  }
  label { font-size: 0.8rem !important; color: #8a7f70 !important; font-weight: 700 !important; margin-bottom: .35rem !important; }

  /* 모바일: 닉네임/이메일을 한 줄(세로)로 */
  @media (max-width: 480px) { .grid-cols-2 { grid-template-columns: 1fr !important; } }

  /* 버튼 기본(대댓글 "댓글" 토글 등) — 테두리 있는 pill 버튼 */
  button {
    background: #fff !important; border: 1px solid #e7d9c4 !important; color: #b46508 !important;
    font-weight: 700 !important; font-size: 0.85rem !important;
    padding: .3rem .85rem !important; border-radius: 999px !important;
    cursor: pointer; transition: background .15s, color .15s, border-color .15s;
  }
  button:hover { background: #f2921d !important; color: #fff !important; border-color: #f2921d !important; }

  /* 주요 제출 버튼(등록/대댓글 등록) — 주황 라운드 */
  button.bg-gray-200 {
    background: #f2921d !important; color: #fff !important;
    padding: .45rem 1.3rem !important; border-radius: 999px !important; font-size: 0.84rem !important;
  }
  button.bg-gray-200:hover { background: #e7820a !important; }
  /* 제출 중: 버튼을 감추고 스피너만 표시 */
  button.bg-gray-200.cusdis-sending {
    background: transparent !important; color: transparent !important; box-shadow: none !important;
    pointer-events: none !important; position: relative !important; min-width: 2.6rem !important;
  }
  button.bg-gray-200.cusdis-sending::after {
    content: '' !important; position: absolute !important; top: 50% !important; left: 50% !important;
    width: 1.15rem !important; height: 1.15rem !important; margin: -.575rem 0 0 -.575rem !important;
    border: 2px solid #f1e3cf !important; border-top-color: #f2921d !important; border-radius: 50% !important;
    animation: cusdis-spin .7s linear infinite !important;
  }

  /* 최신 댓글이 아래로 오도록 최상위 목록을 역순 표시 (답글은 카드 내부라 영향 없음) */
  .mt-4 { display: flex !important; flex-direction: column-reverse !important; }
  /* 댓글 카드 — 흰 배경 + 옅은 하단 구분선(네이버식 경량화) */
  .mt-4 > .my-4 {
    background: #fff !important; border: 0 !important; border-bottom: 1px solid #efe7d8 !important;
    border-radius: 0 !important; padding: .95rem .15rem !important; margin: 0 !important;
  }
  .mt-4 > .my-4:first-child { border-bottom: 0 !important; } /* column-reverse 라 시각상 맨 아래 */
  /* 답글(대댓글) 카드 — 들여쓰기 + 부드러운 라운드 박스(세로선 없이 depth 표현) */
  .my-4 .my-4.pl-4 {
    background: #f7f5f0 !important; border: 0 !important;
    border-radius: 12px !important;
    padding: .6rem .85rem .5rem .85rem !important; margin: .4rem 0 .15rem 1.1rem !important;
  }
  /* 작성자 이름 + 관리자 별 배지 (한 줄) */
  .my-4 > .flex.items-center { align-items: center !important; }
  .flex.items-center .font-medium { color: #b46508 !important; font-weight: 700 !important; font-size: 0.8rem !important; margin-right: .15rem !important; }
  /* 하단 메타 줄(날짜 · 답글) — 내용 아래로 이동, subtle */
  .my-4 > .text-sm { color: #b8ad9b !important; font-size: 0.72rem !important; margin: .1rem 0 0 !important; }
  .cusdis-meta { display: flex !important; align-items: center !important; gap: .8rem !important; margin-top: .05rem !important; }
  .cusdis-meta > .text-sm { margin: 0 !important; color: #b8ad9b !important; font-size: 0.72rem !important; }
  .cusdis-meta button:not(.bg-gray-200) {
    background: transparent !important; border: 0 !important; color: #b8ad9b !important;
    font-weight: 500 !important; font-size: 0.7rem !important; padding: 0 !important; border-radius: 0 !important;
  }
  .cusdis-meta button:not(.bg-gray-200):hover { background: transparent !important; color: #f2921d !important; }
  .cusdis-fold { display: inline-flex !important; align-items: center !important; gap: .2rem !important; white-space: nowrap !important; }
  .cusdis-fold-ic { width: .95rem !important; height: .95rem !important; transition: transform .2s ease !important; }
  .cusdis-fold.cusdis-fold-open .cusdis-fold-ic { transform: rotate(180deg) !important; }
  /* 관리자 배지 — "Admin" 라벨(연한 배경+진한 글씨+각진 모서리, 버튼과 구분) */
  .flex.items-center .bg-gray-200 {
    background: #fbe7c8 !important; color: #b46508 !important; border: 1px solid #f0d3a3 !important;
    width: auto !important; height: auto !important;
    padding: .02rem .34rem !important; margin: 0 0 0 .2rem !important;
    border-radius: 4px !important; display: inline-flex !important; align-items: center !important;
    font-size: .62rem !important; font-weight: 700 !important; line-height: 1.6 !important; letter-spacing: .02em !important;
  }
  /* 답글 @작성자 태그 — 내용 맨 앞 인라인 컬러 태그(네이버식) */
  .cusdis-mention { color: #2f6fd6 !important; font-weight: 700 !important; }
  /* 답글의 답글 폼 상단 @작성자 태그 */
  .cusdis-form-tag {
    display: inline-block !important; background: #eaf1fc !important; color: #2f6fd6 !important;
    font-weight: 700 !important; font-size: .8rem !important;
    padding: .15rem .6rem !important; border-radius: 999px !important; margin: 0 0 .5rem !important;
  }
  /* 본문 */
  .my-4 > .my-2 { color: #4a4a4a !important; font-size: 0.8rem !important; line-height: 1.6 !important; margin: .4rem 0 .15rem !important; }
  .my-4 > .my-2 p { margin: 0 !important; font-size: 0.8rem !important; line-height: 1.6 !important; }

  /* 구분 여백 축소 */
  .my-8 { margin: 1.2rem 0 !important; }

  /* 링크 */
  a { color: #f2921d !important; }
  /* "Cusdis 제공" 푸터 숨김 */
  .text-center.text-xs { display: none !important; }

  /* 로딩 스피너 (위젯 내부 "로딩중..." 텍스트 대체) */
  @keyframes cusdis-spin { to { transform: rotate(360deg); } }
  .cusdis-spin {
    display: inline-block; width: 26px; height: 26px; border-radius: 50%;
    border: 3px solid #f1e3cf; border-top-color: #f2921d;
    animation: cusdis-spin .8s linear infinite;
  }
`;

function CusdisThread() {
  const location = useLocation();
  const pageId = location.pathname;
  // 댓글 제출 후 위젯을 깨끗이 재마운트해 새 댓글이 바로 보이게 하는 키
  const [reloadKey, setReloadKey] = useState(0);
  const [reloading, setReloading] = useState(true); // 로딩/새로고침 중(정렬 끝나기 전 원본·재정렬 노출 방지)
  const [frozenHeight, setFrozenHeight] = useState<number | null>(null); // 새로고침 중 높이 튐 방지용 고정 높이
  const formDraftRef = useRef<{nick: string; content: string} | null>(null); // 새로고침 시 작성 중이던 폼 내용 보존
  const lastCountRef = useRef(0); // 마지막으로 확인한 댓글 수(새로고침 중 카운트 사라짐/화살표 이동 방지)
  const pageIdRef = useRef(pageId); // 글 이동 감지용(다른 글로 가면 카운트 초기화)

  useEffect(() => {
    // 다른 글로 이동한 경우에만 카운트 초기화(같은 글 새로고침 시엔 유지)
    if (pageIdRef.current !== pageId) {
      pageIdRef.current = pageId;
      lastCountRef.current = 0;
    }
    const w = window as any;
    if (!document.getElementById(SCRIPT_ID)) {
      // 최초 1회: 한국어 로케일 지정 후 Cusdis 임베드 스크립트 주입
      w.CUSDIS_LOCALE = KO_LOCALE;
      const s = document.createElement('script');
      s.id = SCRIPT_ID;
      s.async = true;
      s.defer = true;
      s.src = `${CUSDIS_HOST}/js/cusdis.es.js`;
      document.body.appendChild(s);
    } else if (w.CUSDIS) {
      // SPA 페이지 이동 시 현재 글 기준으로 다시 렌더
      w.CUSDIS.initial();
    }

    // --- 높이 자동조정 + 브랜드 스타일 주입 ---
    // Cusdis 위젯은 부모로 resize 메시지를 보낼 때 targetOrigin 을 누락해
    // 최신 브라우저에서 자동 리사이즈가 동작하지 않는다(업스트림 버그).
    // srcdoc iframe 은 동일 출처이므로 내부 문서 높이를 직접 읽어 맞추고,
    // 내부에 브랜드 CSS 도 함께 주입한다.
    let ro: ResizeObserver | undefined;
    let mo: MutationObserver | undefined;
    let iv: ReturnType<typeof setInterval> | undefined;
    let poll: ReturnType<typeof setInterval> | undefined;
    let giveUp: ReturnType<typeof setTimeout> | undefined;
    let secTimer: ReturnType<typeof setTimeout> | undefined;
    let submitTimer: ReturnType<typeof setTimeout> | undefined;
    let submitHandled = false;
    let boundIframe: HTMLIFrameElement | undefined;
    // 이 로드 한정: open/comments 결과 캐시(showSeconds 재fetch 방지) + 동시 실행 가드 + 초 적용 완료 플래그
    let secCache: any[] | null = null;
    let secBusy = false;
    let secDone = false;
    // 정렬·초 적용이 끝나기 전 오버레이 유지 → 완료되면 해제. 안전장치로 일정 시간 후 강제 해제.
    const reveal = () => {
      setReloading(false);
      setFrozenHeight(null); // 고정 해제 → 실제 콘텐츠 높이로 자연스럽게 안착
    };
    const revealFallback = setTimeout(reveal, 2500);
    const maybeReveal = () => {
      const doc = boundIframe?.contentDocument;
      if (!doc) return;
      if (!doc.querySelector('.mt-4 > .my-4')) return; // 아직 댓글 렌더 전
      if (!secDone) return; // 초 적용 패스 완료 전(정렬·초까지 확정된 뒤 노출)
      reveal();
    };

    // 댓글 제출 완료를 감지하면, 자동승인(웹훅) 반영 시간을 준 뒤 위젯을 재마운트한다.
    // (라이브 위젯의 srcdoc 을 직접 리로드하지 않고 React 로 통째 재마운트 → 블랭크 방지)
    const maybeReloadAfterSubmit = () => {
      try {
        const txt = boundIframe?.contentDocument?.body?.innerText || '';
        if (!submitHandled && txt.includes(SENT_MARKER)) {
          submitHandled = true;
          submitTimer = setTimeout(() => setReloadKey((k) => k + 1), 2500);
        }
      } catch (_) {}
    };

    const syncHeight = (iframe: HTMLIFrameElement) => {
      try {
        const doc = iframe.contentDocument;
        const body = doc?.body;
        if (!body) return;
        // body 기준으로 측정해야 내용이 줄어들 때(대댓글 접기 등) 높이도 함께 줄어든다.
        // documentElement.scrollHeight 는 iframe 뷰포트 높이로 고정돼 축소가 반영되지 않음.
        const h = Math.max(body.scrollHeight, body.offsetHeight);
        const cur = parseInt(iframe.style.height, 10) || 0;
        // 실제로 값이 바뀔 때만 갱신 (ResizeObserver 루프 방지)
        if (h && Math.abs(h - cur) > 1) iframe.style.height = h + 'px';
      } catch (_) {}
    };

    // 위젯 내부의 "로딩중..." 텍스트 div 를 스피너로 교체 (클래스가 없어 구조로 탐지)
    const replaceLoading = (iframe: HTMLIFrameElement) => {
      try {
        const doc = iframe.contentDocument;
        const root = doc?.getElementById('root');
        if (!root) return;
        root.querySelectorAll('div').forEach((el) => {
          if (
            el.childElementCount === 0 &&
            /^로딩중/.test((el.textContent || '').trim()) &&
            !(el as HTMLElement).dataset.spun
          ) {
            (el as HTMLElement).dataset.spun = '1';
            el.innerHTML = '<span class="cusdis-spin" role="status" aria-label="로딩중"></span>';
            (el as HTMLElement).style.display = 'flex';
            (el as HTMLElement).style.justifyContent = 'center';
            (el as HTMLElement).style.padding = '1.5rem 0';
          }
        });
      } catch (_) {}
    };

    // 위젯 내부(동일 출처)에서 댓글 개수(대댓글 포함)를 읽어 헤딩에 표시
    const updateHeading = (iframe: HTMLIFrameElement) => {
      try {
        const doc = iframe.contentDocument;
        const n = doc ? doc.querySelectorAll('.my-4 > .flex.items-center').length : 0;
        const heading = document.getElementById('cusdis-heading');
        if (!heading) return;
        if (n > 0) {
          lastCountRef.current = n;
          heading.textContent = `댓글 ${n}`;
        } else if (lastCountRef.current > 0) {
          // 새로고침 중 일시적으로 0개가 되어도 이전 카운트 유지
          // → 숫자가 사라지지 않아 옆의 새로고침 화살표가 왼쪽으로 밀리지 않음
          heading.textContent = `댓글 ${lastCountRef.current}`;
        } else {
          heading.textContent = '댓글';
        }
      } catch (_) {}
    };

    // 날짜를 초단위까지 표시 — 위젯은 분까지만 렌더하므로 API의 createdAt 으로 다시 쓴다.
    const pad = (n: number) => String(n).padStart(2, '0');
    const fmtDate = (iso: string, withSec: boolean) => {
      const dt = new Date(iso);
      if (isNaN(dt.getTime())) return null;
      const base = `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())} ${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
      return withSec ? `${base}:${pad(dt.getSeconds())}` : base;
    };
    const showSeconds = async (iframe: HTMLIFrameElement) => {
      try {
        const doc = iframe.contentDocument;
        if (!doc) return;
        // 날짜 div (메타로 이동됐을 수 있어 자손까지 탐색, 분단위인 것만)
        const dateEls = [...doc.querySelectorAll('.my-4 div.text-sm')].filter((el) =>
          /^\d{4}-\d\d-\d\d \d\d:\d\d$/.test((el.textContent || '').trim()),
        );
        if (!dateEls.length) return; // 모두 이미 초 표시됨
        if (secBusy) return; // 동시 실행 방지
        secBusy = true;
        try {
          if (!secCache) {
            const res = await fetch(
              `${CUSDIS_HOST}/api/open/comments?appId=${encodeURIComponent(CUSDIS_APP_ID)}&pageId=${encodeURIComponent(pageId)}&page=1`,
            );
            const j = await res.json();
            const acc: any[] = [];
            const walk = (arr: any[]) => (arr || []).forEach((c) => {(acc.push(c), walk((c.replies && c.replies.data) || []));});
            walk((j && j.data && j.data.data) || []);
            secCache = acc;
          }
        } finally {
          secBusy = false;
        }
        const flat = secCache || [];
        // (작성자|분) → 정렬된 초단위 목록(오래된→최신). 같은 이름·분 충돌 대비.
        const groups: Record<string, string[]> = {};
        flat.forEach((c) => {
          const name = ((c.moderator && c.moderator.displayName) || c.by_nickname || '').trim();
          const min = fmtDate(c.createdAt, false);
          const sec = fmtDate(c.createdAt, true);
          if (!min || !sec) return;
          (groups[`${name}|${min}`] = groups[`${name}|${min}`] || []).push(sec);
        });
        Object.values(groups).forEach((a) => a.sort()); // "YYYY-MM-DD HH:MM:SS" 문자열 정렬 = 시간순
        // 화면상 위→아래(오래된→최신) 순서로 그룹의 초를 하나씩 배정 (충돌해도 각자 자기 초)
        const used: Record<string, number> = {};
        [...dateEls]
          .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top)
          .forEach((el) => {
            const card = (el as HTMLElement).closest('.my-4');
            const nameEl = card && card.querySelector('.font-medium');
            const name = nameEl ? (nameEl.textContent || '').trim() : '';
            const key = `${name}|${(el.textContent || '').trim()}`;
            const arr = groups[key];
            if (!arr || !arr.length) return;
            const i = used[key] || 0;
            used[key] = i + 1;
            const sec = arr[Math.min(i, arr.length - 1)];
            if (sec) el.textContent = sec;
          });
        secDone = true; // 초 적용 패스 완료 → 노출 게이트 통과 가능
      } catch (_) {}
    };

    // 답글(대댓글)도 오래된→최신(최신이 아래)으로 표시. 위젯은 최신을 위로 렌더하므로 재정렬한다.
    // 답글은 부모 카드 내부에 섞여 있어 CSS 역순이 불가 → 시간순으로 DOM 재배치(이미 정렬돼 있으면 아무것도 안 함).
    const orderReplies = (iframe: HTMLIFrameElement) => {
      try {
        const doc = iframe.contentDocument;
        if (!doc) return;
        const tsOf = (el: Element) => {
          const dEl = el.querySelector('div.text-sm'); // 메타로 이동됐을 수 있어 자손까지 탐색
          const t = dEl ? Date.parse((dEl.textContent || '').trim().replace(' ', 'T')) : NaN;
          return isNaN(t) ? 0 : t;
        };
        doc.querySelectorAll('.mt-4 > .my-4').forEach((card) => {
          const replies = [...card.children].filter(
            (el) => el.classList && el.classList.contains('my-4') && el.classList.contains('pl-4'),
          );
          if (replies.length < 2) return;
          if (tsOf(replies[0]) <= tsOf(replies[replies.length - 1])) return; // 이미 오래된→최신
          const anchor = replies[replies.length - 1].nextSibling; // 보통 "댓글" 토글 div
          replies
            .slice()
            .reverse()
            .forEach((r) => card.insertBefore(r, anchor));
        });
      } catch (_) {}
    };

    // 답글 본문 첫 줄의 "@작성자" 태그를 내용 맨 앞 인라인 컬러 태그로(네이버식).
    const styleMentions = (iframe: HTMLIFrameElement) => {
      try {
        const doc = iframe.contentDocument;
        if (!doc) return;
        doc.querySelectorAll('.my-4 > .my-2 > p').forEach((p) => {
          if ((p as HTMLElement).getAttribute('data-mention') === '1') return;
          const first = p.firstChild;
          if (!first || first.nodeType !== 3) return; // 첫 노드가 텍스트가 아니면(=태그 아님) 건너뜀
          const t = (first.textContent || '').trim();
          if (!/^@\S/.test(t)) return;
          // 태그 텍스트 + 뒤따르는 <br> 제거 → 본문이 태그 뒤로 인라인 연결
          const afterFirst = first.nextSibling;
          p.removeChild(first);
          if (afterFirst && afterFirst.nodeName === 'BR') p.removeChild(afterFirst);
          const chip = doc.createElement('span');
          chip.className = 'cusdis-mention';
          chip.textContent = t;
          p.insertBefore(doc.createTextNode(' '), p.firstChild); // 태그와 본문 사이 공백
          p.insertBefore(chip, p.firstChild);
          (p as HTMLElement).setAttribute('data-mention', '1');
        });
      } catch (_) {}
    };

    // 날짜·답글 토글을 내용 아래 한 줄(메타)로 모은다(네이버식). 날짜는 원래 이름 아래에 있던 것을 이동.
    const restructureMeta = (iframe: HTMLIFrameElement) => {
      try {
        const doc = iframe.contentDocument;
        if (!doc) return;
        doc.querySelectorAll('.my-4').forEach((card) => {
          if ((card as HTMLElement).getAttribute('data-meta') === '1') return;
          const kids = [...card.children];
          const date = kids.find((c) => c.tagName === 'DIV' && c.classList.contains('text-sm'));
          const content = kids.find((c) => c.tagName === 'DIV' && c.classList.contains('my-2'));
          // 토글 버튼(댓글/취소)을 직속으로 가진 마지막 div
          const metaDiv = [...kids].reverse().find(
            (c) => c.tagName === 'DIV' && !!c.querySelector(':scope > button'),
          );
          if (!date || !metaDiv || date === metaDiv) return;
          metaDiv.insertBefore(date, metaDiv.firstChild); // 날짜를 답글 버튼 앞으로
          (metaDiv as HTMLElement).classList.add('cusdis-meta');
          // 메타 줄을 내용 바로 아래(답글 앞)로 이동 — 답글이 있어도 날짜가 내용에서 멀어지지 않게
          if (content && content.nextSibling && content.nextSibling !== metaDiv) {
            card.insertBefore(metaDiv, content.nextSibling);
          }
          (card as HTMLElement).setAttribute('data-meta', '1');
        });
      } catch (_) {}
    };

    // 대댓글 접기/펼치기 — 최상위 댓글 메타 줄에 "답글 접기/펼치기" 토글을 넣고 답글 카드를 숨기거나 보인다.
    const repliesOfCard = (card: Element) =>
      [...card.children].filter(
        (c) => c.classList && c.classList.contains('my-4') && c.classList.contains('pl-4'),
      ) as HTMLElement[];
    const applyFold = (card: Element) => {
      const folded = card.getAttribute('data-folded') === '1';
      const replies = repliesOfCard(card);
      replies.forEach((r) => {
        const disp = folded ? 'none' : '';
        if (r.style.display !== disp) r.style.display = disp;
      });
      const btn = card.querySelector(':scope > .cusdis-meta > .cusdis-fold') as HTMLElement | null;
      if (btn) {
        const labelEl = btn.querySelector('.cusdis-fold-label');
        const label = folded ? `답글 ${replies.length}개` : '답글 접기';
        if (labelEl && labelEl.textContent !== label) labelEl.textContent = label;
        btn.classList.toggle('cusdis-fold-open', !folded); // 펼침 상태면 셰브론 위로
      }
    };
    const setupReplyFold = (iframe: HTMLIFrameElement) => {
      try {
        const doc = iframe.contentDocument;
        if (!doc) return;
        doc.querySelectorAll('.mt-4 > .my-4').forEach((card) => {
          const meta = card.querySelector(':scope > .cusdis-meta');
          const hasReplies = repliesOfCard(card).length > 0;
          let btn = meta ? (meta.querySelector(':scope > .cusdis-fold') as HTMLButtonElement | null) : null;
          if (!meta || !hasReplies) {
            if (btn) btn.remove();
            return;
          }
          if (!btn) {
            btn = doc.createElement('button');
            btn.type = 'button';
            btn.className = 'cusdis-fold';
            btn.innerHTML =
              '<span class="cusdis-fold-label"></span>' +
              '<svg class="cusdis-fold-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"></polyline></svg>';
            btn.addEventListener('click', () => {
              card.setAttribute('data-folded', card.getAttribute('data-folded') === '1' ? '0' : '1');
              applyFold(card);
            });
            meta.appendChild(btn);
          }
          applyFold(card);
        });
      } catch (_) {}
    };

    // 제출 중(버튼 텍스트 "전송중...")이면 버튼을 감추고 스피너만 표시, 끝나면 원복.
    const spinnerOnSubmit = (iframe: HTMLIFrameElement) => {
      try {
        const doc = iframe.contentDocument;
        if (!doc) return;
        doc.querySelectorAll('button.bg-gray-200').forEach((btn) => {
          const sending = (btn.textContent || '').includes('전송중');
          (btn as HTMLElement).classList.toggle('cusdis-sending', sending);
        });
      } catch (_) {}
    };

    // 관리자 뱃지(⭐) 흉내 방지: 작성자 이름에 들어간 뱃지 문자를 렌더 시 제거.
    // (진짜 뱃지는 .flex.items-center > .bg-gray-200 별도 요소라 .font-medium 에는 절대 없음)
    const stripFakeBadge = (iframe: HTMLIFrameElement) => {
      try {
        const doc = iframe.contentDocument;
        if (!doc) return;
        doc.querySelectorAll('.flex.items-center .font-medium').forEach((el) => {
          const t = el.textContent || '';
          if (t.includes(KO_LOCALE.mod_badge)) el.textContent = t.split(KO_LOCALE.mod_badge).join('').trim();
        });
      } catch (_) {}
    };

    const injectStyle = (iframe: HTMLIFrameElement) => {
      try {
        const doc = iframe.contentDocument;
        if (doc && doc.head && !doc.getElementById(STYLE_ID)) {
          const st = doc.createElement('style');
          st.id = STYLE_ID;
          st.textContent = BRAND_CSS;
          doc.head.appendChild(st);
        }
      } catch (_) {}
    };

    // 폼 구성:
    //  - 모든 폼 → 이름 + 내용만 (이메일/연락처 미수집, 노출 오해 방지)
    //  - 답글의 답글 폼(.my-4.pl-4 안) → 상단에 @작성자 태그
    const setupForms = (iframe: HTMLIFrameElement) => {
      try {
        const doc = iframe.contentDocument;
        if (!doc) return;
        // 이메일·연락처는 받지 않는다(이름+내용만) — 노출 오해 방지. 모든 폼에서 이메일 칸 숨김.
        doc.querySelectorAll('input[name="email"]').forEach((el) => {
          const emailCell = (el as HTMLElement).closest('.px-1') as HTMLElement | null;
          if (!emailCell || emailCell.style.display === 'none') return;
          emailCell.style.display = 'none';
          const row = emailCell.parentElement as HTMLElement | null;
          if (row) row.style.gridTemplateColumns = '1fr';
        });
        // 답글의 답글 폼(.pl-4 내부)에만 @작성자 태그 표시 (댓글·1단계 답글 폼엔 없음)
        doc.querySelectorAll('textarea[name="reply_content"]').forEach((ta) => {
          const pl4 = (ta as HTMLElement).closest('.my-4.pl-4');
          const form = (ta as HTMLElement).closest('.grid') as HTMLElement | null;
          if (!pl4 || !form || form.querySelector('.cusdis-form-tag')) return;
          const nameEl = pl4.querySelector('.font-medium');
          const author = nameEl ? (nameEl.textContent || '').trim() : '';
          if (!author) return;
          const tag = doc.createElement('div');
          tag.className = 'cusdis-form-tag';
          tag.textContent = `↪︎ @${author}`;
          form.insertBefore(tag, form.firstChild);
        });
      } catch (_) {}
    };

    // 전송 중(제출 버튼 "전송중...")일 때 재클릭(중복 제출) 차단.
    const guardSubmit = (iframe: HTMLIFrameElement) => {
      try {
        const doc = iframe.contentDocument as (Document & {__submitGuarded?: boolean}) | null;
        if (!doc || doc.__submitGuarded) return;
        doc.__submitGuarded = true;
        doc.addEventListener(
          'click',
          (e) => {
            const btn = (e.target as HTMLElement)?.closest?.('button');
            if (!btn || !btn.classList.contains('bg-gray-200')) return;
            if ((btn.textContent || '').includes('전송중')) {
              e.preventDefault();
              e.stopImmediatePropagation();
            }
          },
          true,
        );
      } catch (_) {}
    };

    // 댓글 트리에서 id 를 찾아 {root(최상위 조상), node} 반환 (대댓글 평탄화용)
    const repliesData = (c: any) => (c && c.replies && c.replies.data) || [];
    const locate = (list: any[], id: string, root: any = null): any => {
      for (const c of list || []) {
        const curRoot = root || c;
        if (c.id === id) return {root: curRoot, node: c};
        const f = locate(repliesData(c), id, curRoot);
        if (f) return f;
      }
      return null;
    };

    // 위젯의 fetch 를 가로채, 새 댓글/대댓글 전송 시:
    //  - 이름에서 관리자 뱃지 문자 제거 + 본문 개행 보존(하드 브레이크)
    //  - 답글에 대한 답글이면 깊이를 더하지 않고 루트에 붙이고 @작성자 로 태그(1단계 평탄화)
    const interceptSubmit = (iframe: HTMLIFrameElement) => {
      try {
        const w = iframe.contentWindow as (Window & {fetch: typeof fetch; __submitIntercepted?: boolean}) | null;
        if (!w || w.__submitIntercepted) return;
        w.__submitIntercepted = true;
        const orig = w.fetch.bind(w);
        w.fetch = async (input: any, init?: any) => {
          try {
            const url = typeof input === 'string' ? input : (input && input.url) || '';
            const method = (init && init.method) || (input && input.method) || 'GET';
            if (/\/api\/open\/comments/.test(url) && String(method).toUpperCase() === 'POST' && init && typeof init.body === 'string') {
              const data = JSON.parse(init.body);
              if (data && typeof data.content === 'string') {
                let changed = false;
                // 관리자 뱃지(⭐) 흉내 방지: 이름에서 뱃지 문자 제거
                ['nickname', 'by_nickname'].forEach((k) => {
                  if (typeof data[k] === 'string' && data[k].includes(KO_LOCALE.mod_badge)) {
                    data[k] = data[k].split(KO_LOCALE.mod_badge).join('').trim();
                    changed = true;
                  }
                });
                // 개행 보존: 마크다운 하드 브레이크(공백 2칸 + 개행)
                const md = data.content.replace(/\r\n/g, '\n').replace(/\n/g, '  \n');
                if (md !== data.content) {
                  data.content = md;
                  changed = true;
                }
                // 대댓글 평탄화: 답글에 대한 답글이면 루트에 붙이고 @작성자 태그
                if (data.parentId) {
                  try {
                    const appId = data.appId || CUSDIS_APP_ID;
                    const pageId = data.pageId || data.page_id || '';
                    const r = await orig(
                      `${CUSDIS_HOST}/api/open/comments?appId=${encodeURIComponent(appId)}&pageId=${encodeURIComponent(pageId)}&page=1`,
                    );
                    const j = await r.json();
                    const list = (j && j.data && j.data.data) || [];
                    const loc = locate(list, data.parentId);
                    if (loc && loc.node && loc.root && loc.node.id !== loc.root.id) {
                      const author = (loc.node.moderator && loc.node.moderator.displayName) || loc.node.by_nickname || '';
                      data.parentId = loc.root.id;
                      // 태그를 독립된 줄로(하드브레이크). data.content 는 이미 개행변환된 상태라 여기선 "  \n" 사용.
                      data.content = (author ? `@${author}  \n` : '') + data.content;
                      changed = true;
                    }
                  } catch (_) {}
                }
                if (changed) init = {...init, body: JSON.stringify(data)};
              }
            }
          } catch (_) {}
          return orig(input, init);
        };
      } catch (_) {}
    };

    // 새로고침으로 보존해둔 폼 내용(이름·내용)을 새 iframe 폼에 복원(React 제어 input 대응 네이티브 setter)
    const restoreDraft = (iframe: HTMLIFrameElement) => {
      try {
        const draft = formDraftRef.current;
        if (!draft) return;
        const doc = iframe.contentDocument;
        if (!doc) return;
        const setVal = (el: HTMLInputElement | HTMLTextAreaElement, v: string) => {
          const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
          const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
          if (setter) setter.call(el, v);
          el.dispatchEvent(new Event('input', {bubbles: true}));
        };
        const ta = [...doc.querySelectorAll('textarea')].find((t) => !t.closest('.my-4')) as HTMLTextAreaElement | undefined;
        const nk = [...doc.querySelectorAll('input[name="nickname"]')].find((n) => !n.closest('.my-4')) as HTMLInputElement | undefined;
        if (ta && draft.content) setVal(ta, draft.content);
        if (nk && draft.nick) setVal(nk, draft.nick);
        formDraftRef.current = null; // 한 번만 복원
      } catch (_) {}
    };

    const onReady = () => {
      if (!boundIframe) return;
      injectStyle(boundIframe);
      guardSubmit(boundIframe);
      interceptSubmit(boundIframe);
      setupForms(boundIframe);
      restoreDraft(boundIframe);
      replaceLoading(boundIframe);
      syncHeight(boundIframe);
      updateHeading(boundIframe);
      showSeconds(boundIframe);
      orderReplies(boundIframe);
      styleMentions(boundIframe);
      restructureMeta(boundIframe);
      setupReplyFold(boundIframe);
      stripFakeBadge(boundIframe);
      spinnerOnSubmit(boundIframe);
      maybeReveal(); // 댓글 렌더+정렬 완료 시 오버레이 해제
      try {
        const doc = boundIframe.contentDocument;
        if (doc && doc.body) {
          ro?.disconnect();
          mo?.disconnect();
          // body 를 관찰해야 내용 축소 시에도 ResizeObserver 가 발화한다
          // (iframe 높이가 고정되면 documentElement 크기는 변하지 않음).
          ro = new ResizeObserver(() => {
            // 다음 프레임으로 미뤄 "ResizeObserver loop" 경고 방지
            window.requestAnimationFrame(() => boundIframe && syncHeight(boundIframe));
          });
          ro.observe(doc.body);
          mo = new MutationObserver(() => {
            if (!boundIframe) return;
            injectStyle(boundIframe);
            setupForms(boundIframe); // 새로 생긴 답글 폼도 간소화 + 태그 처리
            replaceLoading(boundIframe);
            maybeReloadAfterSubmit();
            orderReplies(boundIframe);
            styleMentions(boundIframe);
            restructureMeta(boundIframe);
            setupReplyFold(boundIframe);
            stripFakeBadge(boundIframe);
            spinnerOnSubmit(boundIframe);
            showSeconds(boundIframe); // 초 적용(캐시로 재fetch 없음) — 적용되면 다음 사이클에 게이트 통과
            maybeReveal(); // 댓글 렌더+정렬+초 적용 완료 시 오버레이 해제
            syncHeight(boundIframe);
            updateHeading(boundIframe);
          });
          mo.observe(doc.body, {subtree: true, childList: true, attributes: true, characterData: true});
        }
      } catch (_) {}
    };

    const attach = () => {
      const thread = document.getElementById('cusdis_thread');
      const iframe = thread?.querySelector('iframe') as HTMLIFrameElement | null;
      if (!iframe) return false;
      boundIframe = iframe;
      iframe.addEventListener('load', onReady);
      onReady(); // srcdoc 이 이미 로드됐을 수 있음
      // 안전망: 초기 몇 초간 주기적으로 동기화
      let n = 0;
      iv = setInterval(() => {
        if (boundIframe) {
          syncHeight(boundIframe);
          updateHeading(boundIframe);
        }
        if (++n > 20) iv && clearInterval(iv);
      }, 300);
      return true;
    };

    poll = setInterval(() => {
      if (attach()) poll && clearInterval(poll);
    }, 200);
    giveUp = setTimeout(() => poll && clearInterval(poll), 10000);

    return () => {
      poll && clearInterval(poll);
      giveUp && clearTimeout(giveUp);
      iv && clearInterval(iv);
      submitTimer && clearTimeout(submitTimer);
      secTimer && clearTimeout(secTimer);
      clearTimeout(revealFallback);
      ro?.disconnect();
      mo?.disconnect();
      boundIframe?.removeEventListener('load', onReady);
    };
  }, [pageId, reloadKey]);

  return (
    <div style={{marginTop: '2.5rem'}}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.3rem',
          margin: '0 0 0.8rem',
          paddingBottom: '0.5rem',
          borderBottom: '2px solid #f1e9dc',
        }}>
        <h3 id="cusdis-heading" style={{fontSize: '0.9rem', fontWeight: 700, color: '#3a3a3a', margin: 0}}>
          댓글
        </h3>
        <button
          type="button"
          onClick={() => {
            // 새로고침 시 작성 중이던 폼 내용(이름·내용) 보존 → 리로드 후 복원
            try {
              const ifr = document.querySelector('#cusdis_thread iframe') as HTMLIFrameElement | null;
              const d = ifr && ifr.contentDocument;
              if (d) {
                const ta = [...d.querySelectorAll('textarea')].find((t) => !t.closest('.my-4')) as HTMLTextAreaElement | undefined;
                const nk = [...d.querySelectorAll('input[name="nickname"]')].find((n) => !n.closest('.my-4')) as HTMLInputElement | undefined;
                const draft = {nick: nk ? nk.value : '', content: ta ? ta.value : ''};
                formDraftRef.current = draft.nick || draft.content ? draft : null;
              }
            } catch (_) {}
            // 리마운트 중 컨테이너가 0으로 줄었다 새 iframe 기본높이로 커졌다 하며
            // 페이지 높이가 튀는 것을 막기 위해, 현재 높이를 고정해 둔다(오버레이가 가림).
            const cur = document.getElementById('cusdis_thread')?.offsetHeight || 0;
            if (cur) setFrozenHeight(cur);
            setReloading(true);
            setReloadKey((k) => k + 1); // 리마운트 → effect 가 정렬 후 오버레이 해제(+안전장치 타임아웃)
          }}
          title="댓글 새로고침"
          aria-label="댓글 새로고침"
          className="cusdis-refresh-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 12a9 9 0 1 1-2.64-6.36" />
            <path d="M21 3v6h-6" />
          </svg>
        </button>
      </div>
      <div
        style={{
          position: 'relative',
          // 새로고침 중에는 직전 높이로 고정 + 넘침 숨김 → 리마운트로 인한 높이 튐 방지
          ...(reloading && frozenHeight ? {height: frozenHeight, overflow: 'hidden'} : {}),
        }}>
        {reloading && (
          <div
            className="cusdis-loading"
            role="status"
            aria-label="댓글 새로고침 중"
            style={{position: 'absolute', inset: 0, background: '#fff', zIndex: 2}}
          />
        )}
        <div
          key={reloadKey}
          id="cusdis_thread"
          style={{opacity: reloading ? 0 : 1}}
          data-host={CUSDIS_HOST}
          data-app-id={CUSDIS_APP_ID}
          data-page-id={pageId}
          data-page-url={typeof window !== 'undefined' ? window.location.href : ''}
          data-page-title={typeof document !== 'undefined' ? document.title : ''}
        />
      </div>
    </div>
  );
}

export default function CusdisComments() {
  // App ID 미설정 시 위젯을 렌더링하지 않음
  if (!CUSDIS_APP_ID) {
    return null;
  }
  return (
    <BrowserOnly fallback={<div className="cusdis-loading" role="status" aria-label="댓글 불러오는 중" />}>
      {() => <CusdisThread />}
    </BrowserOnly>
  );
}
