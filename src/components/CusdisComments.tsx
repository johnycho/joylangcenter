import React, {useEffect} from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import {useLocation} from '@docusaurus/router';
import {CUSDIS_HOST, CUSDIS_APP_ID} from '@site/src/cusdis';

const SCRIPT_ID = 'cusdis-embed-script';

// 위젯 UI 한국어화 (SDK 로드 전에 window.CUSDIS_LOCALE 설정)
const KO_LOCALE = {
  powered_by: 'Cusdis 제공',
  post_comment: '등록',
  loading: '로딩중...',
  email: '이메일 (선택)',
  nickname: '닉네임',
  reply_placeholder: '댓글...',
  reply_btn: '댓글',
  sending: '전송중...',
  mod_badge: 'MOD',
  content_is_required: '내용이 필요합니다',
  nickname_is_required: '닉네임이 필요합니다',
  comment_has_been_sent: '댓글이 전송되었습니다. 승인을 기다려 주세요.',
};

function CusdisThread() {
  const location = useLocation();
  const pageId = location.pathname;

  useEffect(() => {
    const w = window as any;
    if (!document.getElementById(SCRIPT_ID)) {
      // 최초 1회: 한국어 로케일 지정 후 Cusdis 임베드 스크립트 주입
      w.CUSDIS_LOCALE = KO_LOCALE;
      const s = document.createElement('script');
      s.id = SCRIPT_ID;
      s.async = true;
      s.defer = true;
      s.src = `${CUSDIS_HOST}/js/cusdis.es.js`;
      document.body.appendChild(s);
    } else if (w.CUSDIS) {
      // SPA 페이지 이동 시 현재 글 기준으로 다시 렌더
      w.CUSDIS.initial();
    }
  }, [pageId]);

  return (
    <div style={{marginTop: '2.5rem'}}>
      <div
        id="cusdis_thread"
        data-host={CUSDIS_HOST}
        data-app-id={CUSDIS_APP_ID}
        data-page-id={pageId}
        data-page-url={typeof window !== 'undefined' ? window.location.href : ''}
        data-page-title={typeof document !== 'undefined' ? document.title : ''}
      />
    </div>
  );
}

export default function CusdisComments() {
  // App ID 미설정 시 위젯을 렌더링하지 않음
  if (!CUSDIS_APP_ID) {
    return null;
  }
  return (
    <BrowserOnly fallback={<div>댓글을 불러오는 중…</div>}>
      {() => <CusdisThread />}
    </BrowserOnly>
  );
}
