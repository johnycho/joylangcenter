import React from 'react';
import Link from '@docusaurus/Link';
import blogPosts from '@generated/docusaurus-plugin-content-blog/default/p/blog-archive-f05.json';
import styles from './BlogCards.module.css';
import useBaseUrl from '@docusaurus/useBaseUrl';

const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;

type Props = {
  tag: string; // ex) 'news' or 'notice'
  title: string; // 섹션 제목
  max?: number;
};

export default function BlogCardsByTag({ tag, title, max = 10 }: Props) {
  const filteredPosts = blogPosts.archive.blogPosts
  .filter(post =>
      post.metadata.tags?.some(t => t.permalink.includes(tag))
  )
  .slice(0, max);

  return (
      <section className={styles.section}>
        <h3 className={styles.title}>{title}</h3>
        <div className={styles.cardRow}>
          {filteredPosts.map((post, idx) => {
            const published = new Date(post.metadata.date);
            const isNew = Date.now() - published.getTime() <= TWO_WEEKS_MS;

            const formattedDate = published.toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
            });

            return (
                <Link key={idx} to={post.metadata.permalink} className={styles.card}>
                  <h4>
                    {post.metadata.title}
                    {isNew && (
                        <img
                            src={useBaseUrl('/img/new-badge.gif')}
                            alt="NEW"
                            className={styles.newBadge}
                            loading="lazy"
                            decoding="async"
                        />
                    )}
                  </h4>
                  <span className={styles.date}>{formattedDate}</span>
                </Link>
            );
          })}
        </div>
      </section>
  );
}