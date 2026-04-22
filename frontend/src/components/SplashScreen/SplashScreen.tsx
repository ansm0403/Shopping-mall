'use client';

import { useEffect, useState } from 'react';
import SplashContent from './SplashContent';

const SPLASH_KEY = 'shopping-mall-splash-shown';
const EXIT_DELAY = 1800;   // 이 시간(ms) 후 퇴장 애니메이션 시작
const UNMOUNT_DELAY = 2600; // 이 시간(ms) 후 컴포넌트 완전 제거

export default function SplashScreen() {
  const [shouldShow, setShouldShow] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // <head>의 inline script가 첫 방문 시 미리 설정해 둔 attribute를 확인
    const isActive =
      document.documentElement.getAttribute('data-splash') === 'active';

    if (!isActive) return; // 재방문 — 아무것도 하지 않음

    sessionStorage.setItem(SPLASH_KEY, '1');
    setShouldShow(true);

    const exitTimer = setTimeout(() => {
      setIsExiting(true);
      // 커튼이 열리는 시점에 attribute를 제거해 본문을 자연스럽게 노출
      document.documentElement.removeAttribute('data-splash');
    }, EXIT_DELAY);

    const unmountTimer = setTimeout(() => setShouldShow(false), UNMOUNT_DELAY);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(unmountTimer);
      // 도중 언마운트 시에도 본문이 영구적으로 숨겨지지 않도록 보장
      document.documentElement.removeAttribute('data-splash');
    };
  }, []);

  if (!shouldShow) return null;

  return (
    <div
      className={`splash-container${isExiting ? ' splash-exiting' : ''}`}
      aria-hidden="true"
    >
      {/* 커튼 상단 패널 */}
      <div className="splash-panel-top" />

      {/* 커튼 하단 패널 */}
      <div className="splash-panel-bottom" />

      {/* 중앙 콘텐츠 — SplashContent.tsx를 교체해서 내용 변경 */}
      <div className="splash-content">
        <SplashContent />
      </div>
    </div>
  );
}
