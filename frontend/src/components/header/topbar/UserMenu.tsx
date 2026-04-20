'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LogIn from './LogIn';

export default function UserMenu() {
  const { user, isHydrated, logout } = useAuth();
  const router = useRouter();
  const [click, setClick] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogout = async () => {
    await logout();
    setShowConfirm(false);
    setClick(false);
  };

  if (!isHydrated) return null;
  if (!user) return <LogIn />;

  const items: { label: string; onClick: () => void }[] = [
    { label: "내 정보", onClick: () => void 0 },
    { label: "주문 목록", onClick: () => router.push('/my/orders') },
    { label: "장바구니", onClick: () => router.push('/cart') },
    { label: "로그아웃", onClick: () => setShowConfirm(true) },
  ];

  return (
    <>
      <div className="relative">
        <div
          onClick={() => setClick(!click)}
          className="text-gray-500 text-[0.9rem] cursor-pointer select-none"
        >
          {user.nickName + "님"} {click ? "▲" : "▼"}
        </div>

        <div
          className={`
            absolute z-[500] top-8 w-full text-[0.9rem]
            border-white border-[0.5px] bg-sky-300 text-white
            grid transition-all duration-300
            ${click ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}
          `}
          style={{
            transitionTimingFunction: click
              ? "cubic-bezier(0, 0, 0.2, 1)"
              : "cubic-bezier(0.4, 0, 1, 1)",
          }}
        >
          <div className="overflow-hidden">
            {items.map((item, i) => (
              <div
                key={item.label}
                className="pl-2 py-2 hover:bg-sky-700 transition-colors duration-200 cursor-pointer"
                style={{
                  transitionProperty: "opacity, transform",
                  transitionDuration: "200ms",
                  transitionTimingFunction: "ease-out",
                  transitionDelay: click ? `${i * 60}ms` : "0ms",
                  opacity: click ? 1 : 0,
                  transform: click ? "translateY(0)" : "translateY(-6px)",
                }}
                onClick={item.onClick}
              >
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 로그아웃 확인 팝업 */}
      {showConfirm && (
        <div className="fixed inset-0 z-[1000] flex items-end justify-center pb-10 pointer-events-none">
          <div className="pointer-events-auto bg-white rounded-xl shadow-lg px-6 py-4 flex flex-col items-center gap-3 border border-gray-200 animate-slide-up">
            <p className="text-gray-800 text-sm font-medium">로그아웃 하시겠습니까?</p>
            <div className="flex gap-3">
              <button
                onClick={handleLogout}
                className="px-4 py-1.5 bg-sky-400 text-white text-sm rounded-lg hover:bg-sky-500 transition-colors"
              >
                로그아웃
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
