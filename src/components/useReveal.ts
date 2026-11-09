import {useEffect, useRef, useState} from 'react';

/**
 * 요소가 뷰포트에 들어오면 한 번 나타나게 하는 스크롤 리빌 훅.
 * - `joy-reveal` 클래스와 함께 쓰고, 보이면 `is-visible`을 붙인다(전역 CSS, custom.css).
 * - IntersectionObserver 미지원/모션 최소화 설정이면 즉시 표시한다.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(rootMarginBottom = '-8%') {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;

    // 앵커(해시)로 바로 진입한 섹션은 등장 애니메이션 없이 즉시 표시 — 제목부터 보이게.
    if (el.id && typeof window !== 'undefined' && window.location.hash === `#${el.id}`) {
      setVisible(true);
      return;
    }

    if (
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    ) {
      setVisible(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            io.disconnect();
          }
        });
      },
      {threshold: 0.12, rootMargin: `0px 0px ${rootMarginBottom} 0px`},
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visible, rootMarginBottom]);

  return {ref, visible};
}
