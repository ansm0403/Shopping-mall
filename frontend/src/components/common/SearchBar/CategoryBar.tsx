'use client'

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { categoryQueryOptions } from '@/lib/react-query/category-query-options';
import type { CategoryTreeNode } from '@/service/category';

interface CategoryBarProps {
  onSelect: (category: string) => void;
  className?: string;
}

/** 트리 구조를 flat한 옵션 목록으로 변환 (depth에 따라 들여쓰기) */
function flattenTree(nodes: CategoryTreeNode[], result: CategoryTreeNode[] = []): CategoryTreeNode[] {
  for (const node of nodes) {
    result.push(node);
    if (node.children.length > 0) {
      flattenTree(node.children, result);
    }
  }
  return result;
}

export default function CategoryBar({ onSelect, className }: CategoryBarProps) {
  const { data, isLoading } = useQuery(categoryQueryOptions.tree());

  const flatCategories = data?.data ? flattenTree(data.data) : [];

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSelect(e.target.value);
  };

  return (
    <select
      onChange={handleChange}
      disabled={isLoading}
      defaultValue=""
      className={`border-[1px] border-gray-400 rounded-sm px-2 py-2 my-5 bg-white text-sm ${className || ""}`}
    >
      <option value="">전체 카테고리</option>
      {flatCategories.map((cat) => (
        <option key={cat.id} value={cat.slug}>
          {'　'.repeat(cat.depth)}{cat.depth > 0 ? '└ ' : ''}{cat.name}
        </option>
      ))}
    </select>
  );
}
