import React, { useEffect } from 'react';

const NaverMap = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src =
        'https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=0dphxly4jw';
    script.async = true;
    script.onload = () => {
      const map = new window.naver.maps.Map('map', {
        center: new window.naver.maps.LatLng(37.3304185, 127.930725), // 조이 언어발달센터
        zoom: 16,
      });

      new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(37.3304185, 127.930725),
        map,
      });
    };
    document.head.appendChild(script);
  }, []);

  return <div id="map" style={{ width: '100%', height: '400px', borderRadius: '12px' }} />;
};

export default NaverMap;