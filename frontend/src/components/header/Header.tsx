'use client'

import React, { Suspense } from 'react';
import Topbar from './topbar/Topbar';
import MainHeader from './mainHeader/MainHeader';
import Category from './navbar/Category';
import CategoryBar from './navbar/CategoryBar';


export default function Header() {
  return (
    <div className="relative z-header max-w-[1200px] mx-auto px-8 pt-4 flex flex-col gap-3">
      <Topbar />
      <div>
        <Suspense fallback={<div className="h-16 w-full bg-sky-300" />}>
          <MainHeader />
        </Suspense>
        <div className='flex flex-row'>
          <Category />
          <CategoryBar />
        </div>
      </div>
    </div>
  );
}
