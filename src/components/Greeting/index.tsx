import React from 'react';
import clsx from 'clsx';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {useReveal} from '../useReveal';
import styles from './styles.module.css';

/** 인사말 본문을 감싸 폭을 제한하고 가운데 정렬 */
export function Greeting({children}: {children: React.ReactNode}) {
  return <div className={styles.greeting}>{children}</div>;
}

/** 본문 안에 자연스럽게 흐르는 대표 인물 사진(우측 플로트) */
export function GreetingPhoto({
  src,
  alt,
  name,
  role,
}: {
  src: string;
  alt?: string;
  name?: string;
  role?: string;
}) {
  const img = useBaseUrl(src);
  const {ref, visible} = useReveal<HTMLElement>();
  return (
    <figure
      ref={ref}
      className={clsx(styles.floatPhoto, 'joy-reveal', visible && 'is-visible')}>
      <img src={img} alt={alt || `${name || ''} 센터장`} loading="lazy" />
      {(name || role) && (
        <figcaption className={styles.floatCaption}>
          {name && <strong>{name}</strong>}
          {role && <span> · {role}</span>}
        </figcaption>
      )}
    </figure>
  );
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
