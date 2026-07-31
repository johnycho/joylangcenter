#!/usr/bin/env bash
# PostToolUse(Bash) hook
# joylangcenter 저장소는 johnycho 계정으로 커밋/푸시하지만, 머신 기본은 johny-cho 다.
# git push / git commit 이 끝나면 gh 활성 계정을 머신 기본(johny-cho)으로 자동 원복한다.
# (그 외 명령에는 영향 없음)

input=$(cat)

# git push / git commit 이 아니면 즉시 통과 (빠른 경로)
printf '%s' "$input" | grep -Eq 'git[[:space:]]+(push|commit)' || exit 0

# 현재 gh 활성 계정 파싱 (로컬 상태만 사용)
active=$(gh auth status 2>/dev/null | awk '
  /Logged in to github.com account/ { n=$0; sub(/.*account /,"",n); sub(/ .*/,"",n) }
  /Active account: true/ { print n; exit }
')

# 이미 johny-cho 면 아무것도 안 함
[ "$active" = "johny-cho" ] && exit 0

# johny-cho 로그인 자체가 없으면 원복 불가 (조용히 통과)
gh auth status 2>/dev/null | grep -q 'account johny-cho' || exit 0

if gh auth switch --user johny-cho >/dev/null 2>&1; then
  echo "[joylangcenter] gh 활성 계정을 머신 기본(johny-cho)으로 원복했습니다." >&2
fi

exit 0
