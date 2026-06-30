# /apps — 앱 센터 (조이언어발달센터)

QR로 여는 작은 도구 모음입니다. **Docusaurus 홈페이지와 독립된 순수 정적 사이트**로,
이 `static/apps/` 폴더 안에만 존재하며 홈페이지의 `blog/`·`docs/`·`src/` 와 섞이지 않습니다.

- 접속 주소: <https://joylangcenter.com/apps/>
- Docusaurus 는 `static/` 안의 파일을 가공 없이 그대로 복사해 서빙합니다. (React/MDX 처리 없음)

## 구조 (플랫)

```
static/apps/
├── index.html          # 허브 메인
├── registry.json       # 앱 목록 (자동 생성)
├── shared/             # 공통 테마/스크립트/로고
│   ├── theme.css
│   ├── discover.js
│   └── assets/joy-logo.png
├── tools/build.py      # registry/manifest 생성 스크립트
├── sound/              # https://joylangcenter.com/apps/sound/
│   ├── system.json
│   ├── assets/pecs.png
│   └── sounds/<카테고리>/*.mp3
└── qr/                 # https://joylangcenter.com/apps/qr/
    └── system.json
```

## 새 앱 추가

`static/apps/<이름>/` 폴더를 만들고 `index.html` 과 `system.json` 을 넣으면 끝입니다.
push 하면 `.github/workflows/apps-build.yml` 이 `registry.json`/`manifest.json` 을 자동 갱신합니다.
(로컬에서 직접 갱신하려면: `python3 static/apps/tools/build.py`)

소리 재생용 사운드는 `sound/sounds/<카테고리>/` 폴더에 `.mp3` 를 넣으면 그 폴더명이 카테고리가 됩니다.
