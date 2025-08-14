import type {ReactNode} from 'react';
import Layout from '@theme/Layout';
import Head from '@docusaurus/Head';
import styles from './index.module.css';
import BlogCards from '@site/src/components/BlogCards';
import BannerSlider from '@site/src/components/BannerSlider';
import NaverMap from "@site/src/components/NaverMap";

function HomepageHeader() {
  return (
      <header className={styles.heroBanner}>
        <BannerSlider />
      </header>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      // title={`${siteConfig.title}`}
      description="[원주 언어발달센터, 원주 기업도시 언어발달센터, 원주 지정면 언어발달센터, 원주 언어치료, 원주 기업도시 언어치료, 원주 지정면 언어치료] 자폐스펙트럼장애, 지적장애, 유창성(말더듬)장애, 단순 언어발달장애, 조음(발음) 장애 아동의 기능적이고 즐거운 언어치료 수업을 만들어가고자 합니다.">
      <Head>
        <meta property="og:title" content="조이 언어발달센터" />
        <meta property="og:description" content="즐거운 의사소통이 있는 곳, 조이 언어발달센터입니다." />
        <meta property="og:image" content="/img/joy-thumbnail.png" />
        <meta property="og:url" content="https://joylangcenter.com/" />
        <meta property="og:type" content="website" />
      </Head>

      <HomepageHeader />
      <main>
        {/* BlogCards Section */}
        <section className={styles.sectionDark}>
          <BlogCards tag="notice" title="📣 공지사항 📣"/>
        </section>
        <section className={styles.sectionLight}>
          <BlogCards tag="news" title="💌 센터 소식 💌" />
        </section>

        <section className={styles.sectionDark} style={{ paddingBottom: '0px' }}>
          <h3 className={styles.sectionTitle}>📍 오시는 길</h3>
          <NaverMap />
        </section>

        {/* Features Section */}
        {/*{showFeatures && (*/}
        {/*    <section className={styles.sectionDark}>*/}
        {/*      <HomepageFeatures />*/}
        {/*    </section>*/}
        {/*)}*/}
      </main>
    </Layout>
  );
}
