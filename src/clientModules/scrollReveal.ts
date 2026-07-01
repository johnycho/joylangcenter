import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';

/**
 * 전 페이지 공통 스크롤 진입 애니메이션.
 * 라우트가 바뀔 때마다 본문의 주요 블록에 `.joy-reveal`을 붙이고,
 * 화면에 들어오면 `.is-visible`을 추가한다(전역 CSS는 custom.css).
 *
 * - 블록 단위로 담백하게 페이드+업 (스태거 없음).
 * - 이미 컴포넌트가 리빌을 관리(.joy-reveal 보유)하거나 그런 요소를 자식으로 가진
 *   래퍼는 건너뛴다(이중 애니메이션 방지).
 * - 첫 화면(뷰포트 안)에 있는 요소는 깜빡임 없이 즉시 표시한다.
 * - prefers-reduced-motion / IntersectionObserver 미지원 시 아무것도 하지 않는다.
 */

const SELECTORS = ['main section', '.markdown > *', '[class*="board_"]'];

let observer: IntersectionObserver | null = null;

function getObserver() {
  if (observer) return observer;
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          observer!.unobserve(e.target);
        }
      });
    },
    {threshold: 0.1, rootMargin: '0px 0px -6% 0px'},
  );
  return observer;
}

function setup() {
  if (!ExecutionEnvironment.canUseDOM) return;
  if (
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ||
    !('IntersectionObserver' in window)
  ) {
    return;
  }

  const io = getObserver();
  const vh = window.innerHeight || document.documentElement.clientHeight;

  document.querySelectorAll<HTMLElement>(SELECTORS.join(',')).forEach((el) => {
    if (el.dataset.jr) return;
    // 이미 관리되는 요소, 또는 네이버 지도(#map)를 품은 요소는 제외.
    // (opacity:0 + transform 상태에서 지도가 초기화되면 타일이 흰 화면으로 남음)
    if (
      el.classList.contains('joy-reveal') ||
      el.querySelector('.joy-reveal') ||
      el.querySelector('#map')
    ) {
      el.dataset.jr = 'skip';
      return;
    }
    el.dataset.jr = '1';
    el.classList.add('joy-reveal');

    const r = el.getBoundingClientRect();
    const inView = r.top < vh * 0.92 && r.bottom > 0;
    if (inView) {
      el.classList.add('is-visible');
    } else {
      io.observe(el);
    }
  });
}

function schedule() {
  requestAnimationFrame(() => requestAnimationFrame(setup));
}

// 라우트 전환 후(초기 진입 포함) 실행
export function onRouteDidUpdate() {
  schedule();
}

if (ExecutionEnvironment.canUseDOM) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', schedule);
  } else {
    schedule();
  }
}
