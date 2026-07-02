import React from 'react';
import clsx from 'clsx';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {useReveal} from '../useReveal';
import styles from './styles.module.css';

/** 인사말 본문을 감싸 폭을 제한하고 가운데 정렬 */
export function Greeting({children}: {children: React.ReactNode}) {
  return <div className={styles.greeting}>{children}</div>;
}

/** 상단 철학 헤드라인 (박스 없이 담백하게, 아래 짧은 액센트 라인) */
export function Lead({children}: {children: React.ReactNode}) {
  const {ref, visible} = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={clsx(styles.lead, 'joy-reveal', visible && 'is-visible')}>
      <p className={styles.leadText}>{children}</p>
      <span className={styles.leadRule} aria-hidden="true" />
    </div>
  );
}

/** 본문 문단 블록 (스크롤 리빌) */
export function Para({children}: {children: React.ReactNode}) {
  const {ref, visible} = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={clsx(styles.prose, 'joy-reveal', visible && 'is-visible')}>
      {children}
    </div>
  );
}

/** 핵심 가치 — 얇은 구분선 사이의 우아한 풀쿼트 (라벨 + 문구) */
export function Quote({
  label,
  children,
}: {
  label?: string;
  children: React.ReactNode;
}) {
  const {ref, visible} = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={clsx(styles.quote, 'joy-reveal', visible && 'is-visible')}>
      {label && <span className={styles.quoteLabel}>{label}</span>}
      <p className={styles.quoteText}>{children}</p>
    </div>
  );
}

/** 마무리 서명 (직함 + 손글씨 사인 이미지 + 태그라인) */
export function Signature({
  role,
  name,
  image,
  tagline,
}: {
  role: string;
  name: string;
  image: string;
  tagline?: string;
}) {
  const img = useBaseUrl(image);
  const {ref, visible} = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={clsx(styles.signature, 'joy-reveal', visible && 'is-visible')}>
      {tagline && <p className={styles.signTagline}>{tagline}</p>}
      <p className={styles.signRole}>{role}</p>
      <img className={styles.signImg} src={img} alt={`${name} 서명`} loading="lazy" />
    </div>
  );
}
