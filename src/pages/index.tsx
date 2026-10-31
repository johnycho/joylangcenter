import type {ReactNode} from 'react';
import Layout from '@theme/Layout';
import Head from '@docusaurus/Head';
import Link from '@docusaurus/Link';
import styles from './index.module.css';
import '@site/src/css/home-concept.css';
import BannerSlider from '@site/src/components/BannerSlider';
import NaverMap from '@site/src/components/NaverMap';
import {PhotoSlider, AssessSlider, CrewSlider, SpaceSection, ColumnPreview, FaqSlider} from '@site/src/components/HomeSliders';
import blogArchive from '@generated/docusaurus-plugin-content-blog/default/p/blog-archive-f05.json';

const KAKAO_URL = 'https://pf.kakao.com/_sxjPXn';
const NAVER_URL = 'https://blog.naver.com/joylangcenter';
const INSTA_URL = 'https://instagram.com/joylangcenter';
const PHONE = '033-745-1030';
const ADDRESS = '강원특별자치도 원주시 지정면 무릉로 15 JD스퀘어 6층';

const C = '/img/home/concept';

// 치료 분야 (캐릭터 카드)
const FIELDS = [
  {img: `${C}/f_artic.png`, title: '조음·음운 (발음)', desc: '어떤 소리에서 오류가 나는지 살피고, 정확한 발음을 연습해요.', to: '/docs/therapy-areas#articulation'},
  {img: `${C}/f_language.png`, title: '언어발달 지연', desc: '표현·수용 언어 수준을 평가해 발달 단계에 맞춰 도와요.', to: '/docs/therapy-areas#language-delay'},
  {img: `${C}/f_fluency.png`, title: '유창성 (말더듬)', desc: '말더듬 정도를 평가하고 편안한 말하기를 함께 만들어요.', to: '/docs/therapy-areas#fluency'},
  {img: `${C}/f_autism.png`, title: '자폐 스펙트럼', desc: '눈맞춤·주고받기부터 상호작용과 의사소통의 기초를 키워요.', to: '/docs/therapy-areas#autism'},
  {img: `${C}/f_reading.png`, title: '읽기·쓰기 (난독)', desc: '음운인식부터 읽기·쓰기 기초까지 아이 속도로 다져요.', to: '/docs/therapy-areas'},
  {img: `${C}/f_social.png`, title: '사회성', desc: '상황에 맞는 대화와 또래 상호작용을 자연스럽게 연습해요.', to: '/docs/therapy-areas#social'},
];

// 믿고 맡길 수 있는 이유 (통계 + 자격)
const STATS = [
  {n: '1급', k: '국가자격 언어재활사'},
  {n: '석사', k: '언어병리학 전공'},
  {n: '근거기반', k: '연구·논문 바탕의 치료'},
  {n: '1:1', k: '아이별 개별 맞춤'},
];
const CREDS = [
  {img: `${C}/t_education.png`, b: 'PECS·Floortime 전문 교육 이수', span: '보완대체의사소통·상호작용 중심 접근'},
  {img: `${C}/t_coop.png`, b: '교육청 특수교육지원센터·WEE 협력', span: '원주·평창 순회 언어치료 경험'},
  {img: `${C}/t_license.png`, b: '한국언어재활사협회 정회원', span: '지속적인 전문성 관리'},
];

// 현장과 학계가 함께하는 조이 (기록)
const RECORDS = [
  {img: `${C}/rc_present.png`, b: '국제 학회 발표', span: 'APSCI·ICORL 연구 발표'},
  {img: `${C}/rc_paper.png`, b: '학술지 논문 게재', span: 'CSD 학술지 2편'},
  {img: `${C}/rc_award.png`, b: 'AAC 공모전 수상', span: '‘말이 통하는 세상’ 동상'},
  {img: `${C}/rc_gov.png`, b: '교육청 사업 선정기관', span: '유아언어발달사업 수행'},
  {img: `${C}/rc_hospital.png`, b: '원주의료원 출강', span: '부모교육 자문·강의'},
  {img: `${C}/rc_seminar.png`, b: '전문 세미나 참여', span: '한국난청인교육협회 등'},
];

// 정확한 평가에서 시작해요 (검사도구)
const ASSESS = [
  {img: '/img/assessment/selsi.jpg', badge: 'SELSI', title: '영유아 언어발달 검사', desc: '4~35개월 영유아가 말을 얼마나 이해하고(수용언어) 표현하는지(표현언어) 살펴, 전반적인 언어발달이 또래 수준인지 확인합니다.', to: '/docs/assessment#selsi'},
  {img: '/img/assessment/revt.jpg', badge: 'REVT', title: '수용·표현 어휘력 검사', desc: '아이가 낱말을 얼마나 이해하고(수용) 말로 표현하는지(표현) 어휘력 수준을 확인합니다.', to: '/docs/assessment#revt'},
  {img: '/img/assessment/utap2.jpg', badge: 'UTAP2', title: '우리말 조음·음운 검사 2', desc: '말소리를 정확하게 발음하는지, 어떤 소리에서 오류가 나타나는지 확인하는 발음 검사입니다.', to: '/docs/assessment#utap2'},
  {img: '/img/assessment/qrw.jpg', badge: 'QRW', title: '아동 간편 읽기·쓰기 검사', desc: '음운인식·읽기·쓰기를 간편하게 선별해, 5세부터 초등 저학년 아동의 읽기·쓰기 발달 수준을 빠르게 확인합니다.', to: '/docs/assessment#qrw'},
  {img: '/img/assessment/kcars2.jpg', badge: 'K-CARS 2', title: '아동기 자폐 평정 척도 2', desc: '사회적 상호작용·의사소통·행동 등 여러 영역을 관찰·평정해, 자폐스펙트럼의 가능성과 정도를 파악하는 데 활용합니다.', to: '/docs/assessment#kcars2'},
  {img: '/img/assessment/kolra.jpg', badge: 'KOLRA', title: '한국어 읽기 검사', desc: '글자를 읽고 이해하는 읽기 능력과 받아쓰기 등 쓰기 능력을 함께 평가합니다.', to: '/docs/assessment#kolra'},
];

// 치료는 이렇게 진행돼요 (과정)
const STEPS = [
  {img: `${C}/p_consult.png`, n: 1, b: '상담 신청', span: '전화·카카오톡으로 아이의 고민을 편하게 들려주세요.'},
  {img: `${C}/p_assess.png`, n: 2, b: '평가·검사', span: '표준화 검사로 현재 수준과 강점·어려움을 파악해요.'},
  {img: `${C}/p_therapy.png`, n: 3, b: '맞춤 치료', span: '결과를 바탕으로 아이에게 맞는 1:1 계획을 세워요.'},
  {img: `${C}/p_home.png`, n: 4, b: '가정 연계', span: '가정에서 이어갈 수 있도록 보호자 코칭을 더해요.'},
];

// 기록 섹션 사진 슬라이더
const RECORD_PHOTOS = [
  {src: `${C}/records-seminar.jpg`, cap: '2026 한국난청인교육협회 세미나'},
  {src: '/img/blog/joy-news-20260713-6.jpg', cap: '전문 세미나·학술 활동'},
  {src: '/img/blog/joy-news-20260713-8.jpg', cap: '전문가 교류 세미나 현장'},
];

// 따뜻하고 안전한 치료 공간 (치료실) — 슬라이더와 카드 하이라이트 동기화
const ROOMS = [
  {img: `${C}/r_speech.png`, photo: '/img/home/concept/room-eoneo.jpg', name: '언어치료실', desc: '1:1 집중 수업을 위한 아늑하고 조용한 공간이에요. 아이가 편안하게 몰입할 수 있도록 꾸몄어요.'},
  {img: `${C}/r_art.png`, photo: '/img/home/concept/room-misul.jpg', name: '미술심리치료실', desc: '그림과 놀이로 마음을 표현하고 다독이는 공간이에요. 정서·사회성 발달을 함께 봐요.'},
  {img: `${C}/r_cog.png`, photo: `${C}/room-inji.jpg`, name: '인지학습치료실', desc: '읽기·학습을 아이 속도에 맞춰 차근차근 다지는 공간이에요.'},
];

// 조이 선생님들 (치료진)
const CREW = [
  {img: '/img/therapist/dayea-lee.png', name: '이다예 센터장', role: 'PECS / 청능구어재활 / ASD / 말더듬', badges: ['1급 언어재활사', '언어병리학 석사'],
   highlights: [
     {logo: '/img/therapist/logo-ewha.png', text: '이화여대 언어병리학 석사'},
     {logo: '/img/therapist/logo-pecs.svg', text: 'PECS Korea 강원도 지역장'},
     {logo: '/img/therapist/logo-wonju.png', text: '원주·평창교육지원청 순회 언어치료사'},
     {logo: '/img/therapist/logo-wonjumc.png', text: '원주의료원 부모교육 출강'},
   ],
   to: '/docs/therapist/slp-dayea-lee'},
  {img: '/img/therapist/minjung-hwang.png', name: '황민정 선생님', role: '표현·수용언어 / 조음·음운 / 사회성', badges: ['2급 언어재활사', '언어청각학 전공'],
   highlights: [
     {logo: '/img/therapist/logo-hallym.png', text: '한림대 언어청각학 학사'},
     {logo: '/img/therapist/logo-wonju.png', text: '원주·평창교육지원청 순회 언어치료사'},
     {logo: '/img/therapist/logo-kslp.png', text: '한국언어재활사협회 정회원'},
     {logo: '/img/therapist/logo-mohw.png', text: '2급 언어재활사 (보건복지부)'},
   ],
   to: '/docs/therapist/slp-minjung-hwang'},
  {img: '/img/therapist/jiyu-park.png', name: '박지유 선생님', role: '읽기·쓰기(난독) / 느린학습자 / 지적장애', badges: ['2급 언어재활사', '언어치료학 전공'],
   highlights: [
     {logo: '/img/therapist/logo-kwu.svg', text: '광주여자대학교 언어치료학 학사'},
     {logo: '/img/therapist/logo-yonsei.png', text: '연세대 디지털치료 연구센터 연구 참여'},
     {logo: '/img/therapist/logo-kslp.png', text: '한국언어재활사협회 정회원'},
     {logo: '/img/therapist/logo-mohw.png', text: '2급 언어재활사 (보건복지부)'},
   ],
   to: '/docs/therapist/slp-jiyu-park'},
];

// 자주 묻는 질문
const FAQS = [
  {q: '언어치료는 몇 살부터 받을 수 있나요?', a: '영유아기부터 가능해요. 빠른 확인과 적절한 자극이 무엇보다 중요합니다.'},
  {q: '검사는 꼭 받아야 하나요?', a: '네. 정확한 평가로 아이에게 맞는 치료 방향을 세울 수 있어요.'},
  {q: '수업은 어떻게 진행되나요?', a: '아이의 속도에 맞춘 1:1 놀이 기반 수업으로 진행돼요.'},
  {q: '가정에서도 도울 수 있나요?', a: '보호자 코칭과 가정 연계 활동으로 함께 이어가요.'},
];

// 칼럼 & 소식 (커뮤니티 미리보기) — 최신 글 + 분류별 개수
const COL_TAGS = [
  {key: 'notice', label: '공지사항'},
  {key: 'news', label: '센터소식'},
  {key: 'info', label: '정보공유'},
  {key: 'library', label: '교육자료'},
];
const colFmt = (d: string) => {
  const t = new Date(d);
  return `${t.getFullYear()}.${String(t.getMonth() + 1).padStart(2, '0')}.${String(t.getDate()).padStart(2, '0')}`;
};
const colPosts = [...blogArchive.archive.blogPosts].sort(
  (a, b) => new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime(),
);
const COL_TOTAL = colPosts.length;
const COL_COUNTS: Record<string, number> = Object.fromEntries(
  COL_TAGS.map((t) => [t.key, colPosts.filter((p) => p.metadata.tags?.some((pt) => pt.permalink.includes(t.key))).length]),
);
const COL_ALL = colPosts.map((p) => ({
  permalink: p.metadata.permalink,
  title: p.metadata.title,
  image: p.metadata.frontMatter?.image as string | undefined,
  tag: p.metadata.tags?.[0]?.label || '',
  author: p.metadata.authors?.[0]?.name || '조이',
  date: colFmt(p.metadata.date),
  cats: COL_TAGS.filter((t) => p.metadata.tags?.some((pt) => pt.permalink.includes(t.key))).map((t) => t.key),
}));

function HomepageHero() {
  return (
    <header className={styles.hero}>
      <BannerSlider />
      <div className={styles.heroOverlay}>
        <div className={styles.heroContent}>
          {/* SEO/접근성용 키워드 h1은 유지(화면엔 숨김) */}
          <h1 className={styles.srOnly}>원주 언어치료 · 언어재활 · 언어발달센터 — 조이 언어발달센터</h1>
          <p className={styles.heroTitle}>우리 아이,<br />말문이 트이는 그날까지<br /><span style={{color: '#ffd27a'}}>조이가 함께해요</span></p>
          <p className={styles.heroSubtitle}>원주 기업도시의 언어치료 전문기관</p>
          <div className={styles.heroActions}>
            <a className={styles.heroBtnPrimary} href={KAKAO_URL} target="_blank" rel="noopener noreferrer">
              <img className={`${styles.ctaBtnIcon} ${styles.ctaKakaoIcon}`} src="/img/kakao-channel.svg" alt="" aria-hidden="true" />
              카카오톡 상담
            </a>
            <a className={styles.heroBtnGhost} href="#therapy">치료분야 보기</a>
          </div>
        </div>
      </div>
    </header>
  );
}

function SectionHead({eyebrow, title, sub}: {eyebrow: string; title: ReactNode; sub?: ReactNode}) {
  return (
    <>
      <div className="eyebrow">{eyebrow}</div>
      <h2 className="t">{title}</h2>
      {sub && <p className="lead">{sub}</p>}
    </>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      description="[원주 언어치료 · 기업도시·지정면 언어치료 · 원주 조이언어발달센터] 조이 언어발달센터는 자폐스펙트럼장애, 지적장애, 유창성(말더듬)장애, 단순 언어발달장애, 조음(발음) 장애 아동의 기능적이고 즐거운 언어치료 수업을 만들어가고자 합니다.">
      <Head>
        <title>조이 언어발달센터</title>
        {/* 첫 배너를 우선 로딩해 첫 화면 지연 최소화 */}
        <link rel="preload" as="image" href="/img/index-banner-2.jpg" fetchpriority="high" />
        <meta property="og:title" content="조이 언어발달센터" />
        <meta property="og:description" content="즐거운 의사소통이 있는 곳, 조이 언어발달센터입니다. 원주 언어치료·언어발달센터." />
        <meta property="og:image" content="/img/joy-thumbnail.png" />
        <meta property="og:url" content="https://joylangcenter.com/" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="조이 언어발달센터" />
        <meta property="og:locale" content="ko_KR" />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: '조이 언어발달센터',
            alternateName: '원주 조이언어발달센터',
            url: 'https://joylangcenter.com/',
            inLanguage: 'ko',
            publisher: {
              '@type': 'Organization',
              name: '조이 언어발달센터',
              logo: {
                '@type': 'ImageObject',
                url: 'https://joylangcenter.com/img/logo-joy.png',
              },
            },
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': ['LocalBusiness', 'MedicalBusiness'],
            name: '조이 언어발달센터',
            alternateName: [
              '원주 조이언어발달센터', '조이언어발달센터',
              '원주 언어치료센터', '원주 언어재활센터', '원주 언어발달센터',
            ],
            description:
              '원주 언어치료, 언어발달, 언어재활 전문 센터. 자폐스펙트럼장애·지적장애·유창성(말더듬)·언어발달지연·조음(발음) 장애 아동의 기능적이고 즐거운 언어치료.',
            url: 'https://joylangcenter.com/',
            image: 'https://joylangcenter.com/img/joy-thumbnail.png',
            logo: 'https://joylangcenter.com/img/logo-joy.png',
            telephone: '+82-33-745-1030',
            address: {
              '@type': 'PostalAddress',
              streetAddress: '지정면 무릉로 15 JD스퀘어 6층',
              addressLocality: '원주시',
              addressRegion: '강원특별자치도',
              addressCountry: 'KR',
            },
            geo: {
              '@type': 'GeoCoordinates',
              latitude: 37.375124,
              longitude: 127.874845,
            },
            hasMap: 'https://naver.me/5Vm9WYYy',
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
        <div className="joyHome">
          {/* 치료 분야 */}
          <section id="therapy" className="sec worry"><div className="wrap">
            <SectionHead eyebrow="THERAPY FIELDS" title="조이의 전문 치료 분야" sub="전문 평가를 바탕으로, 아이에게 꼭 맞는 분야를 깊이 있게 도와요." />
            <div className="fgrid">
              {FIELDS.map((f) => (
                <Link key={f.title} className="fcard" to={f.to} style={{color: 'inherit'}}>
                  <div className="thumb"><img src={f.img} alt={f.title} loading="lazy" /></div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                  <div className="more">자세히 보기 →</div>
                </Link>
              ))}
            </div>
          </div></section>

          {/* 믿고 맡길 수 있는 이유 */}
          <section className="sec deep"><div className="wrap">
            <SectionHead eyebrow="WHY JOY" title="믿고 맡길 수 있는 이유" sub={<>국가자격과 석사 전공, 연구·현장 경험을 두루 갖춘 치료진이<br />근거 기반으로 아이의 성장을 함께합니다.</>} />
            <div className="sgrid">
              {STATS.map((s) => (
                <div key={s.k} className="sc"><div className="n">{s.n}</div><div className="k">{s.k}</div></div>
              ))}
            </div>
            <div className="creds">
              {CREDS.map((c) => (
                <div key={c.b} className="cred">
                  <span className="ic ch"><img src={c.img} alt="" loading="lazy" /></span>
                  <div><b>{c.b}</b><span>{c.span}</span></div>
                </div>
              ))}
            </div>
          </div></section>

          {/* 현장과 학계가 함께하는 조이 */}
          <section className="sec rec"><div className="wrap">
            <SectionHead eyebrow="TRACK RECORD" title="현장과 학계가 함께하는 조이" sub="학회·연구·지역 현장에서 차곡차곡 쌓아온 전문성의 기록이에요." />
            <div className="rec2">
              <div className="reclist">
                {RECORDS.map((r) => (
                  <div key={r.b} className="recitem">
                    <span className="ic"><img src={r.img} alt="" loading="lazy" /></span>
                    <div><b>{r.b}</b><span>{r.span}</span></div>
                  </div>
                ))}
              </div>
              <div className="recpic"><PhotoSlider images={RECORD_PHOTOS} /></div>
            </div>
          </div></section>

          {/* 정확한 평가에서 시작해요 */}
          <section className="sec assess"><div className="wrap">
            <SectionHead eyebrow="ASSESSMENT" title="정확한 평가에서 시작해요" sub="상담에서 아이의 발달을 함께 짚어보고, 영역별 표준화 검사로 현재 수준과 강점·어려움을 객관적으로 파악합니다." />
            <div className="assess2">
              <div className="apic2"><img src="/img/blog/joy-news-20260822-3.png" alt="상담·평가 장면" loading="lazy" /></div>
              <AssessSlider items={ASSESS} />
            </div>
          </div></section>

          {/* 치료는 이렇게 진행돼요 */}
          <section className="sec proc"><div className="wrap">
            <SectionHead eyebrow="PROCESS" title="치료는 이렇게 진행돼요" sub="첫 상담부터 가정 연계까지, 한 걸음씩 함께합니다." />
            <div className="proc2">
              <div className="vsteps">
                {STEPS.map((s) => (
                  <div key={s.n} className="vstep">
                    <div className="thumb"><img src={s.img} alt="" loading="lazy" /><span className="n">{s.n}</span></div>
                    <div><b>{s.b}</b><span>{s.span}</span></div>
                  </div>
                ))}
              </div>
              <div className="proc2pic"><img src="/img/blog/joy-news-20260822-2.png" alt="" loading="lazy" /></div>
            </div>
          </div></section>

          {/* 따뜻하고 안전한 치료 공간 */}
          <section className="sec space"><div className="wrap">
            <SectionHead eyebrow="OUR SPACE" title="따뜻하고 안전한 치료 공간" sub="아이가 편안하게 집중할 수 있도록, 영역별 전용 치료실을 갖췄어요." />
            <SpaceSection rooms={ROOMS} />
          </div></section>

          {/* 조이 선생님들 */}
          <section className="sec crew"><div className="wrap">
            <SectionHead eyebrow="OUR THERAPISTS" title="조이 선생님들" sub="아이 한 명 한 명을 깊이 이해하는, 자격을 갖춘 치료진이 함께해요." />
            <CrewSlider items={CREW} />
          </div></section>

          {/* FAQ */}
          <section className="sec faqs"><div className="wrap">
            <SectionHead eyebrow="FAQ" title="이런 게 궁금해요" />
            <FaqSlider items={FAQS} />
          </div></section>

          {/* 언어치료 칼럼 & 소식 (커뮤니티 미리보기) */}
          <section className="sec col"><div className="wrap">
            <div className="colhead">
              <div>
                <SectionHead eyebrow="COLUMN" title="언어치료 칼럼 & 소식" sub="치료 팁·발달 정보·검사 안내·센터 소식까지, 꾸준히 쌓아가는 이야기." />
              </div>
            </div>
            <ColumnPreview posts={COL_ALL} tags={COL_TAGS} counts={COL_COUNTS} total={COL_TOTAL} />
          </div></section>

        {/* 오시는 길 */}
        <section className="sec" style={{background: 'linear-gradient(180deg,#fffaf1,#fff4e2)'}}>
          <div className="wrap">
            <SectionHead eyebrow="LOCATION" title="오시는 길" />
            <div className={styles.locationCard}>
              <p className={styles.address}>📍 {ADDRESS}</p>
              <div className={styles.channelRow}>
                <a className={styles.channelIcon} href={`tel:${PHONE}`} aria-label="전화 상담">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="#f2921d"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                </a>
                <a className={`${styles.channelIcon} ${styles.ciKakao}`} href={KAKAO_URL} target="_blank" rel="noopener noreferrer" aria-label="카카오톡 상담"></a>
                <a className={`${styles.channelIcon} ${styles.ciNaver}`} href={NAVER_URL} target="_blank" rel="noopener noreferrer" aria-label="네이버 블로그"></a>
                <a className={`${styles.channelIcon} ${styles.ciInsta}`} href={INSTA_URL} target="_blank" rel="noopener noreferrer" aria-label="인스타그램"></a>
              </div>
            </div>
            <div className={styles.mapWrap}>
              <NaverMap />
            </div>
          </div>
        </section>

        {/* 상담 CTA */}
        <section id="contact" className={styles.ctaBand}>
          <div className={styles.container}>
            <h2 className={styles.ctaTitle}>궁금한 점이 있으신가요?</h2>
            <p className={styles.ctaSub}>상담 시간·수업 안내 등 무엇이든 전화나 카카오톡으로 편하게 문의해 주세요.</p>
            <div className={styles.ctaActions}>
              <a className={styles.ctaBtn} href={`tel:${PHONE}`}>
                <svg className={styles.ctaBtnIcon} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                전화 상담
              </a>
              <a className={styles.ctaBtnGhost} href={KAKAO_URL} target="_blank" rel="noopener noreferrer">
                <img className={`${styles.ctaBtnIcon} ${styles.ctaKakaoIcon}`} src="/img/kakao-channel.svg" alt="" aria-hidden="true" />
                카카오톡 상담
              </a>
            </div>
          </div>
        </section>
        </div>
      </main>
    </Layout>
  );
}
