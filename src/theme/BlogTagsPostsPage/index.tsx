import React, {type ReactNode} from 'react';
import clsx from 'clsx';
import {
  PageMetadata,
  HtmlClassNameProvider,
  ThemeClassNames,
} from '@docusaurus/theme-common';
import {useBlogTagsPostsPageTitle} from '@docusaurus/theme-common/internal';
import Layout from '@theme/Layout';
import SearchMetadata from '@theme/SearchMetadata';
import Unlisted from '@theme/ContentVisibility/Unlisted';
import type {Props} from '@theme/BlogTagsPostsPage';

import BlogCards from '@site/src/components/BlogCards';
import styles from '@site/src/theme/community.module.css';

// 분류별 안내 문구 (유저 친화적)
const SUBTITLES: Record<string, string> = {
  notice: '센터의 새로운 안내와 공지를 확인해 보세요.',
  news: '조이 언어발달센터의 따뜻한 소식을 전해드려요.',
  library: '집에서도 활용할 수 있는 언어발달 교육자료예요.',
  info: '언어·청각·발달과 관련해 알아두면 좋은 정보를 나눠요.',
};

function BlogTagsPostsPageMetadata({tag}: Props): ReactNode {
  const title = useBlogTagsPostsPageTitle(tag);
  return (
    <>
      <PageMetadata title={title} description={tag.description} />
      <SearchMetadata tag="blog_tags_posts" />
    </>
  );
}

export default function BlogTagsPostsPage(props: Props): ReactNode {
  const {tag} = props;
  // permalink 예: /blog/tags/notice → 'notice'
  const tagKey = tag.permalink.split('/').filter(Boolean).pop() ?? '';

  return (
    <HtmlClassNameProvider
      className={clsx(
        ThemeClassNames.wrapper.blogPages,
        ThemeClassNames.page.blogTagPostListPage,
      )}>
      <BlogTagsPostsPageMetadata {...props} />
      <Layout>
        <main className={styles.page}>
          <div className={styles.container}>
            <div className={styles.head}>
              <p className={styles.eyebrow}>COMMUNITY</p>
              <h1 className={styles.heading}>{tag.label}</h1>
              <p className={styles.sub}>
                {tag.description ??
                  SUBTITLES[tagKey] ??
                  `‘${tag.label}’ 관련 글을 모았어요.`}
              </p>
            </div>
            {tag.unlisted && <Unlisted />}
            <BlogCards
              lockTag={{permalink: tag.permalink, label: tag.label}}
              showAllLink={false}
              wide
              paginate
              showSearch
            />
          </div>
        </main>
      </Layout>
    </HtmlClassNameProvider>
  );
}
