// 게시글 조회수 카운터 (Vercel 서버리스 + Upstash Redis)
//
// 흐름: 홈페이지(정적) → 이 함수 → Upstash Redis 의 글별 카운터(INCR/MGET)
//   - POST /api/views  { id }            → 해당 글 조회수 +1, 최신값 반환
//   - GET  /api/views?ids=/blog/a,/blog/b → 여러 글 조회수 일괄 조회
//
// 중복 방지(기기당 하루 1회)는 클라이언트(localStorage)에서 판단하고,
// 이 함수는 요청이 오면 그대로 INCR 한다. 키는 `views:<permalink>`.
//
// 환경변수: KV_REST_API_URL / KV_REST_API_TOKEN
//   (또는 UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN) — webhook.js 와 동일한 Upstash 인스턴스.

// Upstash 연결 시 환경변수에 접두어(예: JOY_)가 붙을 수 있어 접미어로 자동 탐지한다.
function envBySuffix(...suffixes) {
  for (const [k, v] of Object.entries(process.env)) {
    if (v && suffixes.some((s) => k.endsWith(s))) return v;
  }
  return undefined;
}
const KV_URL = () => envBySuffix('KV_REST_API_URL', 'UPSTASH_REDIS_REST_URL');
const KV_TOKEN = () => envBySuffix('KV_REST_API_TOKEN', 'UPSTASH_REDIS_REST_TOKEN');
const kvEnabled = () => !!(KV_URL() && KV_TOKEN());

// Upstash Redis REST — 명령 배열([ "INCR", key ] 등) 실행 후 result 반환
async function redis(cmd) {
  const r = await fetch(KV_URL(), {
    method: 'POST',
    headers: {Authorization: `Bearer ${KV_TOKEN()}`, 'Content-Type': 'application/json'},
    body: JSON.stringify(cmd),
  });
  const j = await r.json();
  return j && 'result' in j ? j.result : null;
}

// 허용 id: /blog/... 경로만 (임의 키 증가 방지). 끝 슬래시 제거.
function normId(raw) {
  const id = String(raw || '').trim().replace(/\/+$/, '');
  return /^\/blog\/[\w\-./]+$/.test(id) ? id : null;
}
const keyOf = (id) => `views:${id}`;

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (!kvEnabled()) return res.status(200).json({ok: false, error: 'kv_disabled', counts: {}});

  try {
    if (req.method === 'GET') {
      const raw = String(req.query.ids || '');
      const ids = raw.split(',').map(normId).filter(Boolean);
      if (!ids.length) return res.status(200).json({ok: true, counts: {}});
      const vals = ids.length ? await redis(['MGET', ...ids.map(keyOf)]) : [];
      const counts = {};
      ids.forEach((id, i) => {
        counts[id] = parseInt((vals && vals[i]) || '0', 10) || 0;
      });
      return res.status(200).json({ok: true, counts});
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
      const id = normId(body.id);
      if (!id) return res.status(400).json({ok: false, error: 'invalid_id'});
      const count = parseInt(await redis(['INCR', keyOf(id)]), 10) || 0;
      return res.status(200).json({ok: true, id, count});
    }

    return res.status(405).json({ok: false, error: 'method_not_allowed'});
  } catch (e) {
    return res.status(200).json({ok: false, error: 'kv_error', counts: {}});
  }
}
