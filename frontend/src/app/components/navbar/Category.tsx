'use client'

import React, { useState } from 'react';
import { CATEGORIES, type Category as CategoryType } from '@shopping-mall/shared';
import styled from '@emotion/styled';

export default function Category() {
  const [isOpen, setIsOpen] = useState(false);

  const handleCategoryClick = (category: CategoryType) => {
    console.log('Selected category:', category);
    // TODO: 카테고리 선택 로직 구현
    setIsOpen(false);
  };

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
      >
        카테고리
      </button>

      {isOpen && (
        <div 
        // className="absolute top-full left-0 mt-1 bg-white border rounded shadow-lg min-w-[120px] z-50"
        >
          {CATEGORIES.map((category) => (
            <div
              key={category.key}
              onClick={() => handleCategoryClick(category.key)}
              // className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              {category.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

