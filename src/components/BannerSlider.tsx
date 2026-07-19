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
  // 배너 이미지는 배경을 좌우로 확장(1.85:1)해 두어 사람이 잘리지 않게 함.
  // object-position 은 이미지마다 crop 기준을 달리함:
  //  - banner-2: 아이 몸통이 하단 → 하단 정렬(위쪽 배경만 크롭)
  //  - banner-3: 손이 상단 → 중앙 정렬
  const [slides] = useState([
    {src: '/img/index-banner-2.jpg', pos: 'center bottom'},
    {src: '/img/index-banner-3.jpg', pos: 'center'},
  ]);

  return (
      <div className={styles.bannerWrapper}>
        <Swiper
            modules={[Autoplay, Pagination, Navigation, EffectFade]}
            effect="fade"
            fadeEffect={{ crossFade: true }}
            speed={700}
            autoplay={{
              delay: 4500,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            loop
            pagination={{ clickable: true }}
            navigation
            className={styles.swiper}
        >
          {slides.map((slide, idx) => (
              <SwiperSlide key={idx}>
                <img
                    src={slide.src}
                    alt={`조이 언어발달센터, 원주 언어치료센터, 원주 언어재활센터, 원주 언어발달센터`}
                    className={styles.slideImage}
                    style={{objectPosition: slide.pos}}
                    decoding="async"
                    loading={idx === 0 ? 'eager' : 'lazy'}
                    // @ts-ignore - fetchPriority 는 최신 브라우저 지원
                    fetchpriority={idx === 0 ? 'high' : 'low'}
                />
              </SwiperSlide>
          ))}
        </Swiper>
      </div>
  );
}