# Wiki · 게시글(.mdx) 작성 규칙

홈페이지 커뮤니티 글(`blog/*.mdx`) 작성 시 지켜야 할 상세 규칙. 절차는 [blog-post 스킬](../skills/blog-post/SKILL.md) 참고.

## 1) 소스 가져오기 (네이버 블로그)
- 출처: `blog.naver.com/joylangcenter`. **WebFetch/RSS는 차단** → 헤드리스 Chrome(puppeteer-core + Chrome, 모바일 UA)로 접근.
- 개별 글: `m.blog.naver.com/PostView.naver?blogId=joylangcenter&logNo=<logNo>` 에서 제목 · 본문(`.se-main-container` innerText) · 게시일 · 이미지 추출. logNo가 클수록 최신.
- 여러 글 연속 크롤 시 차단 방지용 딜레이.

## 2) 이미지 처리 ⚠️ (성능 핵심)
- **본문 실제 사진만**: 호스트가 `mblogthumb-phinf` / `postfiles` / `blogfiles`(.pstatic.net) 인 것만 다운로드.
- **제외**: 지도(`staticmap`/`static.map`), 링크카드(`dthumb-phinf`), 카페·아이콘(`storep-phinf`), 프로필(`blogpfthumb`/`profile`).
- **반드시 파일로 저장** — `static/img/blog/<slug>-<n>.<ext>` (ext: png/jpg/gif, 원본 mime에 맞춤), 본문에서 경로 참조: `![<표준 alt>](/img/blog/<slug>-<n>.<ext>)`.
- **이미지 alt는 공통 문구로 통일**: `원주 언어치료 · 기업도시·지정면 언어치료 · 원주 언어발달센터 · 조이 언어발달센터` (alt 안에는 `[` `]` 금지 — 마크다운 깨짐. 키워드는 `·`로 구분).
- **base64 data URI 인라인 금지.** 이유: 글당 ~1MB↑ 증가 → 보드(`BlogCards`)가 import하는 블로그 아카이브 JSON이 통째로 비대(예: 33글 36MB)해져 **홈·커뮤니티 전 페이지 로딩/스크롤이 급락**. 파일로 빼면 아카이브 수백KB + 캐시·지연 로딩.
- 다운로드 시 Referer(`https://m.blog.naver.com/joylangcenter`) 헤더 필요.
- 원본에 **지도 이미지가 추가로 있으면 제거**(푸터 `<NaverMap />` 임베드로 대체, 임베드는 유지).

## 2') 첨부 파일(다운로드 자료) 처리
글에 **다운로드용 첨부 파일**(자료 나눔 PDF/HWP/PPT/ZIP 등)이 있으면, 네이버 대신 **우리 저장소에서 받을 수 있게** 한다.
- 첨부 링크 추출: `.se-module-fileList a` / `[data-linkdata]`(JSON의 `link` 값) / "파일 다운로드" 링크(`download.blog.naver.com/...`).
- **`static/downloads/<slug>.<ext>` 로 저장**(ASCII 안전 파일명, ext는 실제 확장자). 다운로드 시 Referer(`https://m.blog.naver.com/`) 헤더 필요. `file`로 형식 검증(예: `PDF document`).
- 본문 적절한 위치(보통 "## 자료 다운로드" 섹션)에 **다운로드 카드**를 넣는다 — 공용 클래스 `.blog-download-card`(파일 아이콘 + 파일명·형식·용량 + 다운로드 화살표, 스타일은 `src/css/custom.css`에 정의됨). 인라인 style 금지:
```jsx
<a className="blog-download-card" href="/downloads/<slug>.pdf" download>
  <span className="blog-download-card__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M9 13h6" /><path d="M9 17h4" /></svg></span>
  <span className="blog-download-card__meta"><span className="blog-download-card__name"><자료명></span><span className="blog-download-card__sub">PDF · <용량> · 내려받기</span></span>
  <span className="blog-download-card__arrow" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" /></svg></span>
</a>
```
※ 파일 용량은 `ls -la`로 확인해 표기(예: 7.3 MB). 텍스트는 반드시 `<span>` 안에 두어 MDX가 `<p>`로 감싸지 않게 한다(방어용 `.blog-download-card p{margin:0}` 존재).
- 네이버의 "첨부파일 / 파일 다운로드" **UI 텍스트 잔여물은 제거**하고, 실제 파일은 위 버튼으로 대체한다(§4 참고).

## 3) 파일 / 프론트매터
- 파일명 `blog/YYYY-MM-DD-joy-<type>-YYYYMMDD.mdx`, `slug: joy-<type>-YYYYMMDD`. 같은 날 같은 type 겹치면 slug 뒤 구분어(예: `-lecture`).
- frontmatter: `slug`, `title`(따옴표), `authors`, `tags: [ notice | news | library ]`, `description`, `keywords`(표준 그룹형 4개 — `원주 언어치료` / `원주 기업도시·지정면 언어치료` / `원주 언어발달센터` / `원주 기업도시·지정면 언어발달센터`. 언어치료 계열을 앞에 두고, 원주 반복은 그룹으로 묶는다).
- **`description`은 전역설정과 동일한 키워드 프리픽스로 시작**: `[원주 언어치료 · 기업도시·지정면 언어치료 · 원주 언어발달센터] ` 뒤에 글 요약 한 문장(따옴표로 감쌈). `title`에는 이 프리픽스를 넣지 않는다(제목 원문 유지).
- **`authors`는 작성 전 반드시 사용자에게 물어본다** — 선택지는 `blog/authors.yml`에 등록된 저자(현재 `dayealee`=다예쌤, `minjeong`=민정쌤). 사용자가 지정한 저자로 `authors: [ <id> ]` 설정(공동 저자면 `[ dayealee, minjeong ]`). 답을 얻기 전에는 임의로 정하지 않는다.
- 본문 시작: `import NaverMap from '@site/src/components/NaverMap';` → (빈 줄) → 표준 인사말(`<mark>언어치료 전문기관</mark>`, `**조이 언어발달센터**입니다.`). ※ `<!-- truncate -->`·상단 `<br /><br />` 는 넣지 않는다(목록은 커스텀 BlogCards 라 발췌 미사용).

## 4) 푸터와 겹치는 내용 제거
표준 푸터에 있는 내용은 본문에서 삭제 + 네이버 잔여물 제거:
- 맺음말("Let's enJOY in JOY" 등), 센터 연락처·주소
- 인스타/카카오/블로그 링크카드(팔로워 수 포함)
- 지도 place 위젯 텍스트("저장 / 전화 / 이 블로그의 체크인 / 이 장소의 다른 글")
- 영상 플레이어 잔여물("재생 / 좋아요 / 접기·펴기 / 00:23 / 100%"), 첨부·"파일 다운로드" **UI 텍스트** 잔여물(단, **실제 첨부 파일은 §2' 규칙대로 저장·버튼화**), `#해시태그`, 상단 반복 인사말
- 단 **외부 기관 연락처**(두루바른·난청협회·강릉센터 등)는 정보로 유지.

## 5) 마크다운 포맷
- **불필요한 `##` 남발 금지** — 진짜 섹션만 heading, 그 외 강조는 **볼드**.
- **`텍스트\n---` 금지**(Setext H2로 변함). `---`은 앞뒤 빈 줄로 가로선만.
- `**볼드**`·`<mark>`·`>`인용구·`✔️`체크리스트·리스트·**표** 활용.
- **따옴표 붙은 볼드(`**"..."**`)는 렌더 깨질 수 있음** → 발화/인용 예시는 `<mark>"..."</mark>`.
- 본문의 `<`,`{`,`}` 는 이스케이프(`&lt;`,`&#123;`,`&#125;`); 의도한 `<mark>` 등은 예외.
- 마무리 인사 등은 가운데 정렬(`<div style={{textAlign:'center', ...}}>`) 가능.

## 6) 가독성 — 줄바꿈
- 한 줄이 길지 않게 **하드 개행(줄 끝 공백 2칸 + 줄바꿈)**. 문장 끝(`.!?…`)·쉼표(`,`) 뒤, **쉼표 없어도 의미 구분 지점에서 개행 OK**.
- **너무 짧은 줄 금지**: (a) 최소 ~20자 되도록 짧은 쉼표 조각("즉,","예를 들어,")은 다음 조각과 합침, (b) 이모지/이모티콘·단어 없는 조각은 앞 줄에 붙임, (c) **숫자 뒤 마침표에서는 개행 안 함**(소수 `0.5초`·번호 `1.`·`내용 1.` 라벨 보호).
- 제목·리스트·표·이미지·frontmatter 내부는 개행 금지, 인용구는 `>` 접두어 유지.

## 7) 분류(tags) 매핑
- 공지/안내/휴강/선정 → `notice`
- 소식/인사/센터 이야기/후기/행사·세미나 안내 → `news`
- 교육자료/치료 팁/활동/발달 정보/자료 공유 → `library`
- 필요 시 보조 태그(예: 말소리 자료 `articulation`).

## 8) 표준 푸터 (가로선 뒤, 일반 텍스트 — 지도 임베드 유지)
⚠️ **연속된 줄(공간→센터명, 문의/카카오/인스타 4줄)은 각 줄 끝에 하드 개행(공백 2칸)** 을 넣어야 한다. 안 넣으면 마크다운이 한 문단으로 합쳐 개행이 사라진다. (아래 코드블록엔 공백이 안 보이니 주의)
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

## 관련 컴포넌트
- 게시판/공유 컴포넌트: `src/components/BlogCards.tsx`, 스타일 `BlogCards.module.css`
- 커뮤니티 페이지 swizzle: `src/theme/Blog*`, 게시글 페이지 스타일: `src/css/custom.css`(`.blog-post-page`)
- 로컬에서 네이버 지도는 도메인 인증 제한으로 "API 인증 실패" 표시(운영은 정상).
