'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function UserMenu() {
  const { user, isHydrated } = useAuth();
  const [click, setClick] = useState(false);

  if (!isHydrated) return null;
  if (user) return <div>logout</div>;

  const items = ["내 정보", "장바구니", "로그아웃"];

  return (
    <div className="relative">
      <div
        onClick={() => setClick(!click)}
        className="text-gray-500 text-[0.9rem] cursor-pointer select-none"
      >
        My account {click ? "▲" : "▼"}
      </div>

      {/* max-height 대신 실제 height 제어 또는 grid 트릭 사용 */}
      <div
        className={`
          absolute z-[500] top-8 w-full text-[0.9rem]
          border-white border-[0.5px] bg-sky-300 text-white
          grid transition-all duration-300
          ${click ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}
        `}
        style={{
          // 열릴 때 ease-out, 닫힐 때 ease-in
          transitionTimingFunction: click
            ? "cubic-bezier(0, 0, 0.2, 1)"
            : "cubic-bezier(0.4, 0, 1, 1)",
        }}
      >
        {/* grid 트릭: 내부 div에 overflow-hidden */}
        <div className="overflow-hidden">
          {items.map((item, i) => (
            <div
              key={item}
              className="pl-2 py-2 hover:bg-sky-700 transition-colors duration-200 cursor-pointer"
              style={{
                // transition shorthand 제거, 개별 속성으로 분리
                transitionProperty: "opacity, transform",
                transitionDuration: "200ms",
                transitionTimingFunction: "ease-out",
                transitionDelay: click ? `${i * 60}ms` : "0ms",
                opacity: click ? 1 : 0,
                transform: click ? "translateY(0)" : "translateY(-6px)",
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
