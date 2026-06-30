import type {ReactNode} from 'react';
import Layout from '@theme/Layout';
import Head from '@docusaurus/Head';
import Link from '@docusaurus/Link';
import styles from './index.module.css';
import BlogCards from '@site/src/components/BlogCards';
import BannerSlider from '@site/src/components/BannerSlider';
import NaverMap from '@site/src/components/NaverMap';

const KAKAO_URL = 'https://pf.kakao.com/_sxjPXn';
const NAVER_URL = 'https://blog.naver.com/joylangcenter';
const INSTA_URL = 'https://instagram.com/joylangcenter';
const MAP_URL = 'https://naver.me/5Vm9WYYy';
const ADDRESS = '강원특별자치도 원주시 지정면 무릉로 15 JD스퀘어 6층';

const QUICK = [
  {icon: '📍', label: '위치', value: '원주시 지정면 무릉로 15 JD스퀘어 6층', href: MAP_URL, external: true},
  {icon: '💬', label: '상담 문의', value: '카카오톡으로 편하게 문의하세요', href: KAKAO_URL, external: true},
  {icon: '🎯', label: '전문 영역', value: '조음·언어발달·유창성·자폐·지적', href: '#therapy', external: false},
];

const PILLARS = [
  {icon: '🧡', title: '따뜻한 마음', desc: '아이의 마음을 먼저 헤아리는 안전한 공간이에요.'},
  {icon: '👩‍🏫', title: '전문 치료진', desc: '자격을 갖춘 언어재활사가 함께합니다.'},
  {icon: '🎯', title: '1:1 맞춤 수업', desc: '아이의 속도에 맞춘 개별 치료 계획을 세워요.'},
  {icon: '🎈', title: '즐거운 배움', desc: '놀이처럼 즐거운 의사소통을 경험해요.'},
];

const AREAS = [
  {icon: '🗣️', title: '조음·음운 (발음)', desc: '정확한 발음과 또렷한 소리내기를 도와요.'},
  {icon: '📚', title: '언어발달지연', desc: '또래보다 느린 말·언어 발달을 지원해요.'},
  {icon: '🌀', title: '유창성 (말더듬)', desc: '편안하고 자연스러운 말하기를 연습해요.'},
  {icon: '🧩', title: '자폐스펙트럼장애', desc: '상호작용과 의사소통 능력을 함께 키워요.'},
  {icon: '💡', title: '지적장애', desc: '생활 속 기능적 의사소통을 도와요.'},
];

function HomepageHero() {
  return (
    <header className={styles.hero}>
      <BannerSlider />
      <div className={styles.heroOverlay}>
        <div className={styles.heroContent}>
          <p className={styles.heroEyebrow}>원주 조이언어발달센터</p>
          <h1 className={styles.heroTitle}>
            즐거운 의사소통이<br />있는 곳
            <span className={styles.srOnly}> — 원주 언어치료 · 언어발달센터 (조이언어발달센터)</span>
          </h1>
          <p className={styles.heroSubtitle}>
            아이 한 명 한 명의 속도에 맞춘 기능적이고 즐거운 언어치료를 만들어갑니다.
          </p>
          <div className={styles.heroActions}>
            <Link className={styles.heroBtnPrimary} to="/docs/intro">센터 소개</Link>
            <a className={styles.heroBtnGhost} href={KAKAO_URL} target="_blank" rel="noopener noreferrer">카카오 상담</a>
            <Link className={styles.heroBtnGhost} to="/docs/location">오시는 길</Link>
          </div>
        </div>
      </div>
    </header>
  );
}

function QuickInfo() {
  return (
    <section className={styles.quickStrip}>
      <div className={styles.container}>
        <div className={styles.quickInfo}>
          {QUICK.map((q) => (
            <a
              key={q.label}
              className={styles.quickCard}
              href={q.href}
              {...(q.external ? {target: '_blank', rel: 'noopener noreferrer'} : {})}
            >
              <span className={styles.quickIcon}>{q.icon}</span>
              <span className={styles.quickText}>
                <span className={styles.quickLabel}>{q.label}</span>
                <span className={styles.quickValue}>{q.value}</span>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function SectionHead({eyebrow, title, sub}: {eyebrow: string; title: string; sub?: string}) {
  return (
    <div className={styles.sectionHead}>
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h2 className={styles.sectionHeading}>{title}</h2>
      {sub && <p className={styles.sectionSub}>{sub}</p>}
    </div>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      description="[원주 조이언어발달센터, 원주 기업도시 조이언어발달센터, 원주 지정면 조이언어발달센터, 원주 언어치료, 원주 기업도시 언어치료, 원주 지정면 언어치료] 조이 언어발달센터는 자폐스펙트럼장애, 지적장애, 유창성(말더듬)장애, 단순 언어발달장애, 조음(발음) 장애 아동의 기능적이고 즐거운 언어치료 수업을 만들어가고자 합니다.">
      <Head>
        <title>원주 언어치료·언어발달센터 | 조이언어발달센터</title>
        <meta property="og:title" content="원주 언어치료·언어발달센터 | 조이언어발달센터" />
        <meta property="og:description" content="즐거운 의사소통이 있는 곳, 조이 언어발달센터입니다. 원주 언어치료·언어발달센터." />
        <meta property="og:image" content="/img/joy-thumbnail.png" />
        <meta property="og:url" content="https://joylangcenter.com/" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="조이 언어발달센터" />
        <meta property="og:locale" content="ko_KR" />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': ['LocalBusiness', 'MedicalBusiness'],
            name: '조이 언어발달센터',
            alternateName: ['원주 조이언어발달센터', '조이언어발달센터', '원주 언어치료센터'],
            description:
              '원주 언어치료, 언어발달, 언어재활 전문 센터. 자폐스펙트럼장애·지적장애·유창성(말더듬)·언어발달지연·조음(발음) 장애 아동의 기능적이고 즐거운 언어치료.',
            url: 'https://joylangcenter.com/',
            image: 'https://joylangcenter.com/img/joy-thumbnail.png',
            logo: 'https://joylangcenter.com/img/logo-joy.png',
            address: {
              '@type': 'PostalAddress',
              streetAddress: '지정면 무릉로 15 JD스퀘어 6층',
              addressLocality: '원주시',
              addressRegion: '강원특별자치도',
              addressCountry: 'KR',
            },
            areaServed: ['원주시', '원주 기업도시', '원주 지정면'],
            knowsAbout: [
              '언어치료', '언어재활', '언어발달', '조음치료', '유창성치료',
              '자폐스펙트럼장애', '지적장애', '아동발달',
            ],
            sameAs: [
              'https://blog.naver.com/joylangcenter',
              'https://instagram.com/joylangcenter',
              'https://pf.kakao.com/_sxjPXn',
            ],
          })}
        </script>
      </Head>

      <HomepageHero />

      <main>
        <QuickInfo />

        {/* 가치 / 강점 */}
        <section className={`${styles.section} ${styles.sectionTint}`}>
          <div className={styles.container}>
            <SectionHead eyebrow="WHY JOY" title="조이가 약속하는 것" sub="아이와 가족이 믿고 찾을 수 있도록, 이런 마음으로 함께합니다." />
            <div className={styles.pillarGrid}>
              {PILLARS.map((p) => (
                <div key={p.title} className={styles.pillar}>
                  <span className={styles.pillarIcon}>{p.icon}</span>
                  <h3 className={styles.pillarTitle}>{p.title}</h3>
                  <p className={styles.pillarDesc}>{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 전문 영역 */}
        <section id="therapy" className={styles.section}>
          <div className={styles.container}>
            <SectionHead eyebrow="THERAPY" title="이런 어려움을 함께 도와요" sub="전문 평가를 바탕으로 아이에게 꼭 맞는 치료를 제안합니다." />
            <div className={styles.areaGrid}>
              {AREAS.map((a) => (
                <div key={a.title} className={styles.areaCard}>
                  <span className={styles.areaIcon}>{a.icon}</span>
                  <div>
                    <h3 className={styles.areaTitle}>{a.title}</h3>
                    <p className={styles.areaDesc}>{a.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 소식 & 공지 (게시판형) */}
        <section className={`${styles.section} ${styles.sectionTint}`}>
          <div className={styles.container}>
            <SectionHead eyebrow="NEWS" title="소식 & 공지" sub="공지사항과 센터 소식을 한눈에 확인하세요." />
            <div className={styles.boardGrid}>
              <BlogCards tag="notice" title="공지사항" moreHref="/blog/tags/notice" max={6} />
              <BlogCards tag="news" title="센터 소식" moreHref="/blog/tags/news" max={6} />
            </div>
          </div>
        </section>

        {/* 오시는 길 */}
        <section className={styles.section}>
          <div className={styles.container}>
            <SectionHead eyebrow="LOCATION" title="오시는 길" />
            <div className={styles.locationCard}>
              <p className={styles.address}>📍 {ADDRESS}</p>
              <div className={styles.channelRow}>
                <a className={`${styles.channelBtn} ${styles.chKakao}`} href={KAKAO_URL} target="_blank" rel="noopener noreferrer">카카오톡 상담</a>
                <a className={`${styles.channelBtn} ${styles.chNaver}`} href={NAVER_URL} target="_blank" rel="noopener noreferrer">네이버 블로그</a>
                <a className={`${styles.channelBtn} ${styles.chInsta}`} href={INSTA_URL} target="_blank" rel="noopener noreferrer">인스타그램</a>
              </div>
            </div>
            <div className={styles.mapWrap}>
              <NaverMap />
            </div>
          </div>
        </section>

        {/* 상담 CTA */}
        <section className={styles.ctaBand}>
          <div className={styles.container}>
            <h2 className={styles.ctaTitle}>궁금한 점이 있으신가요?</h2>
            <p className={styles.ctaSub}>상담 시간·수업 안내 등 무엇이든 카카오톡으로 편하게 문의해 주세요.</p>
            <a className={styles.ctaBtn} href={KAKAO_URL} target="_blank" rel="noopener noreferrer">카카오톡으로 상담하기</a>
          </div>
        </section>
      </main>
    </Layout>
  );
}
