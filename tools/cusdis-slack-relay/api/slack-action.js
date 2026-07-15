// Slack 인터랙션(버튼/모달) 처리 → Cusdis 댓글 삭제·답글·수정 (Vercel 서버리스)
//
//   [🗑 삭제]     원본 댓글 삭제 → 원본 메시지의 버튼을 없애고 "🗑 삭제됨" 표시
//   [↩︎ 답글]     모달 입력 → 관리자 답글 등록 → 스레드에 결과 메시지([✏️수정][🗑답글삭제] 버튼)
//   [✏️ 수정]     모달(기존 내용 prefill) → 삭제 후 재등록 → 기존 결과 메시지를 "수정 전/후"로 덮어씀
//   [🗑 답글삭제] 관리자 답글 삭제 → 결과 메시지의 버튼을 없애고 "🗑 답글 삭제됨" 표시
//
//   이미 삭제된 항목에 다시 시도하면, 버튼 근처에 "당신에게만 표시됨" 인라인 안내(ephemeral).
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
// 버튼 근처에 "당신에게만 표시됨" 인라인 안내(ephemeral). 새로고침하면 사라진다.
// (Slack 이 서버 통신 실패 시 버튼 옆에 안내를 띄우는 것과 같은 방식)
async function ephemeral(responseUrl, text) {
  try {
    await fetch(responseUrl, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({response_type: 'ephemeral', replace_original: false, text}),
    });
  } catch (_) {}
}
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
      body: JSON.stringify({channel, thread_ts: threadTs, text, ...(blocks ? {blocks} : {})}),
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
const findTop = (list, id) => list.find((c) => c.id === id) || null;
const repliesOf = (parent) => (parent && parent.replies && parent.replies.data) || [];
function latestModReplyId(parent) {
  const mods = repliesOf(parent).filter((x) => x.moderatorId);
  mods.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return mods[0] ? mods[0].id : null;
}
async function replyExists(appId, pageId, parentToken, replyId) {
  if (!appId) return true; // 조회 불가하면 존재한다고 가정
  const parent = findTop(await fetchTopComments(appId, pageId), commentIdFromToken(parentToken));
  return repliesOf(parent).some((x) => x.id === replyId);
}
async function postReply(token, content) {
  try {
    const r = await fetch(`${CUSDIS_HOST}/api/open/approve?token=${encodeURIComponent(token)}`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({replyContent: content}),
    });
    return {limited: r.status === 402, ok: r.status !== 402};
  } catch (_) {
    return {ok: false};
  }
}

// ── 블록 구성 ──
const sectionOf = (text) => ({type: 'section', text: {type: 'mrkdwn', text}});
const contextOf = (text) => ({type: 'context', elements: [{type: 'mrkdwn', text}]});
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

    // 원본 댓글 삭제 → 버튼 제거 + "삭제됨"
    if (action.action_id === 'delete_comment') {
      const commentId = commentIdFromToken(v.t);
      if (appId && commentId && !findTop(await fetchTopComments(appId, v.p), commentId)) {
        await ephemeral(responseUrl, '⚠️ 이미 삭제된 댓글이에요.');
        return res.status(200).end();
      }
      let ok = false;
      if (commentId) {
        try {
          ok = (await fetch(`${CUSDIS_HOST}/api/comment/${commentId}`, {method: 'DELETE'})).ok;
        } catch (_) {}
      }
      if (ok) await updateMessage(responseUrl, '🗑 삭제됨', [summarySection(payload), contextOf('🗑 삭제됨')]);
      else await ephemeral(responseUrl, '⚠️ 삭제에 실패했어요.');
      return res.status(200).end();
    }

    // 답글 달기 (모달) — 삭제된 댓글엔 답글 불가
    if (action.action_id === 'reply_comment') {
      const commentId = commentIdFromToken(v.t);
      if (appId && commentId && !findTop(await fetchTopComments(appId, v.p), commentId)) {
        await ephemeral(responseUrl, '⚠️ 이미 삭제된 댓글이라 답글을 달 수 없어요.');
        return res.status(200).end();
      }
      if (botToken) {
        await openReplyModal(botToken, payload.trigger_id, {
          callback: 'reply_modal',
          pm: {t: v.t, p: v.p, ch: channel, root: msgTs}, // root = 원본 메시지 ts (스레드 기준)
          initial: '',
        });
      }
      return res.status(200).end();
    }

    // 답글 삭제 → 결과 메시지 버튼 제거 + "답글 삭제됨"
    if (action.action_id === 'delete_reply') {
      if (!(await replyExists(appId, v.p, v.t, v.r))) {
        await ephemeral(responseUrl, '⚠️ 이미 삭제된 답글이에요.');
        return res.status(200).end();
      }
      let ok = false;
      try {
        ok = (await fetch(`${CUSDIS_HOST}/api/comment/${v.r}`, {method: 'DELETE'})).ok;
      } catch (_) {}
      if (ok) await updateMessage(responseUrl, '🗑 답글 삭제됨', [summarySection(payload), contextOf('🗑 답글 삭제됨')]);
      else await ephemeral(responseUrl, '⚠️ 답글 삭제에 실패했어요.');
      return res.status(200).end();
    }

    // 답글 수정 (모달, 기존 내용 prefill)
    if (action.action_id === 'edit_reply') {
      if (!(await replyExists(appId, v.p, v.t, v.r))) {
        await ephemeral(responseUrl, '⚠️ 이미 삭제되어 수정할 수 없어요.');
        return res.status(200).end();
      }
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
      const r = await postReply(meta.t, content);
      if (r.limited) return modalError(res, '⚠️ 무료 플랜 답글 한도를 초과했어요.');
      let replyId = null;
      if (appId) replyId = latestModReplyId(findTop(await fetchTopComments(appId, meta.p), commentIdFromToken(meta.t)));
      const text = `↩︎ 답글을 등록했어요:\n> ${content}`;
      await postThread(botToken, meta.ch, meta.root, text, replyResultBlocks(text, {token: meta.t, pageId: meta.p, replyId, content}));
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
      if (appId) replyId = latestModReplyId(findTop(await fetchTopComments(appId, meta.p), commentIdFromToken(meta.t)));
      const text = `✏️ 답글을 수정했어요\n*수정 전:* ${meta.prev || '(없음)'}\n*수정 후:* ${content}`;
      await chatUpdate(botToken, meta.ch, meta.ts, text, replyResultBlocks(text, {token: meta.t, pageId: meta.p, replyId, content}));
      return res.status(200).json({response_action: 'clear'});
    }

    return res.status(200).json({response_action: 'clear'});
  }

  return res.status(200).end();
}
