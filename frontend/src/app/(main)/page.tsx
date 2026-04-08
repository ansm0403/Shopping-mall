import MaxWidthContainer from '@/components/layout/MaxWidthContainer';
import Banner from '@/components/banner/Banner';
import CategoryShortcuts from '@/components/home/CategoryShortcuts';
import ProductSection from '@/components/home/ProductSection';
import CategoryTabSection from '@/components/home/CategoryTabSection';

export default function Index() {
  return (
    <>
      {/* 배너 - 배경 100% 너비, 내용 1200px */}
      <Banner />

      <MaxWidthContainer>
        {/* 카테고리 퀵 링크 */}
        <CategoryShortcuts />

        {/* 인기 상품 */}
        <ProductSection
          title="🔥 인기 상품"
          description="가장 많이 본 상품들이에요"
          href="/products?sortBy=viewCount&sortOrder=DESC"
          sortBy="viewCount"
          sortOrder="DESC"
          count={8}
        />

        {/* 신상품 */}
        <ProductSection
          title="✨ 신상품"
          description="새로 들어온 상품들이에요"
          href="/products?sortBy=createdAt&sortOrder=DESC"
          sortBy="createdAt"
          sortOrder="DESC"
          count={8}
        />

        {/* 평점순 */}
        <ProductSection
          title="⭐ 평점 높은 상품"
          description="구매자들이 극찬한 상품이에요"
          href="/products?sortBy=rating&sortOrder=DESC"
          sortBy="rating"
          sortOrder="DESC"
          count={8}
        />

        {/* 카테고리별 인기 상품 탭 */}
        <CategoryTabSection />
      </MaxWidthContainer>
    </>
  );
}
