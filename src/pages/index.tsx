import type {ReactNode} from 'react';
import {useEffect, useState} from 'react';
import clsx from 'clsx';
// import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Head from '@docusaurus/Head';

import styles from './index.module.css';
// import Heading from "@theme/Heading";
import BlogCards from '@site/src/components/BlogCards';

function HomepageHeader({ onVisible }: { onVisible: () => void }) {
  // const {siteConfig} = useDocusaurusContext();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = '/img/index-banner.jpg';
    img.onload = () => {
      requestAnimationFrame(() => setLoaded(true));
      setTimeout(onVisible, 1200); // 배너 animation 후 features 보여주기
    };
  }, []);

  return (
    <header className={clsx(
        'hero hero--primary',
        styles.heroBanner,
        loaded && styles.heroBannerVisible)}>
      <div className="container" style={{fontFamily: "'Nanum Pen Script', cursive", color: "#fff"}}>
        {/*<Heading as="h1" className="hero__title"*/}
        {/*         style={{fontFamily: "'Nanum Pen Script', cursive", color: "#fff"}}>*/}
        {/*  {siteConfig.title}*/}
        {/*</Heading>*/}
        {/*<p className="hero__subtitle">{siteConfig.tagline}</p>*/}
        {/*<div className={styles.buttons}>*/}
        {/*  <Link*/}
        {/*    className="button button--secondary button--lg"*/}
        {/*    to="/docs/intro">*/}
        {/*    Docusaurus Tutorial - 5min ⏱️*/}
        {/*  </Link>*/}
        {/*</div>*/}
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  // const {siteConfig} = useDocusaurusContext();
  const [showFeatures, setShowFeatures] = useState(false); // 상태 추가

  return (
    <Layout
      // title={`${siteConfig.title}`}
      description="원주 기업도시에 위치한 1인 언어치료실로 자폐스펙트럼장애, 지적장애, 유창성(말더듬)장애, 단순 언어발달장애, 조음(발음) 장애 아동의 기능적이고 즐거운 언어치료 수업을 만들어가고자 합니다. (원주 언어발달센터, 원주 기업도시 언어발달센터, 원주 지정면 언어발달센터, 원주 언어치료, 원주 기업도시 언어치료, 원주 지정면 언어치료)">
      <Head>
        <meta name="keywords" content="원주 언어발달센터, 원주 기업도시 언어발달센터, 원주 지정면 언어발달센터, 원주 언어치료, 원주 기업도시 언어치료, 원주 지정면 언어치료" />
        <meta property="og:title" content="조이 언어발달센터" />
        <meta property="og:description" content="즐거운 의사소통이 있는 곳, 조이 언어발달센터입니다." />
        <meta property="og:image" content="https://joylangcenter.com/img/joy-thumbnail.png" />
        <meta property="og:url" content="https://joylangcenter.com/" />
        <meta property="og:type" content="website" />
      </Head>

      <HomepageHeader onVisible={() => setShowFeatures(true)} />
      <main>
        {/* 배너 애니메이션 후에만 등장 */}
        {showFeatures && <HomepageFeatures />}
        <BlogCards />
      </main>
    </Layout>
  );
}
