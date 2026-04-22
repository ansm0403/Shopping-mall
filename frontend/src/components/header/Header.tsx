'use client'

import React, { Suspense } from 'react';
import Topbar from './topbar/Topbar';
import MainHeader from './mainHeader/MainHeader';
import Category from './navbar/Category';
import CategoryBar from './navbar/CategoryBar';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
      <Topbar />
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        <Suspense fallback={<div className="h-16 w-full animate-pulse bg-gray-100 rounded-full my-4" />}>
          <MainHeader />
        </Suspense>
        <div className="flex items-center border-t border-gray-100">
          <Category />
          <CategoryBar />
        </div>
      </div>
    </header>
  );
}
