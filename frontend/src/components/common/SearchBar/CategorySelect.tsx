'use client'

import React from 'react';
import { useCategories } from '@/hooks/useCategories';

interface CategoryBarProps {
  onSelect: (category: string) => void;
  className?: string;
}

export default function CategorySelect({ onSelect, className }: CategoryBarProps) {
  const { flat: flatCategories, isLoading, isError } = useCategories();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSelect(e.target.value);
  };

  return (
    <select
      onChange={handleChange}
      disabled={isLoading || isError}
      defaultValue=""
      className={`border-[1px] border-gray-400 rounded-sm px-2 py-2 my-5 bg-white text-sm ${className || ""}`}
    >
      {isError ? (
        <option value="">카테고리를 불러올 수 없습니다</option>
      ) : (
        <>
          <option value="">전체 카테고리</option>
          {flatCategories.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {'　'.repeat(cat.depth)}{cat.depth > 0 ? '└ ' : ''}{cat.name}
            </option>
          ))}
        </>
      )}
    </select>
  );
}
