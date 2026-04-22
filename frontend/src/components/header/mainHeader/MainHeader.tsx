'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import SearchBar from '@/components/common/SearchBar/SearchBar'
import CategorySelect from '@/components/common/SearchBar/CategorySelect'
import HomeCart from './HomeCart'

export default function MainHeader() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlKeyword = searchParams.get('keyword') ?? '';
  const urlCategoryParam = searchParams.get('categoryId');
  const parsedCategoryId = urlCategoryParam ? parseInt(urlCategoryParam, 10) : NaN;
  const urlCategoryId = Number.isInteger(parsedCategoryId) && parsedCategoryId > 0 ? parsedCategoryId : null;

  const [keyword, setKeyword] = useState(urlKeyword);
  const [categoryId, setCategoryId] = useState<number | null>(urlCategoryId);

  // 뒤로가기/앞으로가기로 URL이 바뀌면 헤더 UI 동기화
  useEffect(() => { setKeyword(urlKeyword); }, [urlKeyword]);
  useEffect(() => { setCategoryId(urlCategoryId); }, [urlCategoryId]);

  const handleSearch = () => {
    const trimmed = keyword.trim();
    if (trimmed === '') return;

    const params = new URLSearchParams();
    params.set('keyword', trimmed);
    if (categoryId !== null) {
      params.set('categoryId', categoryId.toString());
    }
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className='flex flex-row justify-between items-center bg-sky-300 w-full'>
      <div className='text-white text-lg text-center whitespace-nowrap min-w-[200px]'>E-COMMERS</div>
      <div className='flex flex-row'>
        <CategorySelect
          value={categoryId}
          onSelect={setCategoryId}
          className='text-gray-500'
        />
        <SearchBar
          value={keyword}
          onChange={setKeyword}
          onSubmit={handleSearch}
          placeholder='상품명을 검색해주세요.'
          className='border-[1px] border-gray-400 rounded-sm w-[600px] px-2 py-2 my-5'
        />
        <HomeCart />
      </div>
    </div>
  )
}
