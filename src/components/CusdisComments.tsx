import React, {useEffect, useState} from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import {useLocation} from '@docusaurus/router';
import {CUSDIS_HOST, CUSDIS_APP_ID} from '@site/src/cusdis';

const SCRIPT_ID = 'cusdis-embed-script';
const STYLE_ID = 'cusdis-brand-style';

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
  comment_has_been_sent: '댓글이 등록되었습니다.',
};

// 위 comment_has_been_sent 안에 포함된, 제출 완료 감지용 문구
const SENT_MARKER = '등록되었습니다';

// iframe 내부(동일 출처 srcdoc)에 주입할 브랜드 스타일
const BRAND_CSS = `
  /* display: flow-root 로 BFC 를 만들어 자식의 상/하 여백이 body 밖으로 새는 것을 막는다.
     (그래야 body.scrollHeight 로 측정한 높이가 실제 콘텐츠와 정확히 일치해 내부 스크롤이 안 생김) */
  html, body { overflow: hidden !important; }
  body { font-family: 'NanumSquareRound', Arial, '나눔고딕', 'NanumGothic', sans-serif; color: #333; margin: 0; display: flow-root; }

  /* 입력창 */
  input, textarea {
    border: 1px solid #e5e2dc !important; border-radius: 10px !important;
    padding: 0.6rem 0.75rem !important; font-size: 0.9rem !important;
    background: #fff !important; color: #333 !important;
    transition: border-color .15s, box-shadow .15s;
  }
  input:focus, textarea:focus {
    outline: none !important; border-color: #f2921d !important;
    box-shadow: 0 0 0 3px rgba(242,146,29,.15) !important;
  }
  label { font-size: .8rem !important; color: #8a7f70 !important; font-weight: 700 !important; margin-bottom: .4rem !important; }

  /* 모바일: 닉네임/이메일을 한 줄(세로)로 */
  @media (max-width: 480px) { .grid-cols-2 { grid-template-columns: 1fr !important; } }

  /* 버튼 기본(대댓글 토글 등) — 은은한 텍스트 버튼 */
  button {
    background: transparent !important; border: 0 !important; color: #b46508 !important;
    font-weight: 700 !important; font-size: .8rem !important;
    padding: .25rem .5rem !important; border-radius: 8px !important;
    cursor: pointer; transition: background .15s, color .15s;
  }
  button:hover { background: rgba(242,146,29,.1) !important; }

  /* 주요 제출 버튼(등록/대댓글 등록) — 주황 라운드 */
  button.bg-gray-200 {
    background: #f2921d !important; color: #fff !important;
    padding: .55rem 1.5rem !important; border-radius: 999px !important; font-size: .88rem !important;
  }
  button.bg-gray-200:hover { background: #e7820a !important; }

  /* 댓글 카드 */
  .mt-4 > .my-4 {
    position: relative !important;
    background: #fbf7f0 !important; border: 1px solid #f1e9dc !important;
    border-radius: 12px !important; padding: .85rem 1rem !important; margin: .6rem 0 !important;
  }
  /* 작성자 이름 (날짜 공간 확보) */
  .my-4 > .flex.items-center { padding-right: 7.5rem !important; }
  .flex.items-center .font-medium { color: #b46508 !important; font-weight: 800 !important; font-size: .92rem !important; }
  /* 날짜 — 작성자와 같은 행, 오른쪽 끝 정렬 */
  .my-4 > .text-sm {
    position: absolute !important; top: .9rem !important; right: 1rem !important;
    margin: 0 !important; color: #a99e8d !important; font-size: .84rem !important;
  }
  /* 본문 — 게시글 본문(.blog-post-page .markdown)과 동일한 크기/행간 */
  .my-4 > .my-2 { color: #4a4a4a !important; font-size: 0.9rem !important; line-height: 1.72 !important; margin: .5rem 0 !important; }
  .my-4 > .my-2 p { margin: 0 !important; font-size: 0.9rem !important; line-height: 1.72 !important; }

  /* 구분 여백 축소 */
  .my-8 { margin: 1.2rem 0 !important; }

  /* 링크 */
  a { color: #f2921d !important; }
  /* "Cusdis 제공" 푸터 숨김 */
  .text-center.text-xs { display: none !important; }

  /* 로딩 스피너 (위젯 내부 "로딩중..." 텍스트 대체) */
  @keyframes cusdis-spin { to { transform: rotate(360deg); } }
  .cusdis-spin {
    display: inline-block; width: 26px; height: 26px; border-radius: 50%;
    border: 3px solid #f1e3cf; border-top-color: #f2921d;
    animation: cusdis-spin .8s linear infinite;
  }
`;

function CusdisThread() {
  const location = useLocation();
  const pageId = location.pathname;
  // 댓글 제출 후 위젯을 깨끗이 재마운트해 새 댓글이 바로 보이게 하는 키
  const [reloadKey, setReloadKey] = useState(0);

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

    // --- 높이 자동조정 + 브랜드 스타일 주입 ---
    // Cusdis 위젯은 부모로 resize 메시지를 보낼 때 targetOrigin 을 누락해
    // 최신 브라우저에서 자동 리사이즈가 동작하지 않는다(업스트림 버그).
    // srcdoc iframe 은 동일 출처이므로 내부 문서 높이를 직접 읽어 맞추고,
    // 내부에 브랜드 CSS 도 함께 주입한다.
    let ro: ResizeObserver | undefined;
    let mo: MutationObserver | undefined;
    let iv: ReturnType<typeof setInterval> | undefined;
    let poll: ReturnType<typeof setInterval> | undefined;
    let giveUp: ReturnType<typeof setTimeout> | undefined;
    let submitTimer: ReturnType<typeof setTimeout> | undefined;
    let submitHandled = false;
    let boundIframe: HTMLIFrameElement | undefined;

    // 댓글 제출 완료를 감지하면, 자동승인(웹훅) 반영 시간을 준 뒤 위젯을 재마운트한다.
    // (라이브 위젯의 srcdoc 을 직접 리로드하지 않고 React 로 통째 재마운트 → 블랭크 방지)
    const maybeReloadAfterSubmit = () => {
      try {
        const txt = boundIframe?.contentDocument?.body?.innerText || '';
        if (!submitHandled && txt.includes(SENT_MARKER)) {
          submitHandled = true;
          submitTimer = setTimeout(() => setReloadKey((k) => k + 1), 2500);
        }
      } catch (_) {}
    };

    const syncHeight = (iframe: HTMLIFrameElement) => {
      try {
        const doc = iframe.contentDocument;
        const body = doc?.body;
        if (!body) return;
        // body 기준으로 측정해야 내용이 줄어들 때(대댓글 접기 등) 높이도 함께 줄어든다.
        // documentElement.scrollHeight 는 iframe 뷰포트 높이로 고정돼 축소가 반영되지 않음.
        const h = Math.max(body.scrollHeight, body.offsetHeight);
        const cur = parseInt(iframe.style.height, 10) || 0;
        // 실제로 값이 바뀔 때만 갱신 (ResizeObserver 루프 방지)
        if (h && Math.abs(h - cur) > 1) iframe.style.height = h + 'px';
      } catch (_) {}
    };

    // 위젯 내부의 "로딩중..." 텍스트 div 를 스피너로 교체 (클래스가 없어 구조로 탐지)
    const replaceLoading = (iframe: HTMLIFrameElement) => {
      try {
        const doc = iframe.contentDocument;
        const root = doc?.getElementById('root');
        if (!root) return;
        root.querySelectorAll('div').forEach((el) => {
          if (
            el.childElementCount === 0 &&
            /^로딩중/.test((el.textContent || '').trim()) &&
            !(el as HTMLElement).dataset.spun
          ) {
            (el as HTMLElement).dataset.spun = '1';
            el.innerHTML = '<span class="cusdis-spin" role="status" aria-label="로딩중"></span>';
            (el as HTMLElement).style.display = 'flex';
            (el as HTMLElement).style.justifyContent = 'center';
            (el as HTMLElement).style.padding = '1.5rem 0';
          }
        });
      } catch (_) {}
    };

    // 위젯 내부(동일 출처)에서 최상위 댓글 개수를 읽어 헤딩에 표시
    const updateHeading = (iframe: HTMLIFrameElement) => {
      try {
        const doc = iframe.contentDocument;
        const n = doc ? doc.querySelectorAll('.mt-4 > .my-4').length : 0;
        const heading = document.getElementById('cusdis-heading');
        if (heading) heading.textContent = n > 0 ? `댓글 ${n}` : '댓글';
      } catch (_) {}
    };

    const injectStyle = (iframe: HTMLIFrameElement) => {
      try {
        const doc = iframe.contentDocument;
        if (doc && doc.head && !doc.getElementById(STYLE_ID)) {
          const st = doc.createElement('style');
          st.id = STYLE_ID;
          st.textContent = BRAND_CSS;
          doc.head.appendChild(st);
        }
      } catch (_) {}
    };

    // 전송 중(제출 버튼이 "전송중..." 상태)일 때 제출 버튼 재클릭을 막아 중복 등록 방지.
    // 캡처 단계에서 위젯의 클릭 핸들러보다 먼저 가로채 차단한다.
    const guardSubmit = (iframe: HTMLIFrameElement) => {
      try {
        const doc = iframe.contentDocument as (Document & {__submitGuarded?: boolean}) | null;
        if (!doc || doc.__submitGuarded) return;
        doc.__submitGuarded = true;
        doc.addEventListener(
          'click',
          (e) => {
            const btn = (e.target as HTMLElement)?.closest?.('button');
            // 주요 제출 버튼(등록/전송중)만 대상 — Tailwind bg-gray-200 보유
            if (!btn || !btn.classList.contains('bg-gray-200')) return;
            if ((btn.textContent || '').includes('전송중')) {
              e.preventDefault();
              e.stopImmediatePropagation();
            }
          },
          true,
        );
      } catch (_) {}
    };

    const onReady = () => {
      if (!boundIframe) return;
      injectStyle(boundIframe);
      guardSubmit(boundIframe);
      replaceLoading(boundIframe);
      syncHeight(boundIframe);
      updateHeading(boundIframe);
      try {
        const doc = boundIframe.contentDocument;
        if (doc && doc.body) {
          ro?.disconnect();
          mo?.disconnect();
          // body 를 관찰해야 내용 축소 시에도 ResizeObserver 가 발화한다
          // (iframe 높이가 고정되면 documentElement 크기는 변하지 않음).
          ro = new ResizeObserver(() => {
            // 다음 프레임으로 미뤄 "ResizeObserver loop" 경고 방지
            window.requestAnimationFrame(() => boundIframe && syncHeight(boundIframe));
          });
          ro.observe(doc.body);
          mo = new MutationObserver(() => {
            if (!boundIframe) return;
            injectStyle(boundIframe);
            replaceLoading(boundIframe);
            maybeReloadAfterSubmit();
            syncHeight(boundIframe);
            updateHeading(boundIframe);
          });
          mo.observe(doc.body, {subtree: true, childList: true, attributes: true, characterData: true});
        }
      } catch (_) {}
    };

    const attach = () => {
      const thread = document.getElementById('cusdis_thread');
      const iframe = thread?.querySelector('iframe') as HTMLIFrameElement | null;
      if (!iframe) return false;
      boundIframe = iframe;
      iframe.addEventListener('load', onReady);
      onReady(); // srcdoc 이 이미 로드됐을 수 있음
      // 안전망: 초기 몇 초간 주기적으로 동기화
      let n = 0;
      iv = setInterval(() => {
        if (boundIframe) {
          syncHeight(boundIframe);
          updateHeading(boundIframe);
        }
        if (++n > 20) iv && clearInterval(iv);
      }, 300);
      return true;
    };

    poll = setInterval(() => {
      if (attach()) poll && clearInterval(poll);
    }, 200);
    giveUp = setTimeout(() => poll && clearInterval(poll), 10000);

    return () => {
      poll && clearInterval(poll);
      giveUp && clearTimeout(giveUp);
      iv && clearInterval(iv);
      submitTimer && clearTimeout(submitTimer);
      ro?.disconnect();
      mo?.disconnect();
      boundIframe?.removeEventListener('load', onReady);
    };
  }, [pageId, reloadKey]);

  return (
    <div style={{marginTop: '2.5rem'}}>
      <h3
        id="cusdis-heading"
        style={{
          fontSize: '1.1rem',
          fontWeight: 800,
          color: '#3a3a3a',
          margin: '0 0 1rem',
          paddingBottom: '0.6rem',
          borderBottom: '2px solid #f1e9dc',
        }}>
        댓글
      </h3>
      <div
        key={reloadKey}
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
    <BrowserOnly fallback={<div className="cusdis-loading" role="status" aria-label="댓글 불러오는 중" />}>
      {() => <CusdisThread />}
    </BrowserOnly>
  );
}
