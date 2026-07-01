#!/usr/bin/env bash
# PreToolUse(Bash) hook
# joylangcenter 저장소는 johnycho GitHub 계정으로 커밋/푸시해야 한다.
# git push / git commit 실행 시 gh 활성 계정이 johnycho가 아니면 차단하고 안내한다.
# (그 외 명령에는 영향 없음)

input=$(cat)

# git push / git commit 이 아니면 즉시 통과 (빠른 경로)
printf '%s' "$input" | grep -Eq 'git[[:space:]]+(push|commit)' || exit 0

# gh 활성 계정 파싱 (네트워크 호출 없이 gh auth status 로컬 상태 사용)
active=$(gh auth status 2>/dev/null | awk '
  /Logged in to github.com account/ { n=$0; sub(/.*account /,"",n); sub(/ .*/,"",n) }
  /Active account: true/ { print n; exit }
')

if [ "$active" != "johnycho" ]; then
  echo "[joylangcenter] 이 저장소는 johnycho 계정으로 커밋/푸시해야 합니다." >&2
  echo "현재 gh 활성 계정: ${active:-알수없음}" >&2
  echo "먼저 실행하세요:  gh auth switch --user johnycho   (작업 후 원복: gh auth switch --user johny-cho)" >&2
  exit 2
fi

exit 0
