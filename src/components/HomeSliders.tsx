import React, {useState, useRef, useEffect} from 'react';
import Link from '@docusaurus/Link';
import {fetchViews} from '@site/src/viewCount';
import {Swiper, SwiperSlide} from 'swiper/react';
import type {Swiper as SwiperClass} from 'swiper';
import {Navigation, Pagination, Autoplay, A11y} from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

type AssessItem = {img: string; badge: string; title: string; desc: string; to: string};
type Faq = {q: string; a: string};

/** FAQ — PC는 2×2 그리드, 모바일은 1장 peek + 하단 점(슬라이더 인식) */
export function FaqSlider({items}: {items: Faq[]}) {
  return (
    <div className="jhFaq">
      <Swiper
        modules={[Pagination, A11y]}
        slidesPerView={1}
        spaceBetween={12}
        pagination={{el: '.js-faq-dots', clickable: true}}
        breakpoints={{821: {slidesPerView: 2, spaceBetween: 18}}}>
        {items.map((f) => (
          <SwiperSlide key={f.q}>
            <div className="qa">
              <div className="q"><span className="mark">Q</span>{f.q}</div>
              <div className="a">{f.a}</div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="adots js-faq-dots"></div>
    </div>
  );
}
type ColPost = {permalink: string; title: string; image?: string; tag: string; author: string; date: string; cats: string[]};

/** 칼럼 미리보기 — 카테고리 클릭 시 홈에서 해당 글 카드로 필터(페이지 이동 없음) */
export function ColumnPreview({posts, tags, counts, total}: {posts: ColPost[]; tags: {key: string; label: string}[]; counts: Record<string, number>; total: number}) {
  const [cat, setCat] = useState('all');
  const [sort, setSort] = useState<'date' | 'views'>('date');
  const [views, setViews] = useState<Record<string, number>>({});
  const colgRef = useRef<HTMLDivElement>(null);
  const scrollCol = (dir: number) => {
    const el = colgRef.current;
    if (el) el.scrollBy({left: dir * el.clientWidth * 0.9, behavior: 'smooth'});
  };
  useEffect(() => {
    fetchViews(posts.map((p) => p.permalink)).then(setViews).catch(() => {});
  }, [posts]);
  const filtered = cat === 'all' ? posts : posts.filter((p) => p.cats.includes(cat));
  const sorted = sort === 'views'
    ? [...filtered].sort((a, b) => (views[b.permalink] ?? 0) - (views[a.permalink] ?? 0))
    : filtered;
  const list = sorted.slice(0, 5);
  const moreUrl = cat === 'all' ? '/blog' : `/blog/tags/${cat}`;
  const remaining = (cat === 'all' ? total : counts[cat] || 0) - list.length;
  return (
    <>
      <div className="catbar">
        <div className="catrow">
          <button type="button" className={`cat${cat === 'all' ? ' on' : ''}`} onClick={() => setCat('all')}>전체<b>{total}</b></button>
          {tags.map((t) => (
            <button type="button" key={t.key} className={`cat${cat === t.key ? ' on' : ''}`} onClick={() => setCat(t.key)}>{t.label}<b>{counts[t.key]}</b></button>
          ))}
        </div>
        <div className="colsort">
          <button type="button" className={`sortbtn${sort === 'date' ? ' on' : ''}`} onClick={() => setSort('date')}>최신순</button>
          <button type="button" className={`sortbtn${sort === 'views' ? ' on' : ''}`} onClick={() => setSort('views')}>조회순</button>
        </div>
      </div>
      <div className="colgwrap">
        <button type="button" className="colnav l" aria-label="이전" onClick={() => scrollCol(-1)}>‹</button>
        <div className="colg" ref={colgRef} style={{marginTop: 22}}>
          {list.map((p) => (
            <Link key={p.permalink} className="citem" to={p.permalink}>
              <div className="ph" style={p.image ? {backgroundImage: `url(${p.image})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', backgroundColor: '#fff6ea'} : undefined}></div>
              <div className="bd">
                <span className="tag">{p.tag}</span>
                <h4>{p.title}</h4>
                <div className="meta">
                  <span className="cwho">{p.author}</span>
                  <span className="cdate">{p.date}</span>
                  <span className="cviews" aria-label={`조회수 ${views[p.permalink] ?? 0}회`}>
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    {(views[p.permalink] ?? 0).toLocaleString('ko-KR')}
                  </span>
                </div>
              </div>
            </Link>
          ))}
          {remaining > 0 && (
            <Link className="morecard" to={moreUrl}><span className="n">+{remaining}</span><span>더보기</span></Link>
          )}
        </div>
        <button type="button" className="colnav r" aria-label="다음" onClick={() => scrollCol(1)}>›</button>
      </div>
    </>
  );
}
type CrewItem = {img: string; name: string; role: string; badges: string[]; highlights: {logo: string; text: string}[]; to: string};
type Room = {img: string; photo: string; name: string; desc: string};

/** 치료공간 — 사진 슬라이더 ↔ 오른쪽 치료실 카드 하이라이트 동기화 */
export function SpaceSection({rooms}: {rooms: Room[]}) {
  const [active, setActive] = useState(0);
  const swiperRef = useRef<SwiperClass | null>(null);
  return (
    <div className="sp2">
      <div className="sp2pic"><div className="pslider jhSlider">
        <Swiper
          modules={[Navigation, Pagination, Autoplay, A11y]}
          onSwiper={(s) => {swiperRef.current = s;}}
          onSlideChange={(s) => setActive(s.realIndex)}
          navigation
          pagination={{clickable: true}}
          loop
          grabCursor
          speed={500}
          autoplay={{delay: 4200, disableOnInteraction: false, pauseOnMouseEnter: true}}>
          {rooms.map((r, i) => (
            <SwiperSlide key={i}>
              <div className="frame">
                <img src={r.photo} alt={r.name} loading="lazy" />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div></div>
      <div className="sp2rooms">
        {rooms.map((r, i) => (
          <button
            key={r.name}
            type="button"
            className={`room${i === active ? ' on' : ''}`}
            aria-pressed={i === active}
            onClick={() => swiperRef.current?.slideToLoop(i)}>
            <div className="ic ch"><img src={r.img} alt="" loading="lazy" /></div>
            <div>
              <b>{r.name}</b>
              <span>{r.desc}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/** 치료진 슬라이더 — PC는 전부 보이고, 모바일은 peek+점으로 슬라이더 */
export function CrewSlider({items}: {items: CrewItem[]}) {
  return (
    <div className="jhCrew">
      <Swiper
        modules={[Pagination, A11y]}
        pagination={{el: '.js-crew-dots', clickable: true}}
        grabCursor
        speed={450}
        spaceBetween={22}
        slidesPerView={1}
        breakpoints={{768: {slidesPerView: 2, spaceBetween: 28}}}>
        {items.map((p) => (
          <SwiperSlide key={p.name}>
            <Link className="person" to={p.to}>
              <div className="av"><img src={p.img} alt={p.name} loading="lazy" /></div>
              <h3>{p.name}</h3>
              <div className="role">{p.role}</div>
              <div className="badges">{p.badges.map((b) => <span key={b} className="bdg">{b}</span>)}</div>
              <ul className="plist">{p.highlights.map((h) => (
                <li key={h.text}><span className="plogo"><img src={h.logo} alt="" loading="lazy" /></span>{h.text}</li>
              ))}</ul>
              <span className="pmore">자세히 보기 →</span>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="adots js-crew-dots"></div>
    </div>
  );
}

type Photo = {src: string; cap?: string};

/** 가로 사진 슬라이더 — 기록/치료공간 섹션 (실제 동작: 화살표·점·자동재생·스와이프) */
export function PhotoSlider({images}: {images: Photo[]}) {
  return (
    <div className="pslider jhSlider">
      <Swiper
        modules={[Navigation, Pagination, Autoplay, A11y]}
        navigation
        pagination={{clickable: true}}
        loop={images.length > 1}
        grabCursor
        speed={500}
        autoplay={{delay: 4200, disableOnInteraction: false, pauseOnMouseEnter: true}}>
        {images.map((im, i) => (
          <SwiperSlide key={i}>
            <div className="frame">
              <img src={im.src} alt="" loading="lazy" decoding="async" />
              {im.cap && <div className="pcap">{im.cap}</div>}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

/** 가로 카드 슬라이더 — 정확한 평가 섹션 (이미지 상단 카드, ‹ › + 점, 모바일 peek) */
export function AssessSlider({items}: {items: AssessItem[]}) {
  return (
    <div className="acar jhAssess2">
      <button className="navb l js-assess-prev" aria-label="이전 검사">‹</button>
      <Swiper
        modules={[Navigation, Pagination, Autoplay, A11y]}
        navigation={{prevEl: '.js-assess-prev', nextEl: '.js-assess-next'}}
        pagination={{el: '.js-assess-dots2', clickable: true}}
        grabCursor
        loop
        speed={500}
        spaceBetween={18}
        slidesPerView={1}
        autoplay={{delay: 3600, disableOnInteraction: false, pauseOnMouseEnter: true}}>
        {items.map((a) => (
          <SwiperSlide key={a.badge}>
            <Link className="acard" to={a.to}>
              <div className="img"><img src={a.img} alt={a.title} loading="lazy" /></div>
              <div className="bd">
                <span className="ab">{a.badge}</span>
                <h4>{a.title}</h4>
                <p>{a.desc}</p>
                <span className="more">자세히 보기 →</span>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
      <button className="navb r js-assess-next" aria-label="다음 검사">›</button>
      <div className="adots js-assess-dots2"></div>
    </div>
  );
}
