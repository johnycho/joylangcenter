# CLAUDE.md

조이 언어발달센터 홈페이지 (Docusaurus). 커뮤니티 글은 `blog/*.mdx`로 작성하며, 파일 하나만 추가하면 커뮤니티 게시판 · 블로그 · 홈 미리보기에 자동 반영된다.

## 게시글(.mdx) 작성 공통 규칙

새 게시글을 작성할 때 아래 규칙을 항상 따른다.

### 1) 소스 가져오기 (네이버 블로그 → 홈페이지)
- 출처: `blog.naver.com/joylangcenter`. **WebFetch/RSS는 차단**되므로 헤드리스 Chrome(puppeteer-core + Chrome, 모바일 UA)으로 접근한다.
- 글 목록/개별 글: `m.blog.naver.com/PostView.naver?blogId=joylangcenter&logNo=<logNo>` 에서 제목 · 본문(`.se-main-container` innerText) · 게시일 · 이미지 추출. logNo가 클수록 최신 글.
- 여러 글을 연속 크롤할 때는 차단 방지용 딜레이를 둔다.

### 2) 이미지 처리
- **본문 실제 사진만** 사용: 이미지 URL 호스트가 `mblogthumb-phinf` / `postfiles` / `blogfiles`(.pstatic.net) 인 것만 다운로드.
- **제외 대상**: 지도 스크린샷(`staticmap` / `static.map`), 링크 카드 썸네일(`dthumb-phinf`), 카페·아이콘 gif(`storep-phinf`), 프로필/블로그 썸네일(`blogpfthumb` / `profile`).
- 다운로드 시 Referer(`https://m.blog.naver.com/joylangcenter`) 헤더를 넣고, **base64 data URI로 본문에 인라인**(static/img 참조 아님).
- 원본 글에 **지도 이미지가 추가로 들어 있으면 그 이미지는 제거**한다. (지도는 푸터의 `<NaverMap />` 임베드로 대체되므로 중복)

### 3) 파일 / 프론트매터
- 파일명: `blog/YYYY-MM-DD-joy-<type>-YYYYMMDD.mdx`, `slug: joy-<type>-YYYYMMDD` (게시일 기준). 같은 날 같은 type이 겹치면 slug 뒤에 구분어를 붙인다(예: `joy-library-20260426-lecture`).
- frontmatter: `slug`, `title`(따옴표), `authors: [ dayealee ]`, `tags: [ notice | news | library ]`, `description`, `keywords`(표준 6개: 원주 / 원주 기업도시 / 원주 지정면 × 언어발달센터 · 언어치료).
- 본문 시작부: `import NaverMap from '@site/src/components/NaverMap';` → `<!-- truncate -->` → `<br /><br />` → 표준 인사말.

  ```
  안녕하세요! 😊
  원주 기업도시에 위치한 <mark>언어치료 전문기관</mark>
  **조이 언어발달센터**입니다.
  ```

### 4) 본문 정리 — 푸터와 겹치는 내용 제거
표준 푸터에 이미 들어가는 내용은 본문에서 **삭제**한다. 그 외 네이버 잔여물도 제거.
- 맺음말성 문구("Let's enJOY in JOY" 등), 센터 연락처·주소
- 인스타그램/카카오/블로그 링크 카드(팔로워 수, `www.instagram.com`, `pf.kakao.com`, `blog.naver.com` 등)
- 지도 place 위젯 텍스트("저장 / 전화 / 이 블로그의 체크인 / 이 장소의 다른 글")
- 영상 플레이어 잔여물("재생 / 좋아요 / 접기·펴기 / 00:23 / 100%")
- 첨부파일·PDF 다운로드 잔여물, `#해시태그`, 원문 상단의 반복 인사말("안녕하세요…", "원주…전문기관", "…입니다")
- 단, **외부 기관 연락처**(예: 두루바른·난청협회·강릉무장애관광센터 전화/링크)는 정보로서 본문에 유지.

### 5) 마크다운 포맷 규칙 (중요)
- **불필요한 제목(`##`)을 남발하지 않는다.** 진짜 섹션 제목만 `##`/`###`, 그 외 강조는 **볼드**.
- **`텍스트\n---` 금지** — 마크다운 Setext H2로 변해 큰 제목이 된다. 구분선 `---`은 **앞뒤에 빈 줄**을 넣어 가로선으로만 쓴다.
- 강조 요소를 적극 활용: `**볼드**`, `<mark>` 하이라이트, `>` 인용구, `✔️` 체크리스트, `-`/`1.` 리스트, **표(table)**(구조화 데이터).
- **볼드가 따옴표와 붙으면 깨질 수 있다**: `**"..."**`, `**'...'**` 는 렌더가 안 될 수 있으므로, 인용/발화 예시는 `<mark>"..."</mark>` 로 하이라이트하거나 따옴표 없이 볼드 처리한다.
- 마무리 인사 등은 가운데 정렬(`<div style={{textAlign:'center', ...}}>`) 활용 가능.
- MDX 특수문자 주의: 본문 텍스트의 `<`, `{`, `}` 는 JSX로 오인되어 컴파일 실패할 수 있으니 이스케이프(`&lt;`, `&#123;`, `&#125;`)한다. (단, 의도한 `<mark>`·`<div>` 등은 예외)

### 6) 가독성 — 줄바꿈(개행)
- 한 줄이 길지 않도록 **하드 개행(줄 끝 공백 2칸 + 줄바꿈)** 을 넣는다.
- 개행 지점: 문장 끝(`.` `!` `?` `…`), 쉼표(`,`) 뒤. **쉼표가 없어도 의미가 구분되는 지점에서 개행해도 된다**(긴 한 문장도 절/구 단위로 나눠 읽기 쉽게).
- **너무 짧은 줄은 만들지 않는다**(핵심 피드백):
  - 한 줄이 최소 ~20자 정도 되도록, 쉼표로 나눈 짧은 조각(예: "즉,", "예를 들어,")은 **다음 조각과 합쳐** 적당한 길이가 될 때만 개행한다.
  - 이모지·이모티콘(😊, `:)` 등)만 남는 줄, 단어 없는 조각은 **앞 줄에 붙인다**(문장 끝 이모지가 홀로 떨어지지 않게).
  - **숫자 뒤 마침표에서는 개행하지 않는다**(소수 `0.5초`, 번호 `1.`/`내용 1.` 라벨 보호). 즉 마침표 앞이 숫자면 문장 끝으로 보지 않는다.
- 단, 제목·리스트·표·이미지(및 base64)·frontmatter 안에서는 개행하지 않는다. 인용구(`>`)는 `>` 접두어를 유지한 채 개행.

### 7) 분류(tags) 매핑
- 공지/안내/휴강/선정 → `notice`
- 소식/인사/센터 이야기/후기/행사·세미나 안내 → `news`
- 교육자료/치료 팁/활동/발달 정보/자료 공유 → `library`
- 필요 시 보조 태그(예: 말소리 자료 `articulation`) 추가.

### 8) 표준 푸터 (가로선 뒤, 일반 텍스트 — 지도 임베드 유지)
```
<br />

---

아이들의 언어발달에 즐거움을 더하는 공간
**조이 언어발달센터**입니다.

*Let's enJOY in JOY ! 🎉✨*

📞 문의: [033-745-1030](tel:033-745-1030)
💬 카카오채널: [joylangcenter](https://pf.kakao.com/_sxjPXn)
⭐️ 인스타그램: [@joylangcenter](https://instagram.com/joylangcenter)
🏠 홈페이지: [joylangcenter.com](https://joylangcenter.com)

<br />

<NaverMap />
```

## Git 계정
- 이 저장소는 **johnycho** GitHub 계정으로 커밋·푸시한다. (머신 기본 gh 계정은 `johny-cho`라 혼동 주의)
- 커밋 작성자(repo-local): `johnycho <johnycho.dev@gmail.com>`.
- 푸시 전 `gh auth status`로 활성 계정이 johnycho인지 확인하고, 아니면 `gh auth switch --user johnycho`.

## 참고
- 로컬에서 네이버 지도는 도메인 인증 제한으로 "API 인증 실패"가 뜬다(운영 사이트에선 정상). 지도 관련 확인은 운영 사이트 기준으로 판단한다.
- 게시판 UI/공유 컴포넌트: `src/components/BlogCards.tsx`, 스타일 `BlogCards.module.css`. 커뮤니티 페이지 swizzle: `src/theme/Blog*`, 네비게이션 swizzle: `src/theme/NavbarItem/DropdownNavbarItem`.
