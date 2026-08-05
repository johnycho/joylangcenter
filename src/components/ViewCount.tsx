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
    recordView(pathname).then((n) => {
      if (alive && typeof n === 'number') setCount(n);
    });
    return () => {
      alive = false;
    };
  }, [pathname]);

  // 값 확보 전/조회 실패 시엔 0으로 표시(게시판 목록과 동일하게 항상 노출)
  const shown = count ?? 0;

  return (
    <span className="blog-view-count" aria-label={`조회 ${shown}회`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
      <span>조회 {shown.toLocaleString('ko-KR')}</span>
    </span>
  );
}

export default function ViewCount() {
  if (!VIEW_COUNT_API) return null;
  return <BrowserOnly>{() => <ViewCountInner />}</BrowserOnly>;
}
