# Cusdis → Slack 알림 중계

새 댓글이 달리면 ① **자동 승인(공개)** 하고 ② Slack 채널로 알림 + **[답글]/[삭제] 버튼**을 보내는 중계 함수입니다.

```
새 댓글 → Cusdis Webhook → api/webhook → ①자동승인 + ②Slack 알림([답글][삭제] 버튼)
Slack 버튼 클릭 → api/slack-action → 삭제 / 답글(모달) 처리 → Cusdis
```

- **[🗑 삭제]**: 확인 후 해당 댓글 삭제 (원본 메시지 갱신)
- **[↩︎ 답글]**: 모달에 답글 입력 → 관리자 답글로 등록

## 환경변수 정리

| 이름 | 용도 | 필수 |
|---|---|---|
| `SLACK_WEBHOOK_URL` | 알림 보낼 Incoming Webhook URL | ✅ |
| `SLACK_SIGNING_SECRET` | Slack 인터랙션 서명 검증(버튼/모달) | 답글·삭제 사용 시 ✅ |
| `SLACK_BOT_TOKEN` | 답글 모달(views.open) + 결과 스레드 전송(chat.postMessage)용 봇 토큰 `xoxb-...` | 답글·삭제 사용 시 ✅ |
| `CUSDIS_APP_ID` | 답글 id 조회·존재 확인용 Cusdis App ID | 답글 수정/삭제 사용 시 ✅ |
| `SITE_URL` | 게시글 링크 도메인(기본 `https://joylangcenter.com`) | 선택 |

## 동작

- 새 댓글 → 자동 공개 + Slack 알림([↩︎ 답글][🗑 삭제] 버튼)
- **[🗑 삭제]** → 원본 메시지의 버튼을 없애고 "🗑 삭제됨"으로 표시(덮어쓰기)
- **[↩︎ 답글]** → 모달 입력 → 원본 스레드에 결과 메시지([✏️ 수정][🗑 답글 삭제] 버튼) 추가
- **[✏️ 수정]** → 모달(기존 내용 자동 채움) → *기존 답글 삭제 후 재등록*(Cusdis 에 수정 API 없음)
  → 결과 메시지를 **"수정 전 / 수정 후"** 로 덮어씀(새 메시지 추가 안 함)
- **[🗑 답글 삭제]** → 결과 메시지의 버튼을 없애고 "🗑 답글 삭제됨"으로 표시
- 삭제된 댓글엔 답글을 달 수 없습니다(버튼을 눌러도 안내).
- 이미 삭제된 항목에 삭제/수정을 다시 누르면, 버튼 근처에 **"당신에게만 표시됨" 인라인 안내**(ephemeral)로 알려줍니다. 새로고침하면 사라집니다.

> ⚠️ 한계: 답글 id 조회는 댓글목록 API(1페이지)를 훑어 최신 관리자 답글을 찾는 방식이라,
> 같은 글에 댓글/답글이 매우 많아 대상이 1페이지 밖으로 밀리면 정확도가 떨어질 수 있습니다.
> 저트래픽 환경에선 충분하며, 확실한 관리가 필요하면 Cusdis 대시보드를 함께 사용하세요.

## 1. Slack 앱 만들기 (Incoming Webhook + 인터랙티브)

1. https://api.slack.com/apps → **Create New App** → *From scratch* → 앱 이름 / 워크스페이스 선택
2. **Incoming Webhooks** → *Activate* 켜기 → **Add New Webhook to Workspace** → 채널 선택 → 허용
   → 발급된 **Webhook URL**(`https://hooks.slack.com/services/...`) 복사 = `SLACK_WEBHOOK_URL`
3. **Basic Information** → *App Credentials* → **Signing Secret** 복사 = `SLACK_SIGNING_SECRET`
4. **OAuth & Permissions** → *Scopes → Bot Token Scopes* 에 `chat:write` 와 `chat:write.public` 추가
   (`chat:write.public` 이 있으면 봇을 채널에 초대하지 않아도 공개 채널 스레드에 결과를 남길 수 있음.
    비공개 채널이면 채널에서 `/invite @앱이름` 으로 봇을 초대)
   → 상단 **Install to Workspace** → 설치 후 **Bot User OAuth Token**(`xoxb-...`) 복사 = `SLACK_BOT_TOKEN`
5. (배포 후) **Interactivity & Shortcuts** → *Interactivity* 켜기
   → **Request URL** 에 `https://<프로젝트>.vercel.app/api/slack-action` 입력 → 저장

## 2. 이 함수 Vercel 에 배포

이 `tools/cusdis-slack-relay` 폴더만 별도로 배포합니다.

```bash
cd tools/cusdis-slack-relay
npx vercel                              # 최초 배포 (Vercel 로그인 필요)
npx vercel env add SLACK_WEBHOOK_URL    # (Production 선택)
npx vercel env add SLACK_SIGNING_SECRET # (Production)
npx vercel env add SLACK_BOT_TOKEN      # (Production)
npx vercel env add CUSDIS_APP_ID        # (Production) — 답글 수정/삭제용
npx vercel --prod                       # 프로덕션 배포 (env 추가/변경 후에는 반드시 재배포!)
```

배포 후 함수 주소(**프로덕션 별칭**을 사용):

```
https://<프로젝트이름>.vercel.app/api/webhook
```

> ⚠️ **주의 — 반드시 프로덕션 URL 사용**
> `npx vercel` 이 출력하는 `...-<해시>-<계정>.vercel.app` 형태의 **프리뷰 URL 은 쓰지 마세요.**
> 프리뷰 배포는 기본적으로 **Vercel 로그인 보호(Deployment Protection)** 가 걸려 있어,
> Cusdis 웹훅 호출이 `vercel.com/sso-api` 로 302 리다이렉트되어 함수에 닿지 못합니다.
> 프로덕션 별칭(`https://<프로젝트이름>.vercel.app`)은 공개 상태라 정상 동작합니다.
>
> 확인법: `curl -s -o /dev/null -w "%{http_code}" https://<프로젝트이름>.vercel.app/api/webhook`
> → **405** 가 나오면 정상(공개), **302** 가 나오면 보호된 URL 입니다.

## 3. Cusdis 에 Webhook 연결

Cusdis 대시보드 → 해당 website → **Settings** →
**Webhook URL** 칸에 위 **프로덕션** `https://<프로젝트이름>.vercel.app/api/webhook` 입력 → **스위치 ON** → 저장.

## 테스트

블로그 글에 댓글을 남겨 → ① 댓글이 즉시 공개되고 ② Slack 에 알림 + [답글][삭제] 버튼이 오는지 확인.
원본 알림 메시지는 그대로 두고, **처리 결과는 그 메시지의 스레드**에 남습니다.
- [삭제] → 확인 후 스레드에 "삭제했어요" → 글에서 댓글이 사라지면 성공.
- [답글] → 모달에 입력·등록 → 스레드에 "답글을 등록했어요" → 글에 관리자 답글이 달리면 성공.

> 참고: 답글은 Cusdis 무료 플랜의 *Quick Approve* 월 사용량에 포함됩니다(저트래픽이면 충분). 삭제·자동승인은 제한 없음.
> 보안: 삭제 API 가 무인증이라, `/api/slack-action` 은 **Slack 서명 검증**으로 보호됩니다(`SLACK_SIGNING_SECRET` 필수).

---

### 참고 — Vercel 없이 더 간단하게 (Telegram)

Slack 대신 Telegram 이면 중계 함수(Vercel) 없이 됩니다:
1. https://t.me/CusdisBot 열고 시작
2. `/gethook` 전송 → 나온 URL 복사
3. Cusdis Settings 의 Webhook URL 에 붙여넣기

### 참고 — 이메일 알림 (기본 제공)

Cusdis 호스팅은 가입 이메일로 새 댓글 알림을 기본 발송합니다.
`User → Settings` 에서 알림 이메일 주소를 바꿀 수 있습니다.
