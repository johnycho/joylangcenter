import React, {useState} from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import blogPosts from '@generated/docusaurus-plugin-content-blog/default/p/blog-archive-f05.json';
import styles from './BlogCards.module.css';

const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;
const PAGE = 10;

const TAGS = [
  {key: 'notice', label: '공지사항'},
  {key: 'news', label: '센터소식'},
  {key: 'info', label: '정보공유'},
  {key: 'library', label: '교육자료'},
];

type Props = {
  /** 처음 선택될 분류 (notice/news/library/all). 기본 'all' */
  initialFilter?: string;
  /** 특정 태그로 고정해 보여줄 때 (분류 필터 버튼 숨김) */
  lockTag?: {permalink: string; label: string} | null;
  /** 하단 '전체보기 →' 링크 표시 여부 (메인페이지용). 기본 true */
  showAllLink?: boolean;
  /** 넓은 레이아웃 (커뮤니티 페이지용). 기본 false */
  wide?: boolean;
  /** 내부 분류 필터바 숨김 (외부에서 필터를 제어할 때). 기본 false */
  hideFilters?: boolean;
  /** 페이지 번호 방식 사용 (커뮤니티 페이지용). 기본 false → 미리보기 10개 */
  paginate?: boolean;
  /** 검색창 표시 (게시판 페이지용). 기본 false */
  showSearch?: boolean;
};

/** 텍스트에서 검색어와 일치하는 부분을 하이라이트 (제목·분류칩·작성자 공통) */
function highlight(text: string, q: string): React.ReactNode {
  if (!q) return text;
  const i = text.toLowerCase().indexOf(q);
  if (i < 0) return text;
  return (
    <>
      {text.slice(0, i)}
      <mark className={styles.hl}>{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  );
}

export default function NewsBoard({
  initialFilter = 'all',
  lockTag = null,
  showAllLink = true,
  wide = false,
  hideFilters = false,
  paginate = false,
  showSearch = false,
}: Props = {}) {
  const [filter, setFilter] = useState<string>(initialFilter);
  const [page, setPage] = useState<number>(1);
  const [query, setQuery] = useState<string>('');
  const {siteConfig} = useDocusaurusContext();

  // 같은 사이트의 절대 URL이면 상대경로로 변환해 클라이언트 라우팅되게 함
  const toProfileLink = (url?: string) =>
    url && url.startsWith(siteConfig.url) ? url.slice(siteConfig.url.length) || '/' : url;

  const select = (key: string) => {
    setFilter(key);
    setPage(1);
  };

  const posts = blogPosts.archive.blogPosts
    .map((post) => ({
      post,
      keys: TAGS.filter((t) => post.metadata.tags?.some((pt) => pt.permalink.includes(t.key))).map((t) => t.key),
    }))
    .filter((x) => x.keys.length > 0)
    .sort((a, b) => new Date(b.post.metadata.date).getTime() - new Date(a.post.metadata.date).getTime());

  const countAll = posts.length;
  const countByKey: Record<string, number> = Object.fromEntries(
    TAGS.map((t) => [t.key, posts.filter((x) => x.keys.includes(t.key)).length]),
  );

  const matched = lockTag
    ? posts.filter((x) => x.post.metadata.tags?.some((pt) => pt.permalink === lockTag.permalink))
    : filter === 'all'
      ? posts
      : posts.filter((x) => x.keys.includes(filter));
  // 검색어 필터 — 제목·분류(라벨)·작성자 부분일치
  const q = query.trim().toLowerCase();
  const filtered = q
    ? matched.filter(
        ({post, keys}) =>
          post.metadata.title.toLowerCase().includes(q) ||
          keys.some((k) => (TAGS.find((t) => t.key === k)?.label || '').toLowerCase().includes(q)) ||
          (post.metadata.authors?.[0]?.name || '').toLowerCase().includes(q),
      )
    : matched;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const curPage = Math.min(page, totalPages);
  const startIdx = paginate ? (curPage - 1) * PAGE : 0;
  const shown = paginate ? filtered.slice(startIdx, startIdx + PAGE) : filtered.slice(0, PAGE);
  const moreUrl = filter === 'all' ? '/blog' : `/blog/tags/${filter}`;

  return (
    <div className={`${styles.board} ${wide ? styles.boardWide : ''}`}>
      {showSearch && (
        <div className={styles.searchRow}>
          <svg className={styles.searchIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/><path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          <input
            type="search"
            className={styles.searchInput}
            placeholder="분류·제목·작성자 검색…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            aria-label="게시판 검색"
          />
        </div>
      )}
      {!lockTag && !hideFilters && (
        <div className={styles.filters}>
          <button type="button" className={`${styles.fbtn} ${filter === 'all' ? styles.fbtnOn : ''}`} onClick={() => select('all')}>전체<span className={styles.fbtnCount}>{countAll}</span></button>
          {TAGS.map((t) => (
            <button key={t.key} type="button" className={`${styles.fbtn} ${filter === t.key ? styles.fbtnOn : ''}`} onClick={() => select(t.key)}>{t.label}<span className={styles.fbtnCount}>{countByKey[t.key]}</span></button>
          ))}
        </div>
      )}

      <div className={styles.listHead} aria-hidden="true">
        <span className={styles.colIndex}>번호</span>
        <span className={styles.colTag}>분류</span>
        <span className={styles.colTitle}>제목</span>
        <span className={styles.colDate}>날짜</span>
        <span className={styles.colAuthor}>작성자</span>
      </div>

      <ul className={styles.list}>
        {shown.map(({post, keys}, idx) => {
          const published = new Date(post.metadata.date);
          const isNew = Date.now() - published.getTime() <= TWO_WEEKS_MS;
          const date = published.toLocaleDateString('ko-KR', {year: '2-digit', month: '2-digit', day: '2-digit'});
          const primary = TAGS.find((t) => t.key === keys[0]);
          const chipKey = keys[0] || '';
          const chipLabel = primary?.label ?? lockTag?.label ?? '소식';
          const author = post.metadata.authors?.[0];
          const authorInner = author && (
            <>
              <span className={styles.authorName}>{highlight(author.name, q)}</span>
              <span className={styles.authorCard} role="tooltip">
                {author.imageURL && (
                  <img src={author.imageURL} alt="" className={styles.authorCardImg} loading="lazy" decoding="async" />
                )}
                <span className={styles.authorCardInfo}>
                  <span className={styles.authorCardName}>{author.name}</span>
                  {author.title && <span className={styles.authorCardTitle}>{author.title}</span>}
                </span>
              </span>
            </>
          );
          return (
            <li key={idx}>
              <div className={styles.row}>
                <Link to={post.metadata.permalink} className={styles.rowMain}>
                  <span className={styles.rowIndex}>{startIdx + idx + 1}</span>
                  <span className={`${styles.tagChip} ${styles['t_' + chipKey] || ''}`}>{highlight(chipLabel, q)}</span>
                  <span className={styles.rowTitle}>
                    <span className={styles.rowText}>
                      {isNew && <span className={styles.newTag}>NEW</span>}
                      {highlight(post.metadata.title, q)}
                    </span>
                  </span>
                  <span className={styles.rowDate}>{date}</span>
                </Link>
                {author && (
                  author.url ? (
                    <Link to={toProfileLink(author.url)} className={styles.rowAuthor}>{authorInner}</Link>
                  ) : (
                    <span className={styles.rowAuthor}>{authorInner}</span>
                  )
                )}
              </div>
            </li>
          );
        })}
        {shown.length === 0 && (
          <li className={styles.empty}>
            {q ? `'${query.trim()}' 검색 결과가 없어요.` : '해당 분류의 글이 없어요.'}
          </li>
        )}
      </ul>

      {renderFooter()}
    </div>
  );

  function renderFooter() {
    // 표시할 번호 윈도우 (최대 5개) — 페이지가 많아도 번호가 넘치지 않게
    const WINDOW = 5;
    let winStart = Math.max(1, curPage - Math.floor(WINDOW / 2));
    const winEnd = Math.min(totalPages, winStart + WINDOW - 1);
    winStart = Math.max(1, winEnd - WINDOW + 1);
    const nums = Array.from({length: winEnd - winStart + 1}, (_, i) => winStart + i);

    const pagerNav = paginate && totalPages > 1 && (
      <nav className={styles.pagerGroup} aria-label="페이지 탐색">
        <button
          type="button"
          className={styles.pageBtn}
          onClick={() => setPage(1)}
          disabled={curPage === 1}
          aria-label="맨 앞 페이지">«</button>
        <button
          type="button"
          className={styles.pageBtn}
          onClick={() => setPage(curPage - 1)}
          disabled={curPage === 1}
          aria-label="이전 페이지">‹</button>
        {winStart > 1 && <span className={styles.pageEllipsis}>…</span>}
        {nums.map((n) => (
          <button
            key={n}
            type="button"
            className={`${styles.pageBtn} ${n === curPage ? styles.pageBtnOn : ''}`}
            onClick={() => setPage(n)}
            aria-current={n === curPage ? 'page' : undefined}>{n}</button>
        ))}
        {winEnd < totalPages && <span className={styles.pageEllipsis}>…</span>}
        <button
          type="button"
          className={styles.pageBtn}
          onClick={() => setPage(curPage + 1)}
          disabled={curPage === totalPages}
          aria-label="다음 페이지">›</button>
        <button
          type="button"
          className={styles.pageBtn}
          onClick={() => setPage(totalPages)}
          disabled={curPage === totalPages}
          aria-label="맨 뒤 페이지">»</button>
      </nav>
    );

    // 전체보기 링크 없이 페이저만: 중앙 정렬 단독 바
    if (paginate && !showAllLink) {
      return pagerNav ? <div className={styles.pager}>{pagerNav}</div> : null;
    }

    // 그 외(메인페이지 등): 페이저(있으면) + 전체보기 링크 한 줄
    if (!showAllLink) {
      return null;
    }
    return (
      <div className={styles.boardFoot}>
        <span />
        {pagerNav || <span />}
        <Link to={moreUrl} className={styles.allLink}>전체보기 →</Link>
      </div>
    );
  }
}
