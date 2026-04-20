'use client'

import SearchBar from '@/components/common/SearchBar/SearchBar'
import React, { useState } from 'react'
import HomeCart from './HomeCart';
import CategorySelect from '@/components/common/SearchBar/CategorySelect';

export default function MainHeader() {
  // @ts-expect-error 임시로 미사용 변수 허용
  const [ query, setQuery ] = useState("");
  // @ts-expect-error 임시로 미사용 변수 허용
  const [ category, setCategory ] = useState(""); 

  return (
    <div className = 'flex flex-row justify-between items-center bg-sky-300 w-full'>
      <div className='text-white text-lg text-center whitespace-nowrap min-w-[200px]'>E-COMMERS</div>
      <div className='flex flex-row'>
        <CategorySelect onSelect={setCategory} className='text-gray-500'/>
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
