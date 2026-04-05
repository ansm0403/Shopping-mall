'use client'

import React, { useState, useRef, useEffect } from 'react';
import * as SharedModule from '@shopping-mall/shared';
import { clsx } from 'clsx';
import { NavbarButton } from './NavbarButton';
import { gsap } from 'gsap';

const { CATEGORIES } = SharedModule;
type CategoryType = SharedModule.Category

// 드롭다운 아이템 공통 클래스
const ITEM_BASE = 'text-secondary-500 relative py-3 px-4 cursor-pointer bg-white border-l border-r border-b border-secondary-200 hover:bg-secondary-100 hover:text-secondary-900 hover:font-bold';
const ITEM_SHADOW_DEFAULT = 'shadow-[-2px_0_6px_-1px_rgba(0,0,0,0.1),2px_0_6px_-1px_rgba(0,0,0,0.1)]';
const ITEM_SHADOW_FIRST   = 'shadow-[0_-2px_6px_-1px_rgba(0,0,0,0.1),-2px_0_6px_-1px_rgba(0,0,0,0.1),2px_0_6px_-1px_rgba(0,0,0,0.1)]';
const ITEM_SHADOW_LAST    = 'shadow-[-2px_0_6px_-1px_rgba(0,0,0,0.1),2px_0_6px_-1px_rgba(0,0,0,0.1),0_4px_6px_-1px_rgba(0,0,0,0.1)]';

function itemClass(index: number, total: number) {
  const isFirst = index === 0;
  const isLast  = index === total - 1;
  return clsx(
    ITEM_BASE,
    isFirst && 'border-t rounded-t-md ' + ITEM_SHADOW_FIRST,
    isLast  && 'rounded-b-md ' + ITEM_SHADOW_LAST,
    !isFirst && !isLast && ITEM_SHADOW_DEFAULT,
  );
}

export default function Category() {
  const [hoveredCategory, setHoveredCategory] = useState<CategoryType | null>(null);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const categoryItemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const subcategoryItemsRef = useRef<(HTMLDivElement | null)[]>([]);

  const handleCategoryClick = (category: CategoryType, subcategory?: string) => {
    console.log('Selected:', { category, subcategory });
    // TODO: 카테고리 선택 로직 구현 (예: 라우팅)
  };

  // 메인 카테고리 드롭다운 애니메이션
  useEffect(() => {
    if (isDropdownVisible) {
      gsap.set(categoryItemsRef.current, { opacity: 0, x: 30 });
      gsap.to(categoryItemsRef.current, {
        opacity: 1,
        x: 0,
        duration: 0.4,
        stagger: 0.08,
        ease: 'power2.out',
      });
    }
  }, [isDropdownVisible]);

  // 서브카테고리 드롭다운 애니메이션
  useEffect(() => {
    if (hoveredCategory) {
      gsap.set(subcategoryItemsRef.current, { opacity: 0, x: 30 });
      gsap.to(subcategoryItemsRef.current, {
        opacity: 1,
        x: 0,
        duration: 0.4,
        stagger: 0.08,
        ease: 'power2.out',
      });
    }
  }, [hoveredCategory]);

  const subcategories = hoveredCategory
    ? CATEGORIES.find((c) => c.key === hoveredCategory)?.subcategories ?? []
    : [];

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsDropdownVisible(true)}
      onMouseLeave={() => { setIsDropdownVisible(false); setHoveredCategory(null); }}
    >
      <NavbarButton>카테고리</NavbarButton>

      {/* 메인 카테고리 드롭다운 */}
      <div
        className={clsx(
          'flex-col absolute top-full left-0 min-w-[120px] z-50 bg-transparent pt-1',
          isDropdownVisible ? 'flex' : 'hidden'
        )}
      >
        {CATEGORIES.map((category, index) => (
          <div
            key={category.key}
            ref={(el) => { categoryItemsRef.current[index] = el; }}
            className={itemClass(index, CATEGORIES.length)}
            onMouseEnter={() => setHoveredCategory(category.key)}
            onClick={() => handleCategoryClick(category.key)}
          >
            {category.label}

            {/* 서브카테고리 드롭다운 */}
            {hoveredCategory === category.key && category.subcategories && (
              <div className="flex flex-col absolute top-0 left-full min-w-[120px] z-[51] bg-transparent pl-1">
                {subcategories.map((subcategory, subIndex) => (
                  <div
                    key={subcategory.key}
                    ref={(el) => { subcategoryItemsRef.current[subIndex] = el; }}
                    className={clsx(itemClass(subIndex, subcategories.length), 'whitespace-nowrap')}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCategoryClick(category.key, subcategory.key);
                    }}
                  >
                    {subcategory.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
