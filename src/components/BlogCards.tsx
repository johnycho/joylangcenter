import React from 'react';
import Link from '@docusaurus/Link';
import blogPosts from '@generated/docusaurus-plugin-content-blog/default/p/blog-archive-f05.json';
import styles from './BlogCards.module.css';
import useBaseUrl from '@docusaurus/useBaseUrl';

const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;

type Props = {
  tag: string; // ex) 'news' or 'notice'
  title: string; // 게시판 제목
  moreHref?: string; // '전체보기' 링크
  max?: number;
};

export default function BlogBoardByTag({ tag, title, moreHref, max = 6 }: Props) {
  const newBadgeUrl = useBaseUrl('/img/new-badge.gif');

  const filteredPosts = blogPosts.archive.blogPosts
    .filter((post) => post.metadata.tags?.some((t) => t.permalink.includes(tag)))
    .slice(0, max);

  return (
    <div className={styles.panel}>
      <div className={styles.panelHead}>
        <h3 className={styles.panelTitle}>{title}</h3>
        {moreHref && (
          <Link to={moreHref} className={styles.moreLink}>전체보기 →</Link>
        )}
      </div>

      <ul className={styles.list}>
        {filteredPosts.map((post, idx) => {
          const published = new Date(post.metadata.date);
          const isNew = Date.now() - published.getTime() <= TWO_WEEKS_MS;
          const formattedDate = published.toLocaleDateString('ko-KR', {
            year: '2-digit',
            month: '2-digit',
            day: '2-digit',
          });

          return (
            <li key={idx}>
              <Link to={post.metadata.permalink} className={styles.row}>
                <span className={styles.rowTitle}>
                  <span className={styles.rowText}>{post.metadata.title}</span>
                  {isNew && (
                    <img
                      src={newBadgeUrl}
                      alt="NEW"
                      className={styles.newBadge}
                      loading="lazy"
                      decoding="async"
                    />
                  )}
                </span>
                <span className={styles.rowDate}>{formattedDate}</span>
              </Link>
            </li>
          );
        })}
        {filteredPosts.length === 0 && (
          <li className={styles.empty}>아직 등록된 글이 없어요.</li>
        )}
      </ul>
    </div>
  );
}
