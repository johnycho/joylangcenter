import React from 'react';
import clsx from 'clsx';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {useReveal} from '../useReveal';
import styles from './styles.module.css';

/** 인사말 본문을 감싸 폭을 제한하고 가운데 정렬 */
export function Greeting({children}: {children: React.ReactNode}) {
  return <div className={styles.greeting}>{children}</div>;
}

/** 큰 인용/철학 헤드라인 (스크롤 리빌) */
export function Lead({children}: {children: React.ReactNode}) {
  const {ref, visible} = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={clsx(styles.lead, 'joy-reveal', visible && 'is-visible')}>
      <span className={styles.quoteMark} aria-hidden="true">
        “
      </span>
      <p className={styles.leadText}>{children}</p>
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

/** 핵심 가치 강조 박스 (스크롤 리빌) */
export function ValueCallout({
  label,
  children,
}: {
  label?: string;
  children: React.ReactNode;
}) {
  const {ref, visible} = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={clsx(styles.value, 'joy-reveal', visible && 'is-visible')}>
      {label && <span className={styles.valueLabel}>{label}</span>}
      <p className={styles.valueText}>{children}</p>
    </div>
  );
}

/** 가치 카드 묶음 (아이콘 + 제목 + 설명) */
export function ValueCards({children}: {children: React.ReactNode}) {
  const {ref, visible} = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={clsx(styles.cards, 'joy-reveal', visible && 'is-visible')}>
      {children}
    </div>
  );
}
export function ValueCard({
  icon,
  title,
  children,
}: {
  icon?: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.vcard}>
      <span className={styles.vcardIcon} aria-hidden="true">
        {icon}
      </span>
      <h3 className={styles.vcardTitle}>{title}</h3>
      <p className={styles.vcardDesc}>{children}</p>
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
