import React, { useEffect } from 'react';

const NaverMap = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://openapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=0dphxly4jw';
    script.async = true;

    script.onload = () => {
      const centerLat = 37.375124;
      const centerLng = 127.874845;

      const map = new window.naver.maps.Map('map', {
        center: new window.naver.maps.LatLng(centerLat, centerLng),
        zoom: 16,
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

      // 원위치(처음 위치로 되돌리기) 버튼
      const resetControlHtml = `
        <button type="button" aria-label="원래 위치로 이동"
          style="display:flex;align-items:center;gap:4px;margin:10px;padding:7px 11px;
                 background:#fff;border:1px solid #e0e0e0;border-radius:8px;cursor:pointer;
                 font-size:13px;font-weight:700;color:#444;
                 box-shadow:0 2px 6px rgba(0,0,0,0.15);">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="#f2921d"><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg>
          원위치
        </button>`;
      const resetControl = new window.naver.maps.CustomControl(resetControlHtml, {
        position: window.naver.maps.Position.TOP_LEFT,
      });
      resetControl.setMap(map);
      window.naver.maps.Event.addDOMListener(resetControl.getElement(), 'click', () => {
        map.setCenter(new window.naver.maps.LatLng(centerLat, centerLng));
        map.setZoom(16);
      });

      // 마커 생성
      const marker = new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(centerLat, centerLng),
        map,
        title: '조이 언어발달센터',
      });

      // 마커 클릭 시 네이버 지도 링크로 이동
      window.naver.maps.Event.addListener(marker, 'click', () => {
        window.open('https://naver.me/5Vm9WYYy', '_blank');
      });

      // 인포 윈도우 생성
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

      // 마커 위에 인포 윈도우 열기
      infoWindow.open(map, marker);
    };

    document.head.appendChild(script);
  }, []);

  return (
      <div
          id="map"
          style={{
            width: '100%',
            height: '500px',
            borderRadius: '12px',
          }}
      />
  );
};

export default NaverMap;