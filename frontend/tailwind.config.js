/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5', // main
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        secondary: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b', // main
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
      },
      keyframes: {
        fadeInScale: {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fadeInScale': 'fadeInScale 0.15s ease-out',
      },
      // z-index 레이어 체계 — 숫자 대신 의미 있는 이름으로 관리
      // 레이어 간격을 10씩 두어 중간에 추가할 여지를 남김
      zIndex: {
        'base':       '0',    // 기본 컨텐츠
        'raised':     '10',   // 살짝 띄워야 하는 요소 (카드 hover 등)
        'banner':     '20',   // 배너 내부 요소 (오버레이, CTA 버튼)
        'header':     '30',   // 헤더 자체
        'dropdown':   '40',   // 드롭다운, 팝오버
        'sticky':     '50',   // sticky 헤더/사이드바
        'modal-bg':   '60',   // 모달 배경 딤처리
        'modal':      '70',   // 모달 본체
        'toast':      '80',   // 토스트 알림
      },
    },
  },
  plugins: [],
};
