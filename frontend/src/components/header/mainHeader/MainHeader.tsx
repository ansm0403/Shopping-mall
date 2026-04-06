'use client'

import SearchBar from '@/components/common/SearchBar/SearchBar'
import React, { useState } from 'react'
import HomeCart from './HomeCart';
import CategoryBar from '@/components/common/SearchBar/CategoryBar';

export default function MainHeader() {
  const [ query, setQuery ] = useState("");
  const [ category, setCategory ] = useState(""); 

  return (
    <div className = 'flex flex-row justify-between items-center bg-sky-300 min-w-[1000px]'>
      <div className='text-white text-lg text-center whitespace-nowrap'>E-COMMERS</div>
      <div className='flex flex-row'>
        <CategoryBar onSelect={setCategory} className='text-gray-500'/>
        <SearchBar 
          onSearch={setQuery}
          className='border-[1px] border-gray-400 rounded-sm w-[600px] px-2 py-2 my-5 mr-10'
          placeholder='상품명을 검색해주세요.'
        />
        <HomeCart />
      </div>
    </div>
  )
}
