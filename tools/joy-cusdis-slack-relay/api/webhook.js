// Cusdis Webhook → Slack 알림 중계 함수 (Vercel 서버리스)
//
// 흐름: 새 댓글 → Cusdis Webhook → (이 함수) → ①자동승인 + ②Slack 알림
//   - 대댓글이면, 부모(루트) 댓글의 Slack 메시지 "스레드"에 이어서 표시(Vercel KV 매핑 사용)
//
// 환경변수:
//   SLACK_BOT_TOKEN   chat.postMessage 로 전송(ts 확보). 스레드 중첩에 필요
//   SLACK_CHANNEL_ID  알림 보낼 채널 ID. 스레드 중첩에 필요
//   SLACK_WEBHOOK_URL 위 둘이 없을 때 폴백(Incoming Webhook, 스레드 불가)
//   CUSDIS_APP_ID     루트 댓글 조회용
//   KV_REST_API_URL / KV_REST_API_TOKEN (또는 UPSTASH_REDIS_REST_URL / _TOKEN)
//                     Upstash Redis — 댓글ID→슬랙 메시지 ts 매핑(스레드 중첩)
//   SITE_URL          게시글 링크 도메인(기본 https://joylangcenter.com)
//
// 스레드 중첩: 최상위 댓글 알림의 ts 를 KV 에 저장 → 대댓글이 오면 루트 댓글의 ts 를 조회해
// 그 스레드에 이어서 전송. (SLACK_BOT_TOKEN + SLACK_CHANNEL_ID + KV 필요)

const CUSDIS_HOST = 'https://cusdis.com';

function extractToken(link) {
  try {
    return new URL(link).searchParams.get('token') || '';
  } catch (_) {
    return '';
  }
}
function commentIdFromToken(token) {
  try {
    return JSON.parse(Buffer.from(String(token).split('.')[1], 'base64url').toString('utf8')).commentId || null;
  } catch (_) {
    return null;
  }
}
async function autoApprove(token) {
  try {
    if (!token) return;
    await fetch(`${CUSDIS_HOST}/api/open/approve?token=${encodeURIComponent(token)}`, {method: 'GET'});
  } catch (_) {}
}

async function fetchTopComments(appId, pageId) {
  try {
    const r = await fetch(
      `${CUSDIS_HOST}/api/open/comments?appId=${encodeURIComponent(appId)}&pageId=${encodeURIComponent(pageId)}&page=1`,
    );
    const j = await r.json();
    return (j && j.data && j.data.data) || [];
  } catch (_) {
    return [];
  }
}
const repliesOf = (c) => (c && c.replies && c.replies.data) || [];
function findDeep(list, id) {
  for (const c of list || []) {
    if (c.id === id) return c;
    const f = findDeep(repliesOf(c), id);
    if (f) return f;
  }
  return null;
}
// ── KV(Upstash Redis REST) — 댓글ID→슬랙 메시지 매핑 (있으면 우선 사용) ──
// Upstash 연결 시 환경변수에 접두어(예: JOY_)가 붙을 수 있어, 접미어로 자동 탐지한다.
function envBySuffix(...suffixes) {
  for (const [k, v] of Object.entries(process.env)) {
    if (v && suffixes.some((s) => k.endsWith(s))) return v;
  }
  return undefined;
}
const KV_URL = () => envBySuffix('KV_REST_API_URL', 'UPSTASH_REDIS_REST_URL');
const KV_TOKEN = () => envBySuffix('KV_REST_API_TOKEN', 'UPSTASH_REDIS_REST_TOKEN');
const kvEnabled = () => !!(KV_URL() && KV_TOKEN());
async function kvGet(key) {
  if (!kvEnabled()) return null;
  try {
    const r = await fetch(`${KV_URL()}/get/${encodeURIComponent(key)}`, {headers: {Authorization: `Bearer ${KV_TOKEN()}`}});
    const j = await r.json();
    return j && j.result ? JSON.parse(j.result) : null;
  } catch (_) {
    return null;
  }
}
async function kvSet(key, val, ttlSec) {
  if (!kvEnabled()) return;
  try {
    const cmd = ['SET', key, JSON.stringify(val)];
    if (ttlSec) cmd.push('EX', String(ttlSec));
    await fetch(KV_URL(), {
      method: 'POST',
      headers: {Authorization: `Bearer ${KV_TOKEN()}`, 'Content-Type': 'application/json'},
      body: JSON.stringify(cmd),
    });
  } catch (_) {}
}

// Slack 전송: 봇 토큰+채널이면 chat.postMessage(ts 반환), 아니면 Incoming Webhook 폴백
async function postSlack({text, blocks, threadTs}) {
  const botToken = process.env.SLACK_BOT_TOKEN;
  const channel = process.env.SLACK_CHANNEL_ID;
  if (botToken && channel) {
    try {
      const r = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {'Content-Type': 'application/json', Authorization: `Bearer ${botToken}`},
        body: JSON.stringify({channel, text, blocks, unfurl_links: false, unfurl_media: false, ...(threadTs ? {thread_ts: threadTs} : {})}),
      });
      const j = await r.json();
      if (j.ok) return {ts: j.ts, channel: j.channel};
    } catch (_) {}
    return null;
  }
  const url = process.env.SLACK_WEBHOOK_URL;
  if (url) {
    try {
      await fetch(url, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({text, blocks, unfurl_links: false, unfurl_media: false})});
    } catch (_) {}
  }
  return null;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({error: 'Method Not Allowed'});

  const body = req.body || {};
  if (body.type && body.type !== 'new_comment') return res.status(200).json({ok: true, skipped: body.type});

  const SITE_URL = (process.env.SITE_URL || 'https://joylangcenter.com').replace(/\/+$/, '');
  const appId = process.env.CUSDIS_APP_ID;

  const d = body.data || body;
  const nickname = d.by_nickname || '익명';
  const content = String(d.content || '').trim();
  // by_email 은 "이메일|tel:전화" 형태로 올 수 있다(위젯에서 합쳐 보냄)
  const rawContact = String(d.by_email || d.email || '').trim();
  let email = rawContact;
  let phone = '';
  const ti = rawContact.indexOf('|tel:');
  if (ti >= 0) {
    phone = rawContact.slice(ti + 5).trim();
    email = rawContact.slice(0, ti).trim();
  }
  const pageId = d.page_id || d.pageId || '';
  const pageTitle = d.page_title || d.project_title || pageId || '게시글';
  const token = extractToken(d.approve_link || '');
  const commentId = commentIdFromToken(token);

  let pageUrl = d.page_url || d.pageUrl || '';
  if (!pageUrl && pageId) {
    pageUrl = /^https?:\/\//.test(pageId) ? pageId : SITE_URL + (pageId.startsWith('/') ? pageId : '/' + pageId);
  }
  const pageLine = pageUrl ? `<${pageUrl}|${pageTitle}>` : pageTitle;

  // 자동승인
  await autoApprove(token);

  // 루트(최상위 조상) 찾기 — 대댓글 여부/스레드 대상용
  // (답글은 위젯에서 루트에 평탄화되어 붙고, 대댓글의 답글은 본문에 @작성자 태그가 들어온다)
  let rootId = commentId;
  let isReply = false;
  if (appId && commentId) {
    let tree = await fetchTopComments(appId, pageId);
    if (!findDeep(tree, commentId)) {
      await sleep(900); // 방금 승인된 댓글이 목록에 반영될 시간
      tree = await fetchTopComments(appId, pageId);
    }
    for (const top of tree) {
      if (findDeep([top], commentId)) {
        rootId = top.id;
        isReply = top.id !== commentId;
        break;
      }
    }
  }

  // 평탄화된 답글은 본문 첫 줄이 "@작성자" 태그 → 본문과 분리해 별도 줄로 표시
  let mention = '';
  let rawBody = content || '(내용 없음)';
  const mMatch = rawBody.match(/^@[^\n]+/);
  if (mMatch) {
    mention = mMatch[0].trim();
    rawBody = rawBody.slice(mMatch[0].length).replace(/^[ \t]*\n/, '');
  }
  const bodyText = rawBody.replace(/[ \t]+\n/g, '\n').trim() || '(내용 없음)'; // 하드브레이크 잔여 공백 제거
  const quoted = bodyText.split('\n').map((l) => `> ${l}`).join('\n'); // 본문은 인용(blockquote)
  const lines = [];
  // 게시글 제목을 맨 위에(라벨 없이). 대댓글은 루트 스레드에 이미 있으므로 생략.
  if (!isReply) lines.push(`📄 ${pageLine}`);
  lines.push(`↪︎ *${nickname}*님이 댓글을 달았습니다`); // 작성자 볼드
  if (mention) lines.push(`*${mention}* 님에게`); // 답글의 답글이면 태그 표시
  lines.push(quoted);
  if (phone) lines.push(`> 📞 ${phone}`);
  if (email) lines.push(`> ✉️ ${email}`);
  const summary = lines.join('\n');

  const blocks = [{type: 'section', text: {type: 'mrkdwn', text: summary}}];
  if (token) {
    const btnValue = JSON.stringify({t: token, p: pageId});
    blocks.push({
      type: 'actions',
      block_id: 'comment_actions',
      elements: [
        {type: 'button', action_id: 'reply_comment', text: {type: 'plain_text', text: '↩︎ 답글', emoji: true}, value: btnValue},
        {
          type: 'button',
          action_id: 'delete_comment',
          style: 'danger',
          text: {type: 'plain_text', text: '🗑 삭제', emoji: true},
          value: btnValue,
          confirm: {
            title: {type: 'plain_text', text: '댓글 삭제'},
            text: {type: 'mrkdwn', text: '이 댓글을 삭제할까요? (하위 대댓글도 함께 삭제됩니다)'},
            confirm: {type: 'plain_text', text: '삭제'},
            deny: {type: 'plain_text', text: '취소'},
            style: 'danger',
          },
        },
      ],
    });
  }

  // 대댓글이면 루트 댓글의 슬랙 메시지 ts 를 KV 에서 찾아 그 스레드에 이어서 전송
  let threadTs = null;
  if (isReply) {
    const fromKv = await kvGet(`cusdis:ts:${rootId}`);
    if (fromKv && fromKv.ts) threadTs = fromKv.ts;
  }

  const sent = await postSlack({text: summary, blocks, threadTs});

  // 최상위 댓글은 슬랙 메시지 ts + 승인 토큰을 KV 에 저장(대댓글 스레드 연결 + 슬랙 답글 평탄화용, 90일)
  if (!isReply && commentId && sent && sent.ts) {
    await kvSet(`cusdis:ts:${commentId}`, {channel: sent.channel, ts: sent.ts, token}, 60 * 60 * 24 * 90);
  }

  return res.status(200).json({ok: true, threaded: !!threadTs});
}
