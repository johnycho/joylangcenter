# Vercel 배포 정책

## 규칙
**Vercel 배포는 실행 전 반드시 사용자에게 물어보고, 승인받은 뒤에만 진행한다.**
사용자가 명시적으로 "배포해줘"라고 요청한 경우가 아니면 임의로 배포하지 않는다.

해당 명령(예):
- `vercel`, `vercel --prod`, `npx vercel …`
- 환경변수 변경 후 재배포(`vercel --prod`)

## 왜
- Vercel 배포는 **즉시 운영에 반영**되는 외부 공개 작업이라, 되돌리기 전 영향이 생길 수 있다.
- 커밋/푸시와 마찬가지로 사용자 확인을 거친다(→ [git-account.md](git-account.md) 커밋·푸시 정책과 동일한 취지).

## 대상 프로젝트
- `tools/joy-cusdis-slack-relay` — Cusdis 댓글 → Slack 알림/관리 중계 함수 (Vercel 서버리스)
  - 프로덕션 별칭: `https://joy-cusdis-slack-relay.vercel.app`
  - 엔드포인트: `/api/webhook`(Cusdis 웹훅), `/api/slack-action`(Slack 인터랙션)

## 참고
- **홈페이지(Docusaurus)** 배포는 GitHub Pages 파이프라인으로 별개다. Vercel 배포는 위 relay 전용.
- 환경변수(`SLACK_*`, `CUSDIS_APP_ID` 등)는 배포 시점에 주입되므로, 값 변경 후에는 재배포가 필요하다(이 재배포도 사용자 확인 후 진행).
