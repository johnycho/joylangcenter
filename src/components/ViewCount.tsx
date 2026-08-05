import React, {useEffect, useState} from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import {useLocation} from '@docusaurus/router';
import {VIEW_COUNT_API, recordView} from '@site/src/viewCount';

// 눈 아이콘 + 조회수 (게시글 상세 헤더 아래에 표시)
function ViewCountInner() {
  const {pathname} = useLocation();
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    // 값이 확정될 때 한 번만 세팅(실패면 0). 로딩 중엔 null 유지 → 0이 잠깐 보였다 바뀌는 깜빡임 방지.
    recordView(pathname).then((n) => {
      if (alive) setCount(n ?? 0);
    });
    return () => {
      alive = false;
    };
  }, [pathname]);

  // 로딩 중(값 미확정)에는 아무것도 렌더하지 않는다(0 → 실제값 깜빡임 방지). 확정되면 노출(실패 시 0).
  if (count === null) return null;

  return (
    <span className="blog-view-count" aria-label={`조회수 ${count}회`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
      <span>조회수 {count.toLocaleString('ko-KR')}</span>
    </span>
  );
}

export default function ViewCount() {
  if (!VIEW_COUNT_API) return null;
  return <BrowserOnly>{() => <ViewCountInner />}</BrowserOnly>;
}
