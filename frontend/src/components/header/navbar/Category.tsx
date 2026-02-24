'use client'

import React, { useState, useRef, useEffect } from 'react';
import * as SharedModule from '@shopping-mall/shared';
import styled from '@emotion/styled';
import { NavbarButton } from './NavbarButton';
import { gsap } from 'gsap';
const { CATEGORIES } = SharedModule;
type CategoryType = SharedModule.Category

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
      // 초기 상태 설정 - 오른쪽에서 왼쪽으로
      gsap.set(categoryItemsRef.current, {
        opacity: 0,
        x: 30,
      });

      // 순차적으로 나타나는 애니메이션 (위에서 아래 순서로)
      gsap.to(categoryItemsRef.current, {
        opacity: 1,
        x: 0,
        duration: 0.4,
        stagger: 0.08, // 각 아이템 사이의 시간 간격
        ease: 'power2.out',
      });
    }
  }, [isDropdownVisible]);

  // 서브카테고리 드롭다운 애니메이션
  useEffect(() => {
    if (hoveredCategory) {
      // 초기 상태 설정 - 오른쪽에서 왼쪽으로
      gsap.set(subcategoryItemsRef.current, {
        opacity: 0,
        x: 30,
      });

      // 순차적으로 나타나는 애니메이션 (위에서 아래 순서로)
      gsap.to(subcategoryItemsRef.current, {
        opacity: 1,
        x: 0,
        duration: 0.4,
        stagger: 0.08,
        ease: 'power2.out',
      });
    }
  }, [hoveredCategory]);

  const handleMouseEnter = () => {
    setIsDropdownVisible(true);
  };

  const handleMouseLeave = () => {
    setIsDropdownVisible(false);
    setHoveredCategory(null);
  };

  return (
    <Wrapper
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <NavbarButton>
        카테고리
      </NavbarButton>

      <CategoryDropdown $isVisible={isDropdownVisible}>
        {CATEGORIES.map((category, index) => (
          <CategoryItem
            key={category.key}
            ref={(el) => {
              categoryItemsRef.current[index] = el;
            }}
            onMouseEnter={() => setHoveredCategory(category.key)}
            onClick={() => handleCategoryClick(category.key)}
          >
            {category.label}

            {hoveredCategory === category.key && category.subcategories && (
              <SubcategoryDropdown>
                {category.subcategories.map((subcategory, subIndex) => (
                  <SubcategoryItem
                    key={subcategory.key}
                    ref={(el) => {
                      subcategoryItemsRef.current[subIndex] = el;
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCategoryClick(category.key, subcategory.key);
                    }}
                  >
                    {subcategory.label}
                  </SubcategoryItem>
                ))}
              </SubcategoryDropdown>
            )}
          </CategoryItem>
        ))}
      </CategoryDropdown>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  position: relative;
`;

const CategoryDropdown = styled.div<{ $isVisible: boolean }>`
  display: ${props => props.$isVisible ? 'flex' : 'none'};
  flex-direction: column;
  position: absolute;
  top: calc(100%);
  left: 0;
  min-width: 120px;
  z-index: 50;
  background: transparent;
  padding-top: 0.25rem;

  /* 버튼과 메뉴 사이 투명한 브릿지 */
`;

const CategoryItem = styled.div`
  color: gray;
  position: relative;
  padding: 0.75rem 1rem;
  cursor: pointer;
  background: white;
  border-left: 1px solid #e5e7eb;
  border-right: 1px solid #e5e7eb;
  box-shadow: -2px 0 6px -1px rgba(0, 0, 0, 0.1), 2px 0 6px -1px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: #f3f4f6;
    color: black;
    font-weight: bold;
  }

  &:first-of-type {
    border-top: 1px solid #e5e7eb;
    border-radius: 0.375rem 0.375rem 0 0;
    box-shadow: 0 -2px 6px -1px rgba(0, 0, 0, 0.1), -2px 0 6px -1px rgba(0, 0, 0, 0.1), 2px 0 6px -1px rgba(0, 0, 0, 0.1);
  }

  &:last-of-type {
    border-bottom: 1px solid #e5e7eb;
    border-radius: 0 0 0.375rem 0.375rem;
    box-shadow: -2px 0 6px -1px rgba(0, 0, 0, 0.1), 2px 0 6px -1px rgba(0, 0, 0, 0.1), 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  &:not(:last-of-type) {
    border-bottom: 1px solid #e5e7eb;
  }
`;

const SubcategoryDropdown = styled.div`
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 0;
  left: calc(100%);
  min-width: 120px;
  z-index: 51;
  background: transparent;
  padding-left: 0.25rem;

  /* 카테고리와 서브카테고리 사이 투명한 브릿지 */
`;

const SubcategoryItem = styled.div`
  color: gray;
  padding: 0.75rem 1rem;
  cursor: pointer;
  white-space: nowrap;
  background: white;
  border-left: 1px solid #e5e7eb;
  border-right: 1px solid #e5e7eb;
  box-shadow: -2px 0 6px -1px rgba(0, 0, 0, 0.1), 2px 0 6px -1px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: #f3f4f6;
    color: black;
    font-weight: bold;
  }

  &:first-of-type {
    border-top: 1px solid #e5e7eb;
    border-radius: 0.375rem 0.375rem 0 0;
    box-shadow: 0 -2px 6px -1px rgba(0, 0, 0, 0.1), -2px 0 6px -1px rgba(0, 0, 0, 0.1), 2px 0 6px -1px rgba(0, 0, 0, 0.1);
  }

  &:last-of-type {
    border-bottom: 1px solid #e5e7eb;
    border-radius: 0 0 0.375rem 0.375rem;
    box-shadow: -2px 0 6px -1px rgba(0, 0, 0, 0.1), 2px 0 6px -1px rgba(0, 0, 0, 0.1), 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  &:not(:last-of-type) {
    border-bottom: 1px solid #e5e7eb;
  }
`;
