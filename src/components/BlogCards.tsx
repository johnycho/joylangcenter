import React, {useState} from 'react';
import Link from '@docusaurus/Link';
import blogPosts from '@generated/docusaurus-plugin-content-blog/default/p/blog-archive-f05.json';
import styles from './BlogCards.module.css';
import useBaseUrl from '@docusaurus/useBaseUrl';

const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;
const PAGE = 10;

const TAGS = [
  {key: 'notice', label: '공지사항'},
  {key: 'news', label: '센터 소식'},
  {key: 'library', label: '교육자료'},
];

export default function NewsBoard() {
  const [filter, setFilter] = useState<string>('all');
  const [visible, setVisible] = useState<number>(PAGE);
  const newBadgeUrl = useBaseUrl('/img/new-badge.gif');

  const select = (key: string) => {
    setFilter(key);
    setVisible(PAGE);
  };

  const posts = blogPosts.archive.blogPosts
    .map((post) => ({
      post,
      keys: TAGS.filter((t) => post.metadata.tags?.some((pt) => pt.permalink.includes(t.key))).map((t) => t.key),
    }))
    .filter((x) => x.keys.length > 0)
    .sort((a, b) => new Date(b.post.metadata.date).getTime() - new Date(a.post.metadata.date).getTime());

  const matched = filter === 'all' ? posts : posts.filter((x) => x.keys.includes(filter));
  const shown = matched.slice(0, visible);
  const moreUrl = filter === 'all' ? '/blog/archive' : `/blog/tags/${filter}`;

  return (
    <div className={styles.board}>
      <div className={styles.filters}>
        <button type="button" className={`${styles.fbtn} ${filter === 'all' ? styles.fbtnOn : ''}`} onClick={() => select('all')}>전체</button>
        {TAGS.map((t) => (
          <button key={t.key} type="button" className={`${styles.fbtn} ${filter === t.key ? styles.fbtnOn : ''}`} onClick={() => select(t.key)}>{t.label}</button>
        ))}
      </div>

      <ul className={styles.list}>
        {shown.map(({post, keys}, idx) => {
          const published = new Date(post.metadata.date);
          const isNew = Date.now() - published.getTime() <= TWO_WEEKS_MS;
          const date = published.toLocaleDateString('ko-KR', {year: '2-digit', month: '2-digit', day: '2-digit'});
          const primary = TAGS.find((t) => t.key === keys[0]);
          return (
            <li key={idx}>
              <Link to={post.metadata.permalink} className={styles.row}>
                <span className={`${styles.tagChip} ${styles['t_' + keys[0]] || ''}`}>{primary?.label}</span>
                <span className={styles.rowTitle}>
                  <span className={styles.rowText}>{post.metadata.title}</span>
                  {isNew && <img src={newBadgeUrl} alt="NEW" className={styles.newBadge} loading="lazy" decoding="async" />}
                </span>
                <span className={styles.rowDate}>{date}</span>
              </Link>
            </li>
          );
        })}
        {shown.length === 0 && <li className={styles.empty}>해당 분류의 글이 없어요.</li>}
      </ul>

      <div className={styles.boardFoot}>
        {matched.length > visible ? (
          <button type="button" className={styles.moreBtn} onClick={() => setVisible((v) => v + PAGE)}>더보기</button>
        ) : (
          <span />
        )}
        <Link to={moreUrl} className={styles.allLink}>전체보기 →</Link>
      </div>
    </div>
  );
}
