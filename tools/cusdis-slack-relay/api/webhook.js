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

  const d = body.data || body;
  const nickname = d.by_nickname || '익명';
  const content = String(d.content || '').trim();
  const pageTitle = d.page_title || d.project_title || '게시글';
  const approveLink = d.approve_link || '';

  const quoted = content ? content.replace(/\n/g, '\n> ') : '(내용 없음)';

  const lines = [
    '💬 *새 댓글이 달렸어요*',
    `> ${quoted}`,
    `*작성자:* ${nickname}`,
    `*글:* ${pageTitle}`,
  ];
  if (approveLink) {
    lines.push(`✅ <${approveLink}|이 댓글 승인하기> (로그인 없이 바로 승인)`);
  }
  const text = lines.join('\n');

  try {
    const resp = await fetch(slackUrl, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({text}),
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
