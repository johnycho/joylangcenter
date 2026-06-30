import React, {useState, type ReactNode} from 'react';
import clsx from 'clsx';
import {
  PageMetadata,
  HtmlClassNameProvider,
  ThemeClassNames,
} from '@docusaurus/theme-common';
import Layout from '@theme/Layout';
import SearchMetadata from '@theme/SearchMetadata';
import type {Props} from '@theme/BlogTagsListPage';

import blogPosts from '@generated/docusaurus-plugin-content-blog/default/p/blog-archive-f05.json';
import BlogCards from '@site/src/components/BlogCards';
import styles from '@site/src/theme/community.module.css';

const ALL = 'all';

export default function BlogTagsListPage({tags}: Props): ReactNode {
  const [selected, setSelected] = useState<string>(ALL);
  // 한 글이 여러 태그를 가질 수 있으므로 '전체'는 태그 개수 합이 아닌
  // 게시판에 실제로 노출되는(분류 태그가 하나라도 있는) 글의 고유 개수로 표시
  const tagPermalinks = new Set(tags.map((t) => t.permalink));
  const total = blogPosts.archive.blogPosts.filter((p) =>
    p.metadata.tags?.some((t) => tagPermalinks.has(t.permalink)),
  ).length;
  const current = tags.find((t) => t.permalink === selected) ?? null;

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

            <div className={styles.tagRow}>
              <button
                type="button"
                className={clsx(styles.tagPill, selected === ALL && styles.tagPillOn)}
                onClick={() => setSelected(ALL)}>
                전체
                <span className={styles.tagCount}>{total}</span>
              </button>
              {tags.map((tag) => (
                <button
                  key={tag.permalink}
                  type="button"
                  className={clsx(styles.tagPill, selected === tag.permalink && styles.tagPillOn)}
                  onClick={() => setSelected(tag.permalink)}>
                  {tag.label}
                  <span className={styles.tagCount}>{tag.count}</span>
                </button>
              ))}
            </div>

            <BlogCards
              key={selected}
              hideFilters
              lockTag={current ? {permalink: current.permalink, label: current.label} : null}
              showAllLink={false}
              wide
              paginate
            />
          </div>
        </main>
      </Layout>
    </HtmlClassNameProvider>
  );
}
