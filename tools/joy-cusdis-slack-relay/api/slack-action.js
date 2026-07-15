// Slack 인터랙션(버튼/모달) 처리 → Cusdis 댓글 삭제·답글·수정 (Vercel 서버리스)
//
//   [🗑 삭제]     원본 댓글 삭제 → 원본 메시지의 버튼을 없애고 "🗑 삭제됨" 표시
//   [↩︎ 답글]     모달 입력 → 관리자 답글 등록 → 스레드에 결과 메시지([✏️수정][🗑답글삭제] 버튼)
//   [✏️ 수정]     모달(기존 내용 prefill) → 삭제 후 재등록 → 기존 결과 메시지를 "수정 전/후"로 덮어씀
//   [🗑 삭제]/[🗑 답글삭제] 는 하위 대댓글까지 연쇄 삭제한다.
//
// 환경변수: SLACK_SIGNING_SECRET(필수), SLACK_BOT_TOKEN(필수), CUSDIS_APP_ID(답글 수정/삭제용)

import crypto from 'crypto';

export const config = {api: {bodyParser: false}};

const CUSDIS_HOST = 'https://cusdis.com';
const MAX_C = 1000;

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.setEncoding('utf8');
    req.on('data', (c) => (data += c));
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

function verifySignature(rawBody, headers, secret) {
  const ts = headers['x-slack-request-timestamp'];
  const sig = headers['x-slack-signature'];
  if (!ts || !sig) return false;
  if (Math.abs(Date.now() / 1000 - Number(ts)) > 300) return false;
  const mine = 'v0=' + crypto.createHmac('sha256', secret).update(`v0:${ts}:${rawBody}`).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(mine), Buffer.from(sig));
  } catch (_) {
    return false;
  }
}

const parseVal = (s) => {
  try {
    return JSON.parse(s);
  } catch (_) {
    return {};
  }
};

function commentIdFromToken(token) {
  try {
    return JSON.parse(Buffer.from(String(token).split('.')[1], 'base64url').toString('utf8')).commentId || null;
  } catch (_) {
    return null;
  }
}

// ── Slack 응답 헬퍼 ──
// 모달 제출 오류: 모달 안 입력창 아래에 빨간 안내 텍스트(입력 내용 유지, 모달 유지)
const modalError = (res, msg) =>
  res.status(200).json({response_action: 'errors', errors: {reply_block: msg}});
// 버튼이 있던 원본/결과 메시지를 갱신(덮어쓰기)
async function updateMessage(responseUrl, text, blocks) {
  try {
    await fetch(responseUrl, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({replace_original: true, text, blocks}),
    });
  } catch (_) {}
}
async function postThread(botToken, channel, threadTs, text, blocks) {
  try {
    await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {'Content-Type': 'application/json', Authorization: `Bearer ${botToken}`},
      body: JSON.stringify({channel, thread_ts: threadTs, text, unfurl_links: false, unfurl_media: false, ...(blocks ? {blocks} : {})}),
    });
  } catch (_) {}
}
async function chatUpdate(botToken, channel, ts, text, blocks) {
  try {
    await fetch('https://slack.com/api/chat.update', {
      method: 'POST',
      headers: {'Content-Type': 'application/json', Authorization: `Bearer ${botToken}`},
      body: JSON.stringify({channel, ts, text, ...(blocks ? {blocks} : {})}),
    });
  } catch (_) {}
}

// ── Cusdis 조회 ──
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
// 트리 전체(대댓글 포함)에서 id 로 댓글 찾기 — 중첩 댓글도 삭제/수정 가능하게
function findDeep(list, id) {
  for (const c of list || []) {
    if (c.id === id) return c;
    const found = findDeep(repliesOf(c), id);
    if (found) return found;
  }
  return null;
}
const repliesOf = (parent) => (parent && parent.replies && parent.replies.data) || [];
function latestModReplyId(parent) {
  const mods = repliesOf(parent).filter((x) => x.moderatorId);
  mods.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return mods[0] ? mods[0].id : null;
}
// 댓글 + 모든 하위 대댓글 id 수집
function collectIds(comment) {
  let ids = [comment.id];
  for (const r of repliesOf(comment)) ids = ids.concat(collectIds(r));
  return ids;
}
// 대상 댓글과 모든 자식(대댓글)까지 연쇄 삭제. 트리에서 못 찾으면 id 로 단건 삭제(멱등).
async function deleteCascade(appId, pageId, id) {
  if (!id) return 0;
  let ids = [id];
  if (appId) {
    const target = findDeep(await fetchTopComments(appId, pageId), id);
    if (target) ids = collectIds(target);
  }
  for (const cid of ids) {
    try {
      await fetch(`${CUSDIS_HOST}/api/comment/${cid}`, {method: 'DELETE'});
    } catch (_) {}
  }
  return ids.length;
}
async function postReply(token, content) {
  try {
    // Cusdis 는 본문을 마크다운으로 렌더 → 단일 줄바꿈이 무시된다.
    // 줄바꿈을 하드 브레이크(공백 2칸 + 개행)로 변환해 개행을 보존한다.
    const md = String(content || '').replace(/\r\n/g, '\n').replace(/\n/g, '  \n');
    const r = await fetch(`${CUSDIS_HOST}/api/open/approve?token=${encodeURIComponent(token)}`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({replyContent: md}),
    });
    return {limited: r.status === 402, ok: r.status !== 402};
  } catch (_) {
    return {ok: false};
  }
}
// 부모(스레드 루트) 삭제 시, 그 스레드의 대댓글 알림들도 "삭제됨"으로 갱신
// (conversations.replies 조회에 channels:history[공개]/groups:history[비공개] 스코프 필요)
async function markThreadRepliesDeleted(botToken, channel, rootTs) {
  try {
    const r = await fetch(
      `https://slack.com/api/conversations.replies?channel=${encodeURIComponent(channel)}&ts=${encodeURIComponent(rootTs)}&limit=200`,
      {headers: {Authorization: `Bearer ${botToken}`}},
    );
    const j = await r.json();
    if (!j.ok) return;
    for (const m of j.messages || []) {
      if (m.ts === rootTs) continue; // 루트(부모)는 이미 갱신됨
      // 내용(섹션)은 그대로 두고, 버튼(actions)만 제거하고 "삭제됨" 표시 추가
      const kept = (m.blocks || []).filter((b) => b.type === 'section');
      const blocks = [...kept, contextOf('🗑 상위 댓글 삭제로 함께 삭제됨')];
      await chatUpdate(botToken, channel, m.ts, '🗑 삭제됨', blocks);
    }
  } catch (_) {}
}

// ── KV(Upstash Redis REST) — 루트 댓글의 승인 토큰 조회(슬랙 답글 평탄화용) ──
function envBySuffix(...suffixes) {
  for (const [k, v] of Object.entries(process.env)) {
    if (v && suffixes.some((s) => k.endsWith(s))) return v;
  }
  return undefined;
}
const KV_URL = () => envBySuffix('KV_REST_API_URL', 'UPSTASH_REDIS_REST_URL');
const KV_TOKEN = () => envBySuffix('KV_REST_API_TOKEN', 'UPSTASH_REDIS_REST_TOKEN');
async function kvGet(key) {
  if (!(KV_URL() && KV_TOKEN())) return null;
  try {
    const r = await fetch(`${KV_URL()}/get/${encodeURIComponent(key)}`, {headers: {Authorization: `Bearer ${KV_TOKEN()}`}});
    const j = await r.json();
    return j && j.result ? JSON.parse(j.result) : null;
  } catch (_) {
    return null;
  }
}
const displayNameOf = (c) => (c && ((c.moderator && c.moderator.displayName) || c.by_nickname)) || '';
// 대상 댓글이 답글이면 루트로 평탄화(루트 토큰 + @작성자 태그)해 깊이를 1단계로 맞춘다.
// 반환: {token, content, parentId} — KV 미스/최상위면 원래 값 유지.
async function flattenReplyTarget(appId, pageId, token, content) {
  const targetId = commentIdFromToken(token);
  if (!appId || !targetId) return {token, content, parentId: targetId};
  const tree = await fetchTopComments(appId, pageId);
  let rootId = targetId;
  for (const top of tree) {
    if (findDeep([top], targetId)) {
      rootId = top.id;
      break;
    }
  }
  if (rootId === targetId) return {token, content, parentId: targetId}; // 최상위 → 그대로
  const rootInfo = await kvGet(`cusdis:ts:${rootId}`);
  if (!rootInfo || !rootInfo.token) return {token, content, parentId: targetId}; // 루트 토큰 없음 → 폴백
  const author = displayNameOf(findDeep(tree, targetId));
  return {token: rootInfo.token, content: (author ? `@${author}\n` : '') + content, parentId: rootId};
}

// ── 블록 구성 ──
const sectionOf = (text) => ({type: 'section', text: {type: 'mrkdwn', text}});
const contextOf = (text) => ({type: 'context', elements: [{type: 'mrkdwn', text}]});
// 여러 줄을 인용블록으로 (Slack 의 > 는 한 줄만 인용하므로 각 줄에 붙인다)
const blockquote = (s) => '> ' + String(s || '').replace(/\n/g, '\n> ');
function summarySection(payload) {
  const blocks = (payload.message && payload.message.blocks) || [];
  const s = blocks.find((b) => b.type === 'section' && b.text && b.text.text);
  return s ? {type: 'section', text: {type: 'mrkdwn', text: s.text.text}} : sectionOf((payload.message && payload.message.text) || '댓글');
}
// 답글 결과 메시지: 텍스트 + [✏️수정][🗑답글삭제] 버튼(replyId 있을 때만)
function replyResultBlocks(text, {token, pageId, replyId, content}) {
  const blocks = [sectionOf(text)];
  if (replyId) {
    const v = JSON.stringify({t: token, p: pageId, r: replyId, c: String(content || '').slice(0, MAX_C)});
    blocks.push({
      type: 'actions',
      elements: [
        {type: 'button', action_id: 'edit_reply', text: {type: 'plain_text', text: '✏️ 수정'}, value: v},
        {
          type: 'button',
          action_id: 'delete_reply',
          style: 'danger',
          text: {type: 'plain_text', text: '🗑 답글 삭제'},
          value: v,
          confirm: {
            title: {type: 'plain_text', text: '답글 삭제'},
            text: {type: 'mrkdwn', text: '이 답글을 삭제할까요?'},
            confirm: {type: 'plain_text', text: '삭제'},
            deny: {type: 'plain_text', text: '취소'},
            style: 'danger',
          },
        },
      ],
    });
  }
  return blocks;
}

async function openReplyModal(botToken, triggerId, {callback, pm, initial}) {
  try {
    await fetch('https://slack.com/api/views.open', {
      method: 'POST',
      headers: {'Content-Type': 'application/json', Authorization: `Bearer ${botToken}`},
      body: JSON.stringify({
        trigger_id: triggerId,
        view: {
          type: 'modal',
          callback_id: callback,
          private_metadata: JSON.stringify(pm),
          title: {type: 'plain_text', text: callback === 'edit_modal' ? '답글 수정' : '답글 작성'},
          submit: {type: 'plain_text', text: callback === 'edit_modal' ? '수정' : '등록'},
          close: {type: 'plain_text', text: '취소'},
          blocks: [
            {
              type: 'input',
              block_id: 'reply_block',
              label: {type: 'plain_text', text: '답글 내용'},
              element: {
                type: 'plain_text_input',
                action_id: 'reply_input',
                multiline: true,
                ...(initial ? {initial_value: initial} : {}),
              },
            },
          ],
        },
      }),
    });
  } catch (_) {}
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const signingSecret = process.env.SLACK_SIGNING_SECRET;
  const botToken = process.env.SLACK_BOT_TOKEN;
  const appId = process.env.CUSDIS_APP_ID;
  if (!signingSecret) return res.status(500).send('SLACK_SIGNING_SECRET 미설정');

  const rawBody = await readRawBody(req);
  if (!verifySignature(rawBody, req.headers, signingSecret)) return res.status(401).send('Invalid signature');

  let payload;
  try {
    payload = JSON.parse(new URLSearchParams(rawBody).get('payload'));
  } catch (_) {
    return res.status(400).send('Bad payload');
  }

  // ===== 버튼 클릭 =====
  if (payload.type === 'block_actions') {
    const action = (payload.actions && payload.actions[0]) || {};
    const v = parseVal(action.value);
    const responseUrl = payload.response_url;
    const channel = payload.channel && payload.channel.id;
    const user = payload.user && payload.user.id;
    const msgTs = payload.message && payload.message.ts; // 클릭된 메시지 ts

    // 원본 댓글 삭제 → 자식 대댓글까지 연쇄 삭제, 버튼 제거 + "삭제됨"
    if (action.action_id === 'delete_comment') {
      await deleteCascade(appId, v.p, commentIdFromToken(v.t));
      await updateMessage(responseUrl, '🗑 삭제됨', [summarySection(payload), contextOf('🗑 삭제됨')]);
      // 스레드 루트(최상위 댓글) 삭제면, 그 스레드의 대댓글 알림들도 "삭제됨"으로 표시
      // (답글 달린 루트는 thread_ts 가 자기 ts 와 같음 → 이 경우도 루트로 취급)
      const mts = payload.message || {};
      const isRoot = !mts.thread_ts || mts.thread_ts === mts.ts;
      if (botToken && channel && msgTs && isRoot) {
        await markThreadRepliesDeleted(botToken, channel, msgTs);
      }
      return res.status(200).end();
    }

    // 답글 달기 (모달)
    if (action.action_id === 'reply_comment') {
      if (botToken) {
        await openReplyModal(botToken, payload.trigger_id, {
          callback: 'reply_modal',
          pm: {t: v.t, p: v.p, ch: channel, root: msgTs}, // root = 원본 메시지 ts (스레드 기준)
          initial: '',
        });
      }
      return res.status(200).end();
    }

    // 답글 삭제 → 그 답글의 하위까지 연쇄 삭제, 버튼 제거 + "삭제됨"
    if (action.action_id === 'delete_reply') {
      await deleteCascade(appId, v.p, v.r);
      await updateMessage(responseUrl, '🗑 삭제됨', [summarySection(payload), contextOf('🗑 삭제됨')]);
      return res.status(200).end();
    }

    // 답글 수정 (모달, 기존 내용 prefill)
    if (action.action_id === 'edit_reply') {
      if (botToken) {
        await openReplyModal(botToken, payload.trigger_id, {
          callback: 'edit_modal',
          // ch/ts = 이 결과 메시지를 덮어쓰기(chat.update) 위한 좌표, prev = 수정 전 내용,
          // root = 스레드 루트(실패 시 힌트를 남길 위치)
          pm: {t: v.t, p: v.p, r: v.r, prev: v.c || '', ch: channel, ts: msgTs, root: (payload.message && payload.message.thread_ts) || msgTs},
          initial: v.c || '',
        });
      }
      return res.status(200).end();
    }

    return res.status(200).end();
  }

  // ===== 모달 제출 =====
  if (payload.type === 'view_submission') {
    const cb = payload.view && payload.view.callback_id;
    let meta = {};
    try {
      meta = JSON.parse(payload.view.private_metadata || '{}');
    } catch (_) {}
    const content = (payload.view.state?.values?.reply_block?.reply_input?.value || '').trim();

    // 새 답글 → 스레드에 결과 메시지(신규) 추가
    if (cb === 'reply_modal') {
      // 대상이 답글이면 루트로 평탄화(깊이 1단계) + @작성자 태그 — 프론트와 동일
      const f = await flattenReplyTarget(appId, meta.p, meta.t, content);
      const r = await postReply(f.token, f.content);
      if (r.limited) return modalError(res, '⚠️ 무료 플랜 답글 한도를 초과했어요.');
      let replyId = null;
      if (appId) replyId = latestModReplyId(findDeep(await fetchTopComments(appId, meta.p), f.parentId));
      const text = `↩︎ 답글을 등록했어요:\n${blockquote(f.content)}`;
      await postThread(botToken, meta.ch, meta.root, text, replyResultBlocks(text, {token: f.token, pageId: meta.p, replyId, content: f.content}));
      return res.status(200).json({response_action: 'clear'});
    }

    // 답글 수정 = 재등록 성공 후 기존 삭제 → 기존 결과 메시지를 덮어쓰기(수정 전/후)
    // (먼저 삭제하면 402 등으로 재등록 실패 시 답글이 사라지므로 순서 주의)
    if (cb === 'edit_modal') {
      const r = await postReply(meta.t, content);
      // 재등록 실패(한도초과): 기존 답글 유지, 모달에 오류 표시
      if (r.limited) return modalError(res, '⚠️ 무료 플랜 답글 한도를 초과해 수정하지 못했어요.');
      // 재등록 성공 → 기존 답글 삭제
      try {
        await fetch(`${CUSDIS_HOST}/api/comment/${meta.r}`, {method: 'DELETE'});
      } catch (_) {}
      let replyId = null;
      if (appId) replyId = latestModReplyId(findDeep(await fetchTopComments(appId, meta.p), commentIdFromToken(meta.t)));
      const text = `✏️ 답글을 수정했어요\n*수정 전*\n${blockquote(meta.prev || '(없음)')}\n*수정 후*\n${blockquote(content)}`;
      await chatUpdate(botToken, meta.ch, meta.ts, text, replyResultBlocks(text, {token: meta.t, pageId: meta.p, replyId, content}));
      return res.status(200).json({response_action: 'clear'});
    }

    return res.status(200).json({response_action: 'clear'});
  }

  return res.status(200).end();
}
