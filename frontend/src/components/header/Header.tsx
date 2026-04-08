'use client'

import React from 'react';
import Topbar from './topbar/Topbar';
import MainHeader from './mainHeader/MainHeader';
import Category from './navbar/Category';
import CategoryBar from './navbar/CategoryBar';


export default function Header() {
  return (
    <div className="relative z-header max-w-[1200px] mx-auto px-8 pt-4 flex flex-col gap-3">
      <Topbar />
      <div>
        <MainHeader />
        <div className='flex flex-row'>
          <Category />
          <CategoryBar />
        </div>
      </div>
    </div>
  );
}
