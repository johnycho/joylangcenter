---
name: blog-post
description: 네이버 블로그(blog.naver.com/joylangcenter) 글을 홈페이지 커뮤니티 게시글(blog/*.mdx)로 변환·작성한다. "게시글 작성", "네이버 글 홈페이지 반영", "블로그 글 가져오기" 등의 요청에 사용.
---

# 게시글 작성 스킬 (네이버 블로그 → 홈페이지 .mdx)

상세 규칙은 반드시 [../../wiki/blog-authoring.md](../../wiki/blog-authoring.md)를 먼저 읽고 그대로 따른다. 아래는 실행 절차 요약이다.

## 절차

1. **대상 선정**: 어떤 글을 반영할지 확인(최신 N개 / 특정 글 / 특정 날짜 이후). 홈페이지에 이미 있는 최신 글 날짜 이후만 새로 만든다.

   - **작성자 확인**: 새 글을 만들기 전 반드시 사용자에게 **작성자(authors)를 물어본다**. 선택지는 `blog/authors.yml`에 등록된 저자(현재 다예쌤 `dayealee`, 민정쌤 `minjeong`). 답을 받기 전에는 임의로 정하지 않는다(wiki 3절).

2. **크롤링** (헤드리스 Chrome, 모바일 UA):
   - 목록/날짜: `m.blog.naver.com/PostList.naver?blogId=joylangcenter` 또는 각 글의 게시일 확인.
   - 각 글: `m.blog.naver.com/PostView.naver?blogId=joylangcenter&logNo=<logNo>` 에서 제목·본문(`.se-main-container`)·게시일·이미지 URL 추출.
   - 이미지 필터: `mblogthumb-phinf`/`postfiles`/`blogfiles` 만. 지도/링크카드/아이콘/프로필 제외 (wiki 2절).

3. **이미지 저장**: 각 이미지를 Referer 헤더로 다운로드 → **`static/img/blog/<slug>-<n>.<ext>` 파일로 저장**. base64 인라인 금지(성능). 본문은 `![alt](/img/blog/...)` 경로 참조.

4. **본문 정리·작성** (wiki 4~6절):
   - 푸터·연락처·링크카드·지도위젯·영상/첨부 잔여물·해시태그·상단 반복 인사말 제거.
   - 마크다운 재구성: 필요한 곳만 `##`, 볼드/`<mark>`/인용구/체크리스트/표. `텍스트\n---` 금지, 따옴표 볼드는 `<mark>`로, `<{}` 이스케이프.
   - 가독성 개행: 문장·쉼표·의미 단위 하드 개행하되 너무 짧은 줄 금지(최소 ~20자, 이모지·숫자마침표 처리).

5. **프론트매터 + 인사말 + 표준 푸터** 부착 (wiki 3·8절). tags 매핑(wiki 7절).

6. **검증**: `npm run build` 로 MDX 컴파일 확인. 필요 시 로컬 서버로 렌더 확인. 블로그 아카이브 JSON이 비대하지 않은지(이미지가 파일로 빠졌는지) 확인.

7. **반영**: `.mdx` 하나만 추가하면 커뮤니티 게시판·블로그·홈 미리보기에 자동 노출.

## 커밋
- 커밋·푸시는 [git 계정 정책](../../wiki/git-account.md)에 따라 **johnycho** 계정으로 (`gh auth switch --user johnycho`). hook이 자동 검증한다.
