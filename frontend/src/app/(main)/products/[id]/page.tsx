'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { productsQueryOptions } from '@/lib/react-query/products-query-options';
import ProductDetailClient from './ProductDetailClient';
import { Skeleton } from '@/components/common/Skeleton/Skeleton';

export default function ProductDetailPage() {
  const params = useParams();
  const id = parseInt(params.id as string);

  const { data, isLoading, isError, error } = useQuery(productsQueryOptions.detail(id));

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (isError || !data?.data) {
    return (
      <div className="max-w-[1200px] mx-auto px-8 py-20 text-center">
        <h1 className="text-2xl font-bold text-secondary-900 mb-4">상품을 찾을 수 없습니다</h1>
        <p className="text-secondary-500">{error instanceof Error ? error.message : '상품 조회에 실패했습니다'}</p>
      </div>
    );
  }

  return <ProductDetailClient product={data.data} />;
}

function ProductDetailSkeleton() {
  return (
    <div className="max-w-[1200px] mx-auto px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {/* 갤러리 스켈레톤 */}
        <div className="md:col-span-2">
          <Skeleton className="w-full aspect-square rounded-lg mb-4" />
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="w-full aspect-square rounded" />
            ))}
          </div>
        </div>

        {/* 정보 섹션 스켈레톤 */}
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-10 w-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-3/4" />
          </div>
          <Skeleton className="h-12 w-full" />
        </div>
      </div>

      {/* 탭 스켈레톤 */}
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}
