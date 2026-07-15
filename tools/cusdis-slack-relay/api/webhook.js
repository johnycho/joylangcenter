// Cusdis Webhook → Slack Incoming Webhook 중계 함수 (Vercel 서버리스)
//
// 흐름: 새 댓글 → Cusdis Webhook → (이 함수) → Slack 채널
//
// 환경변수:
//   SLACK_WEBHOOK_URL  Slack Incoming Webhook URL (필수)
//
// Cusdis 페이로드 형식:
//   { type: "new_comment", data: { by_nickname, by_email, content,
//                                  page_id, page_title, project_title, approve_link } }
//
// 배포/연결 방법은 ../README.md 참고

// approve_link(…/open/approve?token=…) 에서 토큰만 추출
function extractToken(approveLink) {
  try {
    return new URL(approveLink).searchParams.get('token') || '';
  } catch (_) {
    return '';
  }
}

// 승인 토큰 링크로 댓글을 즉시 승인(자동 공개). 실패해도 알림 전송은 계속 진행.
async function autoApprove(token) {
  try {
    if (!token) return;
    // 페이지(/open/approve) 가 아닌 API(/api/open/approve) 를 GET 하면 바로 승인된다.
    await fetch(`https://cusdis.com/api/open/approve?token=${encodeURIComponent(token)}`, {method: 'GET'});
  } catch (_) {}
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({error: 'Method Not Allowed'});
  }

  const slackUrl = process.env.SLACK_WEBHOOK_URL;
  if (!slackUrl) {
    return res.status(500).json({error: 'SLACK_WEBHOOK_URL 환경변수가 설정되지 않았습니다.'});
  }

  const body = req.body || {};

  // 새 댓글 이벤트만 처리
  if (body.type && body.type !== 'new_comment') {
    return res.status(200).json({ok: true, skipped: body.type});
  }

  // 게시글 링크 구성용 사이트 주소 (환경변수 SITE_URL 로 재정의 가능)
  const SITE_URL = (process.env.SITE_URL || 'https://joylangcenter.com').replace(/\/+$/, '');

  const d = body.data || body;
  const nickname = d.by_nickname || '익명';
  const content = String(d.content || '').trim();
  // by_email 은 "이메일|tel:전화" 형태로 올 수 있다(위젯에서 이메일+연락처를 합쳐 보냄).
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

  // 게시글 링크: page_url 이 오면 그대로, 없으면 page_id(경로)에 사이트 주소를 붙여 구성
  let pageUrl = d.page_url || d.pageUrl || '';
  if (!pageUrl && pageId) {
    pageUrl = /^https?:\/\//.test(pageId)
      ? pageId
      : SITE_URL + (pageId.startsWith('/') ? pageId : '/' + pageId);
  }
  const pageLine = pageUrl ? `<${pageUrl}|${pageTitle}>` : pageTitle;

  // 자동승인: 승인 토큰 링크를 즉시 호출해 댓글을 바로 공개 상태로 만든다.
  await autoApprove(token);

  const quoted = content ? content.replace(/\n/g, '\n> ') : '(내용 없음)';

  const lines = ['💬 *새 댓글이 달렸어요*', `> ${quoted}`, `👤 *작성자:* ${nickname}`];
  if (phone) lines.push(`📞 *연락처:* ${phone}`);
  if (email) lines.push(`✉️ *이메일:* ${email}`);
  lines.push(`📄 *게시글:* ${pageLine}`);
  const summary = lines.join('\n');

  // Block Kit: 요약 + [답글][삭제] 버튼. 버튼 value 에 승인 토큰을 실어 인터랙션에서 사용.
  const blocks = [
    {type: 'section', text: {type: 'mrkdwn', text: summary}},
  ];
  if (token) {
    // 버튼 value: 승인 토큰(t) + 게시글 id(p). 답글 처리 시 답글 id 조회에 사용.
    const btnValue = JSON.stringify({t: token, p: pageId});
    blocks.push({
      type: 'actions',
      block_id: 'comment_actions',
      elements: [
        {
          type: 'button',
          action_id: 'reply_comment',
          text: {type: 'plain_text', text: '↩︎ 답글', emoji: true},
          value: btnValue,
        },
        {
          type: 'button',
          action_id: 'delete_comment',
          style: 'danger',
          text: {type: 'plain_text', text: '🗑 삭제', emoji: true},
          value: btnValue,
          confirm: {
            title: {type: 'plain_text', text: '댓글 삭제'},
            text: {type: 'mrkdwn', text: '이 댓글을 삭제할까요? 되돌릴 수 없습니다.'},
            confirm: {type: 'plain_text', text: '삭제'},
            deny: {type: 'plain_text', text: '취소'},
            style: 'danger',
          },
        },
      ],
    });
  }

  try {
    const resp = await fetch(slackUrl, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({text: summary, blocks}),
    });
    if (!resp.ok) {
      const t = await resp.text();
      return res.status(502).json({error: 'Slack 전송 실패', detail: t});
    }
    return res.status(200).json({ok: true});
  } catch (e) {
    return res.status(500).json({error: String(e)});
  }
}
