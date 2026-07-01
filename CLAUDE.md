# CLAUDE.md

조이 언어발달센터 홈페이지 (Docusaurus). 커뮤니티 글은 `blog/*.mdx`로 작성하며, 파일 하나만 추가하면 커뮤니티 게시판 · 블로그 · 홈 미리보기에 자동 반영된다.

## 규칙은 `.claude/` 에서 관리한다
작업 규칙은 **wiki(참조) · skill(절차) · hook(자동 검증)** 으로 분리되어 [`.claude/`](.claude/README.md) 에 중앙 관리된다. 색인: [`.claude/README.md`](.claude/README.md)

- **게시글(.mdx) 작성 규칙** → [`.claude/wiki/blog-authoring.md`](.claude/wiki/blog-authoring.md)
  - 절차/스킬 → [`.claude/skills/blog-post/SKILL.md`](.claude/skills/blog-post/SKILL.md) (또는 `/blog-post`)
  - 핵심: 네이버 블로그 크롤 → 이미지는 **`static/img/blog/` 파일로 저장(base64 금지, 성능)** → 마크다운 정리 → 표준 푸터
- **Git 계정 정책** → [`.claude/wiki/git-account.md`](.claude/wiki/git-account.md)
  - 이 저장소는 **johnycho** 계정으로 커밋·푸시 (머신 기본은 johny-cho). 커밋/푸시 시 hook이 자동 검증.

## 참고
- 로컬에서 네이버 지도는 도메인 인증 제한으로 "API 인증 실패"가 뜬다(운영 사이트에선 정상).
- 게시판/공유 컴포넌트: `src/components/BlogCards.tsx`. 커뮤니티/게시글 페이지 스타일: `src/theme/Blog*`, `src/css/custom.css`.
