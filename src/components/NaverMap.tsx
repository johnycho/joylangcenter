import React, { useEffect, useRef, useState } from 'react';

const CENTER_LAT = 37.375124;
const CENTER_LNG = 127.874845;
const DEFAULT_ZOOM = 16;
const GAP_ABOVE_ZOOM = 8; // 줌 컨트롤 위 간격(px)
const FALLBACK_BOTTOM = 240; // 측정 실패 시 기본 위치(px)

const NaverMap = () => {
  const mapRef = useRef<any>(null);
  // 줌 컨트롤 실제 위치를 측정해 그 바로 위에 버튼을 배치(상대 위치)
  const [btnBottom, setBtnBottom] = useState<number>(FALLBACK_BOTTOM);

  // 지도 우측 하단 줌 컨트롤의 상단 위치를 측정해 버튼을 그 위로 올린다
  const positionResetButton = () => {
    const mapEl = document.getElementById('map');
    if (!mapEl) return;
    const mr = mapEl.getBoundingClientRect();
    if (!mr.height) return;
    let minTop = Infinity;
    mapEl.querySelectorAll('a, img').forEach((el) => {
      const r = (el as HTMLElement).getBoundingClientRect();
      if (!r.width || !r.height) return;
      const rightInset = mr.right - r.right;
      const topFromMapTop = r.top - mr.top;
      // 우측(rightInset<55)이며 지도 하단부(상단 30% 제외)에 있는 요소 = 줌 컨트롤
      if (rightInset >= -2 && rightInset < 55 && topFromMapTop > mr.height * 0.3) {
        minTop = Math.min(minTop, topFromMapTop);
      }
    });
    if (minTop !== Infinity) {
      setBtnBottom(Math.round(mr.height - minTop + GAP_ABOVE_ZOOM));
    }
  };

  useEffect(() => {
    const SCRIPT_SRC = 'https://openapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=0dphxly4jw';

    const initMap = () => {
      try {
        if (!window.naver || !window.naver.maps || !document.getElementById('map')) return;
        const map = new window.naver.maps.Map('map', {
          center: new window.naver.maps.LatLng(CENTER_LAT, CENTER_LNG),
          zoom: DEFAULT_ZOOM,
          // 스크롤(휠)·핀치·더블클릭 줌은 끄고, 줌 버튼으로만 확대/축소
          scrollWheel: false,
          pinchZoom: false,
          disableDoubleClickZoom: true,
          disableDoubleTapZoom: true,
          disableTwoFingerTapZoom: true,
          zoomControl: true,
          zoomControlOptions: {
            position: window.naver.maps.Position.RIGHT_BOTTOM,
          },
          mapTypeControl: true,
          mapTypeControlOptions: {
            position: window.naver.maps.Position.TOP_RIGHT,
          },
        });
        mapRef.current = map;

        const marker = new window.naver.maps.Marker({
          position: new window.naver.maps.LatLng(CENTER_LAT, CENTER_LNG),
          map,
          title: '조이 언어발달센터',
        });
        window.naver.maps.Event.addListener(marker, 'click', () => {
          window.open('https://naver.me/5Vm9WYYy', '_blank');
        });

        const infoWindow = new window.naver.maps.InfoWindow({
          content: `
          <a href="https://naver.me/5Vm9WYYy" target="_blank" rel="noopener noreferrer" style="text-decoration: none; color: inherit;">
            <div style="padding:10px;font-size:14px;">
              <strong>📍 조이 언어발달센터</strong><br/>
              강원특별자치도 원주시 지정면 무릉로 15<br/>
              JD스퀘어 6층
            </div>
          </a>`,
        });
        infoWindow.open(map, marker);

        window.naver.maps.Event.once(map, 'init', positionResetButton);
        setTimeout(positionResetButton, 700);
      } catch (e) {
        // 지도 로드 실패(도메인 인증 등)해도 페이지가 깨지지 않도록 무시
        // eslint-disable-next-line no-console
        console.warn('NaverMap init skipped:', e);
      }
    };

    // 이미 API가 로드돼 있으면 재주입하지 않고 바로 초기화 (SPA 네비게이션 대비)
    if (window.naver && window.naver.maps) {
      initMap();
      return;
    }
    // 스크립트가 이미 주입돼 있으면 로드 완료를 기다림 (중복 주입 방지 → 인증 실패 방지)
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src^="https://openapi.map.naver.com/openapi/v3/maps.js"]',
    );
    if (existing) {
      existing.addEventListener('load', initMap);
      return () => existing.removeEventListener('load', initMap);
    }
    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    script.addEventListener('load', initMap);
    document.head.appendChild(script);
  }, []);

  const handleReset = () => {
    const map = mapRef.current;
    if (map && window.naver) {
      map.setCenter(new window.naver.maps.LatLng(CENTER_LAT, CENTER_LNG));
      map.setZoom(DEFAULT_ZOOM);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '500px' }}>
      <div
        id="map"
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '12px',
        }}
      />
      <button
        type="button"
        onClick={handleReset}
        aria-label="원래 위치로 이동"
        title="원래 위치로"
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#fff4e2';
          e.currentTarget.style.borderColor = '#f2921d';
          e.currentTarget.style.transform = 'scale(1.08)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.28)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#fff';
          e.currentTarget.style.borderColor = '#e0e0e0';
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.2)';
        }}
        style={{
          position: 'absolute',
          right: '9px',
          bottom: `${btnBottom}px`,
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '40px',
          height: '40px',
          padding: 0,
          background: '#fff',
          border: '1px solid #e0e0e0',
          borderRadius: '50%',
          cursor: 'pointer',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
          transition: 'transform 0.15s ease, background-color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease',
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#f2921d" aria-hidden="true">
          <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" />
        </svg>
      </button>
    </div>
  );
};

export default NaverMap;
