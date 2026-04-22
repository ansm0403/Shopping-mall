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
    <div className="flex items-center gap-4 sm:gap-6 py-4">
      {/* 로고 */}
      <button
        className="font-black text-xl sm:text-2xl tracking-tighter cursor-pointer select-none text-gray-900 hover:text-indigo-600 transition-colors shrink-0"
        onClick={() => router.push('/')}
      >
        SHOP<span className="text-indigo-600">MALL</span>
      </button>

      {/* 통합 검색 영역 */}
      <div className="flex flex-1 items-stretch h-11 border-2 border-gray-200 rounded-full overflow-hidden hover:border-indigo-300 focus-within:border-indigo-500 transition-colors">
        {/* 카테고리 선택 */}
        <div className="hidden sm:flex items-stretch shrink-0 border-r border-gray-200">
          <CategorySelect
            value={categoryId}
            onSelect={setCategoryId}
            className="h-full px-4 bg-transparent text-gray-600 focus:outline-none cursor-pointer border-0"
          />
        </div>

        {/* 검색 입력창 (내부 버튼 숨김) */}
        <SearchBar
          value={keyword}
          onChange={setKeyword}
          onSubmit={handleSearch}
          placeholder="상품명을 검색해주세요."
          className="w-full px-4 bg-transparent border-0 focus:outline-none text-sm text-gray-800 placeholder:text-gray-400"
          hideButton
        />

        {/* 검색 버튼 — 단 1개 */}
        <button
          onClick={handleSearch}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white px-5 shrink-0 transition-colors"
          aria-label="검색"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
          <span className="text-sm font-medium hidden sm:block">검색</span>
        </button>
      </div>

      {/* 장바구니 */}
      <HomeCart />
    </div>
  )
}
