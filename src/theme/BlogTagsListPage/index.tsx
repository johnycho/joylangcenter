import React, {type ReactNode} from 'react';
import clsx from 'clsx';
import {
  PageMetadata,
  HtmlClassNameProvider,
  ThemeClassNames,
} from '@docusaurus/theme-common';
import Layout from '@theme/Layout';
import SearchMetadata from '@theme/SearchMetadata';
import type {Props} from '@theme/BlogTagsListPage';

import BlogCards from '@site/src/components/BlogCards';
import styles from '@site/src/theme/community.module.css';

export default function BlogTagsListPage(_props: Props): ReactNode {
  return (
    <HtmlClassNameProvider
      className={clsx(
        ThemeClassNames.wrapper.blogPages,
        ThemeClassNames.page.blogTagsListPage,
      )}>
      <PageMetadata title="분류별 보기" />
      <SearchMetadata tag="blog_tags_list" />
      <Layout>
        <main className={styles.page}>
          <div className={styles.container}>
            <div className={styles.head}>
              <p className={styles.eyebrow}>COMMUNITY</p>
              <h1 className={styles.heading}>분류별 보기</h1>
              <p className={styles.sub}>관심 있는 분류를 골라 글을 확인해 보세요.</p>
            </div>
            <BlogCards showAllLink={false} wide paginate />
          </div>
        </main>
      </Layout>
    </HtmlClassNameProvider>
  );
}
