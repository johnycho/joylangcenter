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
        zoomControl: true,
        zoomControlOptions: {
          position: window.naver.maps.Position.RIGHT_BOTTOM,
        },
        mapTypeControl: true,
        mapTypeControlOptions: {
          position: window.naver.maps.Position.TOP_RIGHT,
        },
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
              JD스퀘어 6층 (토이아울렛 건물)
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