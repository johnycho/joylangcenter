import React from 'react';
import Link from '@docusaurus/Link';
import {Swiper, SwiperSlide} from 'swiper/react';
import {Navigation, Pagination, A11y} from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import styles from './TherapySlider.module.css';

type Area = {img: string; title: string; desc: string; to: string; pos?: string};

// Swiper 가 querySelector 로 찾을 수 있게 전역(비-CSS모듈) 클래스로 화살표를 연결한다.
const PREV = 'js-therapy-prev';
const NEXT = 'js-therapy-next';

export default function TherapySlider({areas}: {areas: Area[]}) {
  return (
    <div className={styles.wrap}>
      <Swiper
        modules={[Navigation, Pagination, A11y]}
        navigation={{prevEl: `.${PREV}`, nextEl: `.${NEXT}`}}
        pagination={{clickable: true}}
        grabCursor
        loop
        speed={500}
        spaceBetween={22}
        slidesPerView={1.15}
        breakpoints={{
          640: {slidesPerView: 2, spaceBetween: 18},
          996: {slidesPerView: 3, spaceBetween: 22},
        }}
        className={styles.swiper}>
        {areas.map((a) => (
          <SwiperSlide key={a.title} className={styles.slide}>
            <Link to={a.to} className={styles.card}>
              <div className={styles.imgWrap}>
                <img src={a.img} alt={a.title} className={styles.img} style={{objectPosition: a.pos || 'center'}} loading="lazy" />
              </div>
              <div className={styles.body}>
                <h3 className={styles.title}>{a.title}</h3>
                <p className={styles.desc}>{a.desc}</p>
                <span className={styles.more}>자세히 보기 →</span>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>

      <button type="button" className={`${styles.navBtn} ${styles.navPrev} ${PREV}`} aria-label="이전">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6" /></svg>
      </button>
      <button type="button" className={`${styles.navBtn} ${styles.navNext} ${NEXT}`} aria-label="다음">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg>
      </button>
    </div>
  );
}
