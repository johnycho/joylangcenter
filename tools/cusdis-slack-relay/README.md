# Cusdis → Slack 알림 중계

새 댓글이 달리면 Slack 채널로 알림을 보내는 아주 작은 중계 함수입니다.
Cusdis Webhook 이 이 함수로 댓글 데이터를 POST 하면, Slack 형식으로 변환해 Incoming Webhook 으로 전달합니다.
슬랙 메시지의 **"이 댓글 승인하기"** 링크를 누르면 로그인 없이 바로 댓글을 승인할 수 있습니다.

```
새 댓글 → Cusdis Webhook → (이 함수) → Slack 채널
```

## 1. Slack Incoming Webhook 만들기

1. https://api.slack.com/apps → **Create New App** → *From scratch*
2. 앱 이름(예: `조이 댓글알림`) / 워크스페이스 선택
3. 좌측 **Incoming Webhooks** → **Activate Incoming Webhooks** 켜기
4. **Add New Webhook to Workspace** → 알림받을 채널 선택 → 허용
5. 발급된 **Webhook URL** 복사 (`https://hooks.slack.com/services/...`)

## 2. 이 함수 Vercel 에 배포

이 `tools/cusdis-slack-relay` 폴더만 별도로 배포합니다.

```bash
cd tools/cusdis-slack-relay
npx vercel                            # 최초 배포 (Vercel 로그인 필요)
npx vercel env add SLACK_WEBHOOK_URL  # 1번에서 복사한 Slack Webhook URL 붙여넣기 (Production 선택)
npx vercel --prod                     # 프로덕션 배포
```

배포 후 함수 주소:

```
https://<프로젝트이름>.vercel.app/api/webhook
```

## 3. Cusdis 에 Webhook 연결

Cusdis 대시보드 → 해당 website → **Settings** →
**Webhook URL** 칸에 위 `https://<프로젝트이름>.vercel.app/api/webhook` 입력 → **스위치 ON** → 저장.

## 테스트

블로그 글에 댓글을 하나 남겨 보고 Slack 채널에 알림이 오는지 확인합니다.

---

### 참고 — Vercel 없이 더 간단하게 (Telegram)

Slack 대신 Telegram 이면 중계 함수(Vercel) 없이 됩니다:
1. https://t.me/CusdisBot 열고 시작
2. `/gethook` 전송 → 나온 URL 복사
3. Cusdis Settings 의 Webhook URL 에 붙여넣기

### 참고 — 이메일 알림 (기본 제공)

Cusdis 호스팅은 가입 이메일로 새 댓글 알림을 기본 발송합니다.
`User → Settings` 에서 알림 이메일 주소를 바꿀 수 있습니다.
