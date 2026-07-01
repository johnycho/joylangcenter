# Wiki · Git 계정 정책

이 저장소(`joylangcenter`)는 **johnycho** GitHub 계정으로 커밋·푸시한다.
머신 기본 gh 계정은 `johny-cho`(하이픈)라 혼동 주의. 이 규칙은 [hook](../hooks/check-git-account.sh)으로 자동 검증된다.

## 설정 (이미 적용됨, repo-local)
- 커밋 작성자: `git config user.name johnycho`, `git config user.email johnycho.dev@gmail.com`
- 푸시 인증: gh 자격증명 경유(`gh auth setup-git` 완료) → gh 활성 계정을 따름

## 커밋/푸시 절차
1. 활성 계정 전환:  `gh auth switch --user johnycho`
2. 커밋 · 푸시
3. (권장) 원복:  `gh auth switch --user johny-cho`

## 자동 검증 (hook)
- `.claude/hooks/check-git-account.sh` (PreToolUse·Bash)
- `git push` / `git commit` 실행 시 gh 활성 계정이 `johnycho`가 아니면 **차단**하고 전환을 안내한다.
- 그 외 명령에는 영향 없음.

## 참고
- gh에는 `johnycho`, `johny-cho` 두 계정이 로그인되어 있음. 전환은 머신 전체·영구 적용.
- 계정 이메일이 비공개면 `gh api user --jq .email`이 null → 프로필 Public email 설정 후 조회.
