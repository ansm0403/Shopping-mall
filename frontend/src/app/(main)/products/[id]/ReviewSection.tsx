'use client';

import { Product } from '@/model/product';

interface ReviewSectionProps {
  product: Product;
}

function renderStars(rating: number) {
  return (
    <span className="text-yellow-400">
      {'★'.repeat(Math.min(Math.round(rating), 5))}
      {'☆'.repeat(Math.max(0, 5 - Math.min(Math.round(rating), 5)))}
    </span>
  );
}

export default function ReviewSection({ product }: ReviewSectionProps) {
  // ① 백엔드 decimal 타입이 JSON 직렬화 시 문자열로 오는 경우 대비해 Number()로 변환
  const rating = Number(product.rating ?? 0);
  const reviewCount = product.reviewCount ?? 0;

  // 평점 분포 (예시 데이터)
  const ratingDistribution = {
    5: 45,
    4: 25,
    3: 15,
    2: 10,
    1: 5,
  };

  const totalReviews = Object.values(ratingDistribution).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-8">
      {/* 평점 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 평점 대시보드 */}
        <div className="md:col-span-1 bg-secondary-50 rounded-lg p-6 text-center">
          <p className="text-4xl font-bold text-secondary-900 mb-2">
            {rating.toFixed(1)}
          </p>
          <div className="flex justify-center mb-2">
            {renderStars(rating)}
          </div>
          <p className="text-sm text-secondary-600">
            {reviewCount}개의 리뷰
          </p>
        </div>

        {/* 평점 분포 */}
        <div className="md:col-span-2 space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = ratingDistribution[star as keyof typeof ratingDistribution];
            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

            return (
              <div key={star} className="flex items-center gap-3">
                <span className="text-yellow-400 text-sm min-w-[30px]">
                  {'★'.repeat(star)}
                </span>
                <div className="flex-1 bg-secondary-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-primary-600 h-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-secondary-600 min-w-[40px] text-right">
                  {count}개
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 리뷰 목록 (향후 추가) */}
      <div className="border-t pt-8">
        <h3 className="text-lg font-bold text-secondary-900 mb-6">
          고객 리뷰
        </h3>
        <div className="text-center py-12 text-secondary-500">
          <p>이 상품의 리뷰가 아직 없습니다.</p>
          <p className="text-sm mt-2">구매 후 첫 리뷰를 작성해주세요!</p>
        </div>
      </div>
    </div>
  );
}
