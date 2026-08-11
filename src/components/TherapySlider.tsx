import React from 'react';
import Link from '@docusaurus/Link';
import {Swiper, SwiperSlide} from 'swiper/react';
import {Navigation, Pagination, A11y} from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import styles from './TherapySlider.module.css';

type Area = {img: string; title: string; desc: string; to: string};

export default function TherapySlider({areas}: {areas: Area[]}) {
  return (
    <div className={styles.wrap}>
      <Swiper
        modules={[Navigation, Pagination, A11y]}
        navigation
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
                <img src={a.img} alt={a.title} className={styles.img} loading="lazy" />
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
    </div>
  );
}
