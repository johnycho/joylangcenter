import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {useReveal} from '../useReveal';
import styles from './styles.module.css';

type Social = {label: string; href: string; icon?: string};

/** 상단 프로필 히어로 (사진 + 분야 + 이름 + 자격 뱃지 + 한 줄 소개) */
export function ProfileHero({
  photo,
  name,
  field,
  badges = [],
  tagline,
  socials = [],
}: {
  photo: string;
  name: string;
  field?: string;
  badges?: string[];
  tagline?: string;
  socials?: Social[];
}) {
  const img = useBaseUrl(photo);
  const {ref, visible} = useReveal<HTMLElement>();
  return (
    <header ref={ref} className={clsx(styles.hero, 'joy-reveal', visible && 'is-visible')}>
      <div className={styles.heroPhotoWrap}>
        <img className={styles.heroPhoto} src={img} alt={name} loading="lazy" />
      </div>
      <div className={styles.heroBody}>
        {field && <span className={styles.heroField}>{field}</span>}
        <h1 className={styles.heroName}>{name}</h1>
        {badges.length > 0 && (
          <div className={styles.badges}>
            {badges.map((b, i) => (
              <span key={i} className={styles.badge}>
                {b}
              </span>
            ))}
          </div>
        )}
        {tagline && <p className={styles.tagline}>{tagline}</p>}
        {socials.length > 0 && (
          <div className={styles.socials}>
            {socials.map((s, i) => (
              <Link key={i} className={styles.social} to={s.href}>
                {s.icon ? `${s.icon} ` : ''}
                {s.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}

/** 페이지 상단 가운데 정렬 헤더 (eyebrow + 제목 + 부제). banner=true면 그라데이션 배너 */
export function PageHeader({
  eyebrow,
  title,
  subtitle,
  banner,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: React.ReactNode;
  banner?: boolean;
}) {
  const {ref, visible} = useReveal<HTMLElement>();
  return (
    <header
      ref={ref}
      className={clsx(
        styles.pageHeader,
        banner && styles.pageHeaderBanner,
        'joy-reveal',
        visible && 'is-visible',
      )}>
      {eyebrow && <p className={styles.pageEyebrow}>{eyebrow}</p>}
      <h1 className={styles.pageTitle}>{title}</h1>
      {subtitle && <p className={styles.pageSubtitle}>{subtitle}</p>}
    </header>
  );
}

/** 아이콘 칩 + 제목이 붙은 섹션 카드 (스크롤 리빌) */
export function Section({
  icon,
  title,
  children,
  id,
}: {
  icon?: React.ReactNode;
  title: string;
  children: React.ReactNode;
  id?: string;
}) {
  const {ref, visible} = useReveal<HTMLElement>();
  return (
    <section
      ref={ref}
      id={id}
      style={id ? {scrollMarginTop: '80px'} : undefined}
      className={clsx(styles.section, 'joy-reveal', visible && 'is-visible')}>
      <div className={styles.sectionHead}>
        {icon && (
          <span className={styles.sectionIcon} aria-hidden="true">
            {icon}
          </span>
        )}
        <h2 className={styles.sectionTitle}>{title}</h2>
      </div>
      <div className={styles.sectionBody}>{children}</div>
    </section>
  );
}

/** 약력/학력 등 리스트 컨테이너 */
export function CredList({children}: {children: React.ReactNode}) {
  return <div className={styles.credList}>{children}</div>;
}

const PALETTE = ['#f2921d', '#e07b53', '#5b8f6a', '#4f86c6', '#9b6bcc', '#d1608a', '#c9902a'];
function toneColor(seed: string) {
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

/** 약력/학력 한 줄: 로고(또는 모노그램/아이콘) + 기관명 + 상세 + 상태 뱃지 */
export function Cred({
  logo,
  icon,
  mono,
  org,
  detail,
  status,
}: {
  logo?: string;
  icon?: string;
  mono?: string;
  org: string;
  detail?: string;
  status?: string;
}) {
  const logoUrl = useBaseUrl(logo || '');
  const tone = !status
    ? ''
    : status.startsWith('現') || status.startsWith('현')
    ? styles.stCurrent
    : status.startsWith('前') || status.startsWith('전')
    ? styles.stPast
    : styles.stCred;
  return (
    <div className={styles.cred}>
      <div className={styles.credMark}>
        {logo ? (
          <img className={styles.credLogo} src={logoUrl} alt="" loading="lazy" />
        ) : mono ? (
          <span className={styles.credMono} style={{background: toneColor(mono)}}>
            {mono}
          </span>
        ) : (
          <span className={styles.credIcon}>{icon || '•'}</span>
        )}
      </div>
      <div className={styles.credText}>
        <span className={styles.credOrg}>{org}</span>
        {detail && <span className={styles.credDetail}>{detail}</span>}
      </div>
      {status && <span className={`${styles.status} ${tone}`}>{status}</span>}
    </div>
  );
}

/* ===== 선생님 목록(분야별) ===== */

/** 한 분야(직무)의 선생님 카드 묶음. `field`가 있으면 분야 제목이 붙는다. */
export function TeacherGrid({
  field,
  children,
}: {
  field?: string;
  children: React.ReactNode;
}) {
  const {ref, visible} = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={clsx(styles.fieldGroup, 'joy-reveal', visible && 'is-visible')}>
      {field && (
        <div className={styles.fieldHead}>
          <span className={styles.fieldLine} aria-hidden="true" />
          <span className={styles.fieldName}>{field}</span>
          <span className={styles.fieldLine} aria-hidden="true" />
        </div>
      )}
      <div className={styles.grid}>{children}</div>
    </div>
  );
}

/** 준비 중(모집 예정) 자리표시 카드 */
export function ComingSoonCard({
  icon = '🎨',
  title = '준비 중',
  note = '선생님을 모시고 있어요',
}: {
  icon?: React.ReactNode;
  title?: string;
  note?: string;
}) {
  return (
    <div className={styles.cardSoon}>
      <div className={styles.cardSoonIcon} aria-hidden="true">
        {icon}
      </div>
      <div className={styles.cardName}>{title}</div>
      <div className={styles.cardRole}>{note}</div>
      <span className={styles.soonBadge}>COMING SOON</span>
    </div>
  );
}

/** 선생님 카드 (사진 + 이름 + 직무 + 자격 뱃지 → 상세 페이지 링크) */
export function TeacherCard({
  photo,
  name,
  role,
  badges = [],
  to,
}: {
  photo: string;
  name: string;
  role?: string;
  badges?: string[];
  to: string;
}) {
  const img = useBaseUrl(photo);
  return (
    <Link to={to} className={styles.card}>
      <div className={styles.cardPhotoWrap}>
        <img className={styles.cardPhoto} src={img} alt={name} loading="lazy" />
      </div>
      <div className={styles.cardName}>{name}</div>
      {role && <div className={styles.cardRole}>{role}</div>}
      {badges.length > 0 && (
        <div className={styles.cardBadges}>
          {badges.map((b, i) => (
            <span key={i} className={styles.cardBadge}>
              {b}
            </span>
          ))}
        </div>
      )}
      <span className={styles.cardMore}>소개 보기 →</span>
    </Link>
  );
}
