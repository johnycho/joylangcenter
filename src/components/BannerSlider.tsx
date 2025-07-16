import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import {
  Autoplay,
  Pagination,
  Navigation,
  EffectFade,
} from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import styles from './BannerSlider.module.css';

export default function BannerSlider() {
  const [slides] = useState([
    '/img/index-banner.jpg',
    '/img/index-banner-2.jpg',
    '/img/index-banner-3.jpg',
    '/img/index-banner-4.jpg',
  ]);

  return (
      <div className={styles.bannerWrapper}>
        <Swiper
            modules={[Autoplay, Pagination, Navigation, EffectFade]}
            effect="fade"
            fadeEffect={{ crossFade: true }}
            speed={2000}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            loop
            pagination={{ clickable: true }}
            navigation
            className={styles.swiper}
        >
          {slides.map((src, idx) => (
              <SwiperSlide key={idx}>
                <img src={src} alt={`배너 ${idx + 1}`} className={styles.slideImage}/>
              </SwiperSlide>
          ))}
        </Swiper>
      </div>
  );
}