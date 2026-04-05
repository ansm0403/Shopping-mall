'use client'

import React from 'react';
import Topbar from './topbar/Topbar';
import MainHeader from './mainHeader/MainHeader';
import CategoryBar from './categoryBar/CategoryBar';

export default function Header() {
  return (
    <div className="max-w-[1200px] mx-auto px-8 py-4">
      <Topbar />
      <MainHeader />
      <CategoryBar />
    </div>
  );
}
