'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import { NavbarButton } from './NavbarButton';
import { useCategories } from '@/hooks/useCategories';

// 로딩 중 레이아웃 시프트를 방지하는 플레이스홀더 버튼 수
const SKELETON_COUNT = 6;

export default function CategoryBar() {
  const router = useRouter();
  const { roots, isLoading, isError } = useCategories();

  return (
    <nav className="flex items-center">
      <NavbarButton onClick={() => router.push('/')}>
        HOME
      </NavbarButton>

      {isLoading && Array.from({ length: SKELETON_COUNT }).map((_, i) => (
        <NavbarButton key={i} disabled className="opacity-40 animate-pulse w-16" />
      ))}

      {!isLoading && !isError && roots.map((category) => (
        <NavbarButton
          key={category.id}
          onClick={() => router.push(`/products?category=${encodeURIComponent(category.slug)}`)}
        >
          {category.name}
        </NavbarButton>
      ))}

      {isError && (
        <span className="px-4 py-2 text-sm text-red-500">카테고리를 불러올 수 없습니다.</span>
      )}
    </nav>
  );
}
