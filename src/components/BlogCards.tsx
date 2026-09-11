import React, {useEffect, useState} from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import blogPosts from '@generated/docusaurus-plugin-content-blog/default/p/blog-archive-f05.json';
import {fetchViews} from '@site/src/viewCount';
import styles from './BlogCards.module.css';

const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;
const PAGE = 10;

const TAGS = [
  {key: 'notice', label: '공지사항'},
  {key: 'news', label: '센터소식'},
  {key: 'info', label: '정보공유'},
  {key: 'library', label: '교육자료'},
];

// 인기글(BEST) 번호칸에 표시할 금메달 아이콘 — 리본 + 골드 메달리온 + 별 (직접 그린 SVG)
function BestCrown() {
  return (
    <svg className={styles.bestCrown} viewBox="0 0 24 24" role="img" aria-label="인기글">
      <defs>
        <linearGradient id="joyBestMedal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe07a" />
          <stop offset="1" stopColor="#f5a300" />
        </linearGradient>
      </defs>
      {/* 리본 */}
      <path d="M7.5 2h3.2l1.3 8-3.2.6L5.6 3.2z" fill="#e2584f" />
      <path d="M16.5 2h-3.2l-1.3 8 3.2.6 2.4-7.4z" fill="#4a7fd0" />
      {/* 메달리온 */}
      <circle cx="12" cy="16" r="6.2" fill="url(#joyBestMedal)" stroke="#e08c00" strokeWidth="0.9" />
      <circle cx="12" cy="16" r="4.4" fill="none" stroke="#ffe694" strokeWidth="0.9" />
      {/* 가운데 별 */}
      <path
        d="M12 13l0.8 1.9 2.1 0.2-1.6 1.3 0.5 2-1.8-1-1.8 1 0.5-2-1.6-1.3 2.1-0.2z"
        fill="#fff4cf"
        stroke="#f0a91e"
        strokeWidth="0.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// 게시판 컬럼. sortable=true인 컬럼만 헤더 클릭으로 정렬(오름→내림→원래순 3단계). 번호는 정렬 제외.
const COLS = [
  {key: 'index', label: '번호', cls: 'colIndex', sortable: false},
  {key: 'tag', label: '분류', cls: 'colTag', sortable: true},
  {key: 'title', label: '제목', cls: 'colTitle', sortable: true},
  {key: 'date', label: '작성일', cls: 'colDate', sortable: true},
  {key: 'author', label: '작성자', cls: 'colAuthor', sortable: true},
  {key: 'views', label: '조회수', cls: 'colViews', sortable: true},
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
  /** 조회수 1위 글을 상단에 '인기글'로 강조 노출. 기본 true */
  highlightBest?: boolean;
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
  highlightBest = true,
}: Props = {}) {
  const [filter, setFilter] = useState<string>(initialFilter);
  const [page, setPage] = useState<number>(1);
  const [query, setQuery] = useState<string>('');
  const [views, setViews] = useState<Record<string, number>>({});
  const [viewsLoaded, setViewsLoaded] = useState<boolean>(false);
  // 기본은 작성일 내림차순(역순) 활성. PC 헤더 클릭 시 오름→내림→원래순(null) 순환.
  const [sortKey, setSortKey] = useState<string | null>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [sortMenuOpen, setSortMenuOpen] = useState<boolean>(false); // 모바일 정렬 기준 드롭다운
  const {siteConfig} = useDocusaurusContext();

  // 게시판 노출 글들의 조회수를 한 번에 조회.
  // 로드 완료 전엔 빈 칸으로 두고(0→실제값 깜빡임 방지), 값이 오면 채운다.
  useEffect(() => {
    const ids = blogPosts.archive.blogPosts.map((p) => p.metadata.permalink).filter(Boolean);
    fetchViews(ids)
      .then(setViews)
      .finally(() => setViewsLoaded(true));
  }, []);

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
  // 컬럼 정렬 — 기본은 작성일 내림차순(최신순)
  const viewOf = (x: (typeof filtered)[number]) => views[x.post.metadata.permalink] ?? 0;
  const cmp = (a: (typeof filtered)[number], b: (typeof filtered)[number]) => {
    const A = a.post.metadata;
    const B = b.post.metadata;
    switch (sortKey) {
      case 'title':
        return A.title.localeCompare(B.title, 'ko');
      case 'author':
        return (A.authors?.[0]?.name || '').localeCompare(B.authors?.[0]?.name || '', 'ko');
      case 'tag':
        return (a.keys[0] || '').localeCompare(b.keys[0] || '');
      case 'views':
        return viewOf(a) - viewOf(b);
      default: // date · index
        return new Date(A.date).getTime() - new Date(B.date).getTime();
    }
  };
  const dir = sortDir === 'asc' ? 1 : -1;
  // 원래순(sortKey null)이면 재정렬 없이 기본 순서(작성일 최신순)를 그대로 사용
  const sorted =
    sortKey === null
      ? filtered
      : [...filtered].sort((a, b) => {
          const c = cmp(a, b);
          // 동점이면 항상 최신순으로 안정 정렬
          return c !== 0 ? dir * c : new Date(b.post.metadata.date).getTime() - new Date(a.post.metadata.date).getTime();
        });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE));
  const curPage = Math.min(page, totalPages);
  const startIdx = paginate ? (curPage - 1) * PAGE : 0;
  const shown = paginate ? sorted.slice(startIdx, startIdx + PAGE) : sorted.slice(0, PAGE);
  const moreUrl = filter === 'all' ? '/blog' : `/blog/tags/${filter}`;

  // 인기글(조회수 1위) — 현재 분류 기준, 검색 중이 아닐 때만. 조회수 0이면 숨김.
  const bestReduce = matched.reduce(
    (acc, x) => (viewOf(x) > acc.v ? {x, v: viewOf(x)} : acc),
    {x: null as (typeof matched)[number] | null, v: 0},
  );
  const best = highlightBest && viewsLoaded && !q && bestReduce.x && bestReduce.v > 0 ? bestReduce : null;

  // 헤더 클릭 → 오름차순 → 내림차순 → 원래순(null) 3단계 순환. 다른 컬럼이면 오름차순부터.
  const changeSort = (key: string) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir('asc');
    } else if (sortDir === 'asc') {
      setSortDir('desc');
    } else {
      setSortKey(null); // 내림차순 → 원래순
      setSortDir('asc');
    }
    setPage(1);
  };

  // 모바일 단일 정렬 컨트롤용 유효 상태 (원래순 null → 작성일 내림차순으로 표시)
  const effSortKey = sortKey ?? 'date';
  const effSortDir: 'asc' | 'desc' = sortKey === null ? 'desc' : sortDir;

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

      <div className={styles.mobileSort}>
        <div className={styles.msControl}>
        <div className={styles.msDropdown}>
          <button
            type="button"
            className={styles.msColBtn}
            onClick={() => setSortMenuOpen((o) => !o)}
            aria-haspopup="listbox"
            aria-expanded={sortMenuOpen}>
            {COLS.find((c) => c.key === effSortKey)?.label}
          </button>
          {sortMenuOpen && (
            <>
              <div className={styles.msBackdrop} onClick={() => setSortMenuOpen(false)} />
              <ul className={styles.msMenu} role="listbox">
                {COLS.filter((c) => c.sortable).map((c) => (
                  <li key={c.key}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={effSortKey === c.key}
                      className={`${styles.msOption} ${effSortKey === c.key ? styles.msOptionOn : ''}`}
                      onClick={() => {
                        setSortKey(c.key);
                        setSortDir(effSortDir);
                        setSortMenuOpen(false);
                        setPage(1);
                      }}>
                      {c.label}
                      {effSortKey === c.key && <span className={styles.msCheck}>✓</span>}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
        <span className={styles.msDivider} aria-hidden="true" />
        <button
          type="button"
          className={styles.msDir}
          onClick={() => {
            setSortKey(effSortKey);
            setSortDir(effSortDir === 'asc' ? 'desc' : 'asc');
            setPage(1);
          }}
          aria-label={effSortDir === 'asc' ? '오름차순 — 클릭 시 내림차순' : '내림차순 — 클릭 시 오름차순'}>
          {/* 같은 캐럿(⌃)을 회전만 시켜 위/아래 모양을 정확히 일치 */}
          <span
            style={{display: 'inline-block', transform: effSortDir === 'desc' ? 'rotate(180deg)' : undefined}}>
            ⌃
          </span>
        </button>
        </div>
      </div>

      <div className={styles.listHead}>
        {COLS.map((c) =>
          c.sortable ? (
            <button
              key={c.key}
              type="button"
              className={`${styles[c.cls]} ${styles.sortBtn} ${sortKey === c.key ? styles.sortBtnOn : ''}`}
              onClick={() => changeSort(c.key)}
              aria-label={`${c.label}(으)로 정렬`}>
              {c.label}
              <span className={styles.sortStack} aria-hidden="true">
                <span
                  className={`${styles.sortUp} ${
                    sortKey === c.key ? (sortDir === 'asc' ? styles.sortOn : styles.sortHide) : ''
                  }`}>
                  ⌃
                </span>
                <span
                  className={`${styles.sortDown} ${
                    sortKey === c.key ? (sortDir === 'desc' ? styles.sortOn : styles.sortHide) : ''
                  }`}>
                  ⌃
                </span>
              </span>
            </button>
          ) : (
            <span key={c.key} className={styles[c.cls]}>{c.label}</span>
          ),
        )}
      </div>

      <ul className={styles.list}>
        {best && renderRow(best.x, <BestCrown />, true, 'best')}
        {shown.map((item, idx) => renderRow(item, startIdx + idx + 1, false, idx))}
        {shown.length === 0 && (
          <li className={styles.empty}>
            {q ? `'${query.trim()}' 검색 결과가 없어요.` : '해당 분류의 글이 없어요.'}
          </li>
        )}
      </ul>

      {renderFooter()}
    </div>
  );

  // 게시판 한 행 렌더 (일반 행 + 인기글 행 공용). isBest면 테두리·배경 강조 + 제목앞 'BEST' 뱃지.
  function renderRow(
    {post, keys}: (typeof shown)[number],
    numLabel: React.ReactNode,
    isBest: boolean,
    keyId: React.Key,
  ) {
    const published = new Date(post.metadata.date);
    const isNew = Date.now() - published.getTime() <= TWO_WEEKS_MS;
    const date = published.toLocaleDateString('ko-KR', {year: '2-digit', month: '2-digit', day: '2-digit'});
    const primary = TAGS.find((t) => t.key === keys[0]);
    const chipKey = keys[0] || '';
    const chipLabel = primary?.label ?? lockTag?.label ?? '소식';
    const author = post.metadata.authors?.[0];
    const viewCell = viewsLoaded ? (views[post.metadata.permalink] ?? 0).toLocaleString('ko-KR') : '';
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
      <li key={keyId} className={isBest ? styles.bestLi : undefined}>
        <div className={`${styles.row} ${isBest ? styles.rowBest : ''}`}>
          <Link to={post.metadata.permalink} className={styles.rowMain}>
            <span className={styles.rowIndex}>{numLabel}</span>
            <span className={`${styles.tagChip} ${styles['t_' + chipKey] || ''}`}>{highlight(chipLabel, q)}</span>
            <span className={styles.rowTitle}>
              <span className={styles.rowText}>
                {isNew && <span className={styles.newTag}>NEW</span>}
                {highlight(post.metadata.title, q)}
              </span>
            </span>
            <span className={styles.rowDate}>{date}</span>
            <span className={styles.rowAuthorMeta}>{author?.name}</span>
            <span className={styles.rowViewsMeta}>{viewCell}</span>
          </Link>
          {author && (
            author.url ? (
              <Link to={toProfileLink(author.url)} className={styles.rowAuthor}>{authorInner}</Link>
            ) : (
              <span className={styles.rowAuthor}>{authorInner}</span>
            )
          )}
          <span className={styles.rowViews}>{viewCell}</span>
        </div>
      </li>
    );
  }

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
