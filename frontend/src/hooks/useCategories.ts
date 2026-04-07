'use client'

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { categoryQueryOptions } from '@/lib/react-query/category-query-options';
import type { CategoryTreeNode } from '@/service/category';

function flattenTree(nodes: CategoryTreeNode[], result: CategoryTreeNode[] = []): CategoryTreeNode[] {
  for (const node of nodes) {
    result.push(node);
    if (node.children.length > 0) {
      flattenTree(node.children, result);
    }
  }
  return result;
}

export function useCategories() {
  const { data: tree = [], isLoading, isError } = useQuery(categoryQueryOptions.tree());

  // tree()는 이미 최상위(roots)만 반환하므로 그대로 roots로 사용
  const roots = tree;

  // flat 목록 — CategorySelect용
  const flat = useMemo(() => flattenTree(tree), [tree]);

  return { tree, roots, flat, isLoading, isError };
}
