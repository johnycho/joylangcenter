import React, {useEffect, useState} from 'react';
import Link from '@docusaurus/Link';
import {useLocation} from '@docusaurus/router';
import styles from './PromoPopup.module.css';

// 홍보 팝업 설정 — 기간이 지나면 자동으로 뜨지 않는다. 새 홍보는 이 객체만 바꾸면 된다(id 변경 필수).
const PROMO = {
  id: 'joyful-school-2nd-20261211',
  until: '2026-12-12T00:00:00+09:00', // 이 시각 전까지만 노출 (2차 설명회 당일까지)
  image: '/img/blog/joy-notice-20261123-1.png',
  alt: '조이풀 학교 2차 설명회 안내 · 2026년 12월 11일(금) 오전 11시 · 조이 언어발달센터',
  badge: '모집중',
  title: '조이풀 학교 2차 설명회',
  href: '/blog/joy-notice-20261123',
  cta: '자세히 보기',
  planTitle: '2027년 1월 운영 계획 · 각 4회기',
  recruit: {label: '모집', value: '아동 4명 (최대 6명)', highlight: '선착순'},
  // 회기별 날짜 — classes 순서(평일반, 주말반)와 같은 순서
  sessions: [
    {label: '1회기', dates: ['1/8 (금)', '1/10 (일)']},
    {label: '2회기', dates: ['1/15 (금)', '1/17 (일)']},
    {label: '3회기', dates: ['1/22 (금)', '1/24 (일)']},
    {label: '4회기', dates: ['1/29 (금)', '1/31 (일)']},
  ],
  // 1회기 150분 시간표 (1차 설명회 글 운영 계획 이미지 기준, 색도 원본과 맞춤). 반별 시작 시각에서 분을 누적해 시각을 계산
  timetableTitle: '1회기 시간표 (150분)',
  classes: [
    {label: '평일반 (금)', start: '09:00'},
    {label: '주말반 (일)', start: '10:00'},
  ],
  timetable: [
    {label: '등교', min: 10, color: '#3f7ea6'},
    {label: '1교시', min: 40, color: '#5f948a'},
    {label: '쉬는시간', min: 10, color: '#4fae8a'},
    {label: '2교시', min: 40, color: '#c98f3c'},
    {label: '쉬는시간', min: 10, color: '#de8462'},
    {label: '점심시간', min: 30, color: '#c06a6a'},
    {label: '하교준비', min: 10, color: '#7f80b5'},
  ],
};

const HIDE_KEY = `joy:popup:${PROMO.id}:hideDate`; // localStorage — 오늘 하루 보지 않기

// '09:00' + 분 → 'HH:MM'
const addMin = (hhmm: string, min: number) => {
  const [h, m] = hhmm.split(':').map(Number);
  const t = h * 60 + m + min;
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
};

const totalMin = PROMO.timetable.reduce((sum, slot) => sum + slot.min, 0);

// 반별 각 교시의 [시작, 끝] 시각
const slotTimes = (start: string) => {
  let acc = 0;
  return PROMO.timetable.map((slot) => {
    const range = `${addMin(start, acc)}~${addMin(start, acc + slot.min)}`;
    acc += slot.min;
    return range;
  });
};

const yyyymmdd = () => {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
};

function shouldShow(pathname: string): boolean {
  if (Date.now() >= new Date(PROMO.until).getTime()) return false;
  if (pathname.replace(/\/+$/, '') === PROMO.href) return false; // 안내 글 자체에선 띄우지 않음
  try {
    if (localStorage.getItem(HIDE_KEY) === yyyymmdd()) return false;
  } catch (_) {}
  return true;
}

export default function PromoPopup() {
  const {pathname} = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!shouldShow(pathname)) return;
    const t = setTimeout(() => setOpen(true), 600);
    return () => clearTimeout(t);
    // 첫 진입 시에만 판단 (페이지 이동마다 다시 띄우지 않음)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // 닫기는 기록하지 않는다 — 새로고침·재방문 시 다시 뜨고, 사이트 내 페이지 이동 중에만 다시 안 뜸
  const close = () => setOpen(false);

  const hideToday = () => {
    try {
      localStorage.setItem(HIDE_KEY, yyyymmdd());
    } catch (_) {}
    close();
  };

  if (!open) return null;

  return (
    <div className={styles.backdrop} onClick={close}>
      <div
        className={styles.popup}
        role="dialog"
        aria-modal="true"
        aria-labelledby="promo-popup-title"
        onClick={(e) => e.stopPropagation()}>
        <button type="button" className={styles.x} onClick={close} aria-label="팝업 닫기">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <Link to={PROMO.href} onClick={close} className={styles.imageLink}>
          <img src={PROMO.image} alt={PROMO.alt} className={styles.image} />
        </Link>
        <div className={styles.body}>
          <div className={styles.heading}>
            <span className={styles.badge}>{PROMO.badge}</span>
            <strong id="promo-popup-title" className={styles.title}>{PROMO.title}</strong>
          </div>
          <div className={styles.plan}>
            <span className={styles.planTitle}>{PROMO.planTitle}</span>
            <div className={styles.planRow}>
              <span className={styles.planLabel}>{PROMO.recruit.label}</span>
              <span>{PROMO.recruit.value}</span>
              <span className={styles.highlight}>{PROMO.recruit.highlight}</span>
            </div>
            <table className={styles.timetable}>
              <thead>
                <tr>
                  <th>회기</th>
                  {PROMO.classes.map((c) => (
                    <th key={c.label}>
                      {c.label}
                      <span className={styles.time}>{c.start}~{addMin(c.start, totalMin)}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PROMO.sessions.map((s) => (
                  <tr key={s.label}>
                    <td>{s.label}</td>
                    {s.dates.map((d, i) => (
                      <td key={i}>{d}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <span className={styles.planTitle}>{PROMO.timetableTitle}</span>
            <div className={styles.timeBar} aria-hidden="true">
              {PROMO.timetable.map((slot, i) => (
                <span key={i} style={{flexGrow: slot.min, background: slot.color}} />
              ))}
            </div>
            <table className={styles.timetable}>
              <thead>
                <tr>
                  <th>구분</th>
                  {PROMO.classes.map((c) => (
                    <th key={c.label}>{c.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PROMO.timetable.map((slot, i) => (
                  <tr key={i}>
                    <td>
                      <span className={styles.slot} style={{background: slot.color}}>
                        {slot.label} {slot.min}분
                      </span>
                    </td>
                    {PROMO.classes.map((c) => (
                      <td key={c.label}>{slotTimes(c.start)[i]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className={styles.footer}>
          <Link to={PROMO.href} onClick={close} className={styles.cta}>
            {PROMO.cta}
          </Link>
          <div className={styles.footerButtons}>
            <button type="button" onClick={hideToday}>오늘 하루 보지 않기</button>
            <button type="button" onClick={close}>닫기</button>
          </div>
        </div>
      </div>
    </div>
  );
}
