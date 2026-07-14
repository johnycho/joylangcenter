import React, {type ReactNode} from 'react';
import {PageMetadata} from '@docusaurus/theme-common';
import Layout from '@theme/Layout';
import type {Props} from '@theme/BlogArchivePage';

import BlogCards from '@site/src/components/BlogCards';
import styles from '@site/src/theme/community.module.css';

export default function BlogArchive(_props: Props): ReactNode {
  return (
    <>
      <PageMetadata title="커뮤니티" description="공지사항·센터소식·교육자료 전체 목록" />
      <Layout>
        <main className={styles.page}>
          <div className={styles.container}>
            <div className={styles.head}>
              <p className={styles.eyebrow}>COMMUNITY</p>
              <h1 className={styles.heading}>전체 글</h1>
              <p className={styles.sub}>공지사항·센터소식·교육자료를 한곳에서 확인하세요.</p>
            </div>
            <BlogCards showAllLink={false} wide paginate />
          </div>
        </main>
      </Layout>
    </>
  );
}
