'use client';

import { useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useProducts } from '@/hook/useProduct';
import { useCategories } from '@/hooks/useCategories';
import { PaginatedProducts } from '@/model/product';
import { SortBy, SortOrder } from '@/model/paginate-param';
import ProductCard, { ProductCardSkeleton } from '@/components/home/ProductCard';

const SORT_OPTIONS: { label: string; sortBy: SortBy; sortOrder: SortOrder }[] = [
  { label: '최신순', sortBy: 'createdAt', sortOrder: 'DESC' },
  { label: '인기순', sortBy: 'viewCount', sortOrder: 'DESC' },
  { label: '평점순', sortBy: 'rating', sortOrder: 'DESC' },
  { label: '낮은 가격순', sortBy: 'price', sortOrder: 'ASC' },
  { label: '높은 가격순', sortBy: 'price', sortOrder: 'DESC' },
];

const PAGE_SIZE = 20;
const SKELETON_COUNT = 20;

function Pagination({
  page,
  lastPage,
  onPageChange,
}: {
  page: number;
  lastPage: number;
  onPageChange: (p: number) => void;
}) {
  if (lastPage <= 1) return null;

  const pages = Array.from({ length: Math.min(lastPage, 5) }, (_, i) => {
    const start = Math.max(1, Math.min(page - 2, lastPage - 4));
    return start + i;
  });

  return (
    <div className="flex items-center justify-center gap-1 mt-10">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="px-3 py-2 rounded text-sm text-secondary-600 hover:bg-secondary-50 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        ‹
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`w-9 h-9 rounded text-sm font-medium transition-colors
            ${p === page
              ? 'bg-primary-600 text-white'
              : 'text-secondary-600 hover:bg-secondary-50'
            }`}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === lastPage}
        className="px-3 py-2 rounded text-sm text-secondary-600 hover:bg-secondary-50 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        ›
      </button>
    </div>
  );
}

export default function ProductsClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL에서 파라미터 읽기 — 비정상값(NaN, 유효하지 않은 enum) 방어
  const rawCategoryId = Number(searchParams.get('categoryId'));
  const categoryId =
    searchParams.get('categoryId') && Number.isInteger(rawCategoryId) && rawCategoryId > 0
      ? rawCategoryId
      : undefined;

  const VALID_SORT_BY: SortBy[] = ['id', 'createdAt', 'rating', 'price', 'viewCount'];
  const VALID_SORT_ORDER: SortOrder[] = ['ASC', 'DESC'];
  const rawSortBy = searchParams.get('sortBy') as SortBy;
  const rawSortOrder = searchParams.get('sortOrder') as SortOrder;
  const sortByParam: SortBy = VALID_SORT_BY.includes(rawSortBy) ? rawSortBy : 'createdAt';
  const sortOrderParam: SortOrder = VALID_SORT_ORDER.includes(rawSortOrder) ? rawSortOrder : 'DESC';

  const rawPage = Number(searchParams.get('page'));
  const pageParam = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;

  // 현재 활성 정렬 인덱스
  const activeSortIdx = SORT_OPTIONS.findIndex(
    (o) => o.sortBy === sortByParam && o.sortOrder === sortOrderParam
  );

  const { roots } = useCategories();

  const { data, isLoading, isError } = useProducts.Paginate({
    page: pageParam,
    limit: PAGE_SIZE,
    sortBy: sortByParam,
    sortOrder: sortOrderParam,
    categoryId,
  });

  const result = data?.data as PaginatedProducts | undefined;
  const products = result?.data ?? [];
  const meta = result?.meta;

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      // 파라미터 변경 시 page를 1로 초기화 (page 본인 변경 제외)
      if (!('page' in updates)) {
        params.set('page', '1');
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const handleCategoryClick = (id?: number) => {
    updateParams({ categoryId: id?.toString() });
  };

  const handleSortChange = (idx: number) => {
    const opt = SORT_OPTIONS[idx];
    updateParams({ sortBy: opt.sortBy, sortOrder: opt.sortOrder });
  };

  const handlePageChange = (p: number) => {
    updateParams({ page: p.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectedCategory = roots.find((c) => c.id === categoryId);

  return (
    <div className="py-8">
      {/* 페이지 제목 */}
      <h1 className="text-2xl font-bold text-secondary-900 mb-6">
        {selectedCategory ? selectedCategory.name : '전체 상품'}
      </h1>

      {/* 카테고리 필터 탭 */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 mb-6">
        <button
          onClick={() => handleCategoryClick(undefined)}
          className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-colors
            ${!categoryId
              ? 'bg-primary-600 text-white'
              : 'text-secondary-600 hover:text-primary-600 hover:bg-primary-50 border border-secondary-200'
            }`}
        >
          전체
        </button>
        {roots.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryClick(cat.id)}
            className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-colors
              ${categoryId === cat.id
                ? 'bg-primary-600 text-white'
                : 'text-secondary-600 hover:text-primary-600 hover:bg-primary-50 border border-secondary-200'
              }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* 정렬 + 결과 수 */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-secondary-500">
          {meta ? `총 ${meta.total.toLocaleString()}개` : ''}
        </p>
        <div className="flex gap-2">
          {SORT_OPTIONS.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleSortChange(idx)}
              className={`text-sm px-3 py-1.5 rounded transition-colors
                ${(activeSortIdx === -1 ? 0 : activeSortIdx) === idx
                  ? 'text-primary-600 font-semibold'
                  : 'text-secondary-500 hover:text-secondary-800'
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 상품 그리드 */}
      {isError ? (
        <div className="text-center py-20 text-secondary-400">
          상품을 불러오지 못했습니다.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {isLoading
              ? Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))
              : products.length === 0
                ? (
                  <div className="col-span-full text-center py-20 text-secondary-400">
                    상품이 없습니다.
                  </div>
                )
                : products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
          </div>

          {meta && (
            <Pagination
              page={meta.page}
              lastPage={meta.lastPage}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
}
