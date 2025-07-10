import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: '조이 언어발달센터',
  tagline: 'Joy Language Development Center',
  favicon: 'img/favicon.ico',

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
          postsPerPage: 10, // 한 페이지당 표시할 게시글 개수 (기본값: 10)
          blogSidebarCount: "ALL", // 사이드바에 모든 게시글 표시
          showReadingTime: true,
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
    // 네이버 SEO 설정
    metadata: [
      {
        name: 'naver-site-verification',
        content: '6b8a11e554c091a99cfa5b16841bb7492467edc4',
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
        alt: 'Joy Logo',
        src: 'img/logo-joy.png',
      },
      items: [
        {
          to: '/docs/intro',
          label: '센터소개',
          position: 'left',
          type: 'dropdown',
          items: [
            {type: "docSidebar", sidebarId: "johnyDocsSidebar", label: "인사말"},
            {label: "선생님 소개", to: "/docs/category/선생님-소개"},
          ],
        },
        {
          to: "/blog",
          label: "커뮤니티",
          position: "left",
          items: [
            {label: "공지사항", to: "/blog/tags/notice"},
            {label: "센터소식", to: "/blog/tags/news"},
          ],
        },
        {
          type: 'html',
          position: 'right',
          value: `
            <div class="social-icons">
              <a href="https://blog.naver.com/joylangcenter" class="navbar-naver-blog-logo" aria-label="Naver Blog" target="_blank" rel="noopener noreferrer"></a>
              <a href="https://instagram.com/joylangcenter" class="navbar-instagram-logo" aria-label="Instagram" target="_blank" rel="noopener noreferrer"></a>
              <a href="https://pf.kakao.com/_sxjPXn" class="navbar-kakao-channel-logo" aria-label="Kakao Channel" target="_blank" rel="noopener noreferrer"></a>
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
      copyright: `Copyright © ${new Date().getFullYear()} Joy Language Development Center. All rights reserved.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['java'], // Java 코드 하이라이트 활성화
    },
  } satisfies Preset.ThemeConfig,

  scripts: [
    {
      src: 'https://johny-dev.disqus.com/count.js',
      async: true,
      id: 'dsq-count-scr'
    }
  ],
};

export default config;
