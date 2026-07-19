import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: '조이 언어발달센터',
  tagline: 'Joy Language Development Center',
  favicon: '/favicon.ico?v=0.1', // 지정 안해도 static/ 하위에 favicon.ico 파일이 있다면 자동 인식 하는듯..?

  // Set the production url of your site here
  url: 'https://joylangcenter.com', // GitHub Pages URL
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/', // 리포지토리 이름
  deploymentBranch: 'gh-pages', // 배포 브랜치
  trailingSlash: false,

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'johnycho', // GitHub 사용자명
  projectName: 'joylangcenter', // GitHub 리포지토리 이름

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  // 홈 CTA(#contact)·치료분야 Section(#articulation 등)은 컴포넌트 렌더 id를 스크롤 타깃으로 쓴다.
  // Docusaurus 정적 검사기는 heading 앵커만 추적해 이들을 broken 으로 오탐 → 런타임엔 정상이라 무시.
  onBrokenAnchors: 'ignore',

  // 전 페이지 공통 스크롤 진입 애니메이션
  clientModules: [require.resolve('./src/clientModules/scrollReveal.ts')],

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'ko',
    locales: ['ko'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // editUrl:
          //     'https://github.com/johnycho/johny-dev/edit/main/',
        },
        blog: {
          path: 'blog',
          routeBasePath: 'blog',
          blogTitle: '커뮤니티',
          blogDescription: '공지사항과 센터소식을 전달합니다.',
          postsPerPage: 10, // 한 페이지당 표시할 게시글 개수 (기본값: 10)
          blogSidebarTitle: '전체 목록',
          // blogSidebarCount: 0,     // 사이드바 숨김
          blogSidebarCount: "ALL", // 사이드바에 모든 게시글 표시
          showReadingTime: false,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // editUrl:
          //   'https://github.com/johnycho/johny-dev/edit/main/',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // SEO 설정
    metadata: [
      {
        name: 'naver-site-verification',
        content: '6b8a11e554c091a99cfa5b16841bb7492467edc4',
      },
      {
        name: 'google-site-verification',
        content: '4QSKEBZPsrA58oIGTu6eAvprx7JPbWqIWzQ7ZoSrcPM',
      },
      {
        name: 'robots',
        content: 'index,follow'
      },
      {
        name: 'subject',
        content: '조이 언어발달센터'
      },
      {
        name: 'author',
        content: '조이 언어발달센터'
      },
      {
        name: 'keywords',
        content: '원주 언어치료, 원주 기업도시·지정면 언어치료, 원주 언어발달센터, 원주 기업도시·지정면 언어발달센터, 언어치료, 언어재활, 아동발달'
      },
      {
        name: 'description',
        content: '[원주 언어치료 · 기업도시·지정면 언어치료 · 원주 언어발달센터] 조이 언어발달센터는 자폐스펙트럼장애, 지적장애, 유창성(말더듬)장애, 단순 언어발달장애, 조음(발음) 장애 아동의 기능적이고 즐거운 언어치료 수업을 만들어가고자 합니다.',
      }
    ],
    // Replace with your project's social card
    image: 'img/joy-thumbnail.png',
    colorMode: {
      defaultMode: 'light',
      disableSwitch: true, // 다크/라이트 모드 전환 허용 (true로 설정하면 버튼이 사라짐)
      respectPrefersColorScheme: false, // OS 설정과 관계없이 다크 모드 강제 적용
    },
    algolia: {
      appId: "6G3R6VY6O0", // 이메일에서 받은 appId
      apiKey: "b52a6aa53f7ee27bad5942ec5c565a90", // 검색 API 키 (공개용)
      indexName: "joylangcenter", // 인덱스 이름
      contextualSearch: false, // 현재 문맥(버전, 언어)에 맞는 검색 결과만 표시
      searchPagePath: "search", // 검색 페이지 활성화
    },
    docs: {
      sidebar: {
        autoCollapseCategories: true, // 다른 카테고리를 열면 자동으로 기존 카테고리 접힘
        hideable: true, // 접을 수 있는 버튼 표시
      },
    },
    navbar: {
      // title: '조이 언어발달센터',
      logo: {
        alt: '조이 언어발달센터, 원주 언어치료센터, 원주 언어재활센터, 원주 언어발달센터',
        src: 'img/logo-joy.png',
      },
      items: [
        {
          to: '/docs/intro',
          label: '센터소개',
          position: 'left',
          type: 'dropdown',
          items: [
            {label: "인사말", to: "/docs/intro"},
            {label: "오시는 길", to: "docs/location"},
            {label: "치료 분야", to: "/docs/therapy-areas"},
            {label: "평가 및 검사", to: "/docs/assessment"},
            {label: "선생님 소개", to: "/docs/therapist"},
          ],
        },
        {
          to: "/blog",
          label: "커뮤니티",
          position: "left",
          items: [
            {label: "공지사항", to: "/blog/tags/notice"},
            {label: "센터소식", to: "/blog/tags/news"},
            {label: "교육자료", to: "/blog/tags/library"},
          ],
        },
        {
          // /apps 는 Docusaurus 라우트가 아닌 정적 페이지 → pathname:// 으로 전체 이동
          // (broken-link 검사 제외) + target _self 로 같은 탭에서 열기
          to: 'pathname:///apps/',
          target: '_self',
          label: '앱 센터',
          position: 'left',
        },
        {
          to: '/#contact',
          label: '상담문의',
          position: 'right',
          className: 'navbar-cta',
        },
        {
          type: 'html',
          position: 'right',
          value: `
            <div class="social-icons">
              <a href="tel:033-745-1030" class="navbar-phone" aria-label="전화 상담 033-745-1030"><svg width="20" height="20" viewBox="0 0 24 24" fill="#f2921d"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg></a>
              <a href="https://pf.kakao.com/_sxjPXn" class="navbar-kakao-channel-logo" aria-label="Kakao Channel" target="_blank" rel="noopener noreferrer"></a>
              <a href="https://blog.naver.com/joylangcenter" class="navbar-naver-blog-logo" aria-label="Naver Blog" target="_blank" rel="noopener noreferrer"></a>
              <a href="https://instagram.com/joylangcenter" class="navbar-instagram-logo" aria-label="Instagram" target="_blank" rel="noopener noreferrer"></a>
            </div>
          `
        },
      ],
    },
    footer: {
      style: 'dark',
      // links: [
      //   {
      //     title: 'Posts',
      //     items: [
      //       {
      //         label: 'Hello',
      //         to: '/blog/johny-dev-blog-launched',
      //       },
      //     ],
      //   },
      //   {
      //     title: 'Community',
      //     items: [
      //       {
      //         className: 'navbar-naver-blog-logo',
      //         href: 'https://stackoverflow.com/questions/tagged/docusaurus',
      //       },
      //       {
      //         label: 'Discord',
      //         href: 'https://discordapp.com/invite/docusaurus',
      //       },
      //       {
      //         label: 'X',
      //         href: 'https://x.com/docusaurus',
      //       },
      //     ],
      //   },
      //   {
      //     title: 'More',
      //     items: [
      //       {
      //         label: 'GitHub',
      //         href: 'https://github.com/johnycho',
      //       },
      //     ],
      //   },
      // ],
      copyright: `Copyright © ${new Date().getFullYear()} 조이 언어발달센터. All rights reserved.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['java'], // Java 코드 하이라이트 활성화
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
