'use client';

import Link from 'next/link';
import { useCategories } from '@/hooks/useCategories';
import { CategoryTreeNode } from '@/service/category';
import { getCategoryIcon } from '@/lib/category-icon-map';

function CategoryItem({ category }: { category: CategoryTreeNode }) {
  return (
    <Link
      href={`/products?categoryId=${category.id}`}
      className="flex flex-col items-center gap-2 group min-w-[72px]"
    >
      <div className="w-14 h-14 rounded-full bg-primary-50 flex items-center justify-center
                      group-hover:bg-primary-100 transition-colors">
        <span className="text-2xl" aria-hidden>{getCategoryIcon(category.slug)}</span>
      </div>
      <span className="text-xs text-secondary-700 group-hover:text-primary-600 transition-colors text-center leading-tight">
        {category.name}
      </span>
    </Link>
  );
}

function CategoryItemSkeleton() {
  return (
    <div className="flex flex-col items-center gap-2 min-w-[72px] animate-pulse">
      <div className="w-14 h-14 rounded-full bg-secondary-100" />
      <div className="h-3 w-12 bg-secondary-100 rounded" />
    </div>
  );
}

export default function CategoryShortcuts() {
  const { roots, isLoading, isError } = useCategories();

  // 에러이거나 로드 완료 후 카테고리가 없으면 섹션 자체를 숨김
  if (!isLoading && (isError || roots.length === 0)) return null;

  return (
    <section className="py-6 border-b border-secondary-100">
      <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide pb-1">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => <CategoryItemSkeleton key={i} />)
          : roots.map((category) => (
              <CategoryItem key={category.id} category={category} />
            ))}
      </div>
    </section>
  );
}
