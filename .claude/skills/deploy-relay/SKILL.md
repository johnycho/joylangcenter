---
name: deploy-relay
description: Cusdis→Slack 중계 함수(tools/joy-cusdis-slack-relay)를 Vercel 프로덕션에 배포한다. "relay 배포", "vercel 배포", "슬랙 중계 배포", "댓글 알림 배포" 등의 요청에 사용. 배포 정책상 실행 전 사용자 확인 필수.
---

# Vercel relay 배포 스킬 (tools/joy-cusdis-slack-relay)

배포 정책은 반드시 [../../wiki/vercel-deploy.md](../../wiki/vercel-deploy.md)를 따른다.
아래는 실행 절차다.

## 절차

1. **사용자 확인 (필수)**: 배포는 즉시 운영 반영되는 외부 작업이므로, 실행 전 **"배포할까요?"로 물어보고 승인**을 받는다. 승인 없이 배포하지 않는다.

2. **변경 반영 확인**: 배포는 로컬 파일을 업로드한다. `tools/joy-cusdis-slack-relay/` 의 최신 변경(webhook.js, slack-action.js 등)이 저장돼 있는지 확인. (git 커밋과는 별개 — 커밋 안 해도 배포는 되지만, 이력용으로 커밋도 권장)

3. **배포**:
   ```
   cd tools/joy-cusdis-slack-relay
   npx vercel --prod --yes
   ```
   → 프로덕션 별칭 `https://joy-cusdis-slack-relay.vercel.app` 로 aliased 되면 성공.
   - ⚠️ **프리뷰(해시) URL(`...-<해시>-joylangcenter.vercel.app`) 은 쓰지 않는다** — Deployment Protection 로그인에 막힌다. 항상 프로덕션 별칭 사용.

4. **검증**: 두 엔드포인트가 GET 시 **405**(공개·도달 가능)인지 확인.
   ```
   curl -s -o /dev/null -w "%{http_code}" https://joy-cusdis-slack-relay.vercel.app/api/webhook
   curl -s -o /dev/null -w "%{http_code}" https://joy-cusdis-slack-relay.vercel.app/api/slack-action
   ```
   302 가 나오면 보호된 URL(프리뷰)이니 프로덕션 별칭으로 다시 확인.

5. **환경변수 확인**: `npx vercel env ls production` 로 아래 4개가 Production 에 있는지 확인.
   - `SLACK_WEBHOOK_URL`, `SLACK_SIGNING_SECRET`, `SLACK_BOT_TOKEN`, `CUSDIS_APP_ID`
   - env 는 배포 시점에 주입되므로, **값을 바꿨으면 반드시 `vercel --prod` 재배포**(이 재배포도 1번처럼 사용자 확인).

6. **최초 설정/URL 변경 시에만** (평소엔 불필요):
   - Slack 앱 → Interactivity Request URL = `https://joy-cusdis-slack-relay.vercel.app/api/slack-action`
   - Cusdis 대시보드 → Settings → Webhook URL = `https://joy-cusdis-slack-relay.vercel.app/api/webhook`

## 참고
- 홈페이지(Docusaurus)는 GitHub Pages 로 배포되는 별개 파이프라인. 이 스킬은 relay 전용.
- 상세 동작/설정은 `tools/joy-cusdis-slack-relay/README.md` 참고.
