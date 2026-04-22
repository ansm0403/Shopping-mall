'use client'

import React from 'react'
import UserMenu from './UserMenu';
import { useRouter } from 'next/navigation';

export default function Topbar() {
  const router = useRouter();

  return (
    <div className="w-full bg-gray-900">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-8 flex items-center justify-between">
        <button
          className="text-xs text-gray-400 hover:text-indigo-400 transition-colors cursor-pointer select-none"
          onClick={() => router.push('/')}
        >
          🎉 신규 회원가입 시 10% 할인 쿠폰 증정
        </button>
        <UserMenu />
      </div>
    </div>
  )
}
