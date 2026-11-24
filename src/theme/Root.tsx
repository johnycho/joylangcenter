import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import PromoPopup from '@site/src/components/PromoPopup';

// 전 페이지 공통 래퍼 — 홍보 팝업을 띄운다(클라이언트 전용)
export default function Root({children}: {children: React.ReactNode}) {
  return (
    <>
      {children}
      <BrowserOnly>{() => <PromoPopup />}</BrowserOnly>
    </>
  );
}
