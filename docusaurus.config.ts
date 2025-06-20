import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: '조니의 개발 블로그',
  tagline: 'Developer Archive',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://johnycho.dev', // GitHub Pages URL
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/', // 리포지토리 이름
  deploymentBranch: 'gh-pages', // 배포 브랜치
  trailingSlash: false,

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'johnycho', // GitHub 사용자명
  projectName: 'johny-dev', // GitHub 리포지토리 이름

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
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false, // 다크/라이트 모드 전환 허용 (true로 설정하면 버튼이 사라짐)
      respectPrefersColorScheme: false, // OS 설정과 관계없이 다크 모드 강제 적용
    },
    algolia: {
      appId: "NAZXBH587R", // 이메일에서 받은 appId
      apiKey: "23b7dab8ddab0fec1bce2b3e039e09f9", // 검색 API 키 (공개용)
      indexName: "johnycho", // 인덱스 이름
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
      title: '조니의 개발 블로그',
      logo: {
        alt: 'Johny Dev Logo',
        src: 'https://github.com/johnycho.png',
        className: 'custom-navbar-logo' /* 로고 이미지 원형으로 만들기 */
      },
      items: [
        {
          to: '/docs/intro',
          label: 'Docs',
          position: 'left',
          type: 'dropdown',
          items: [
            {type: "docSidebar", sidebarId: "johnyDocsSidebar", label: "All Docs"},
            {label: "Tags", to: "/docs/tags"},
          ],
        },
        {
          to: "/blog",
          label: "Blog",
          position: "left",
          items: [
            {label: "All Posts", to: "/blog"},
            {label: "Archive", to: "/blog/archive"},
            {label: "Tags", to: "/blog/tags"},
          ],
        },
        {
          href: 'https://github.com/johnycho',
          // label: 'GitHub',
          position: 'right',
          className: 'navbar-github-logo',
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
      //         label: 'Stack Overflow',
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
      copyright: `Copyright © ${new Date().getFullYear()} Johny Cho. All rights reserved.`,
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
