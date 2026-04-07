'use client';

import { useState } from 'react';
import { Product } from '@/model/product';
import ProductGallery from './ProductGallery';
import ProductInfo from './ProductInfo';
import ProductTabs from './ProductTabs';
import RelatedProducts from './RelatedProducts';

interface ProductDetailClientProps {
  product: Product;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  return (
    <div className="min-h-screen bg-white">
      {/* 메인 섹션 */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-12">
        {/* 갤러리 + 정보 2단 레이아웃 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-8 md:mb-12">
          {/* 좌측: 갤러리 (2/3) */}
          <div className="md:col-span-2">
            <ProductGallery images={product.images} />
          </div>

          {/* 우측: 상품 정보 (1/3) */}
          <div>
            <ProductInfo
              product={product}
              quantity={quantity}
              onQuantityChange={setQuantity}
            />
          </div>
        </div>

        {/* 탭 섹션 */}
        <ProductTabs
          product={product}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>

      {/* 관련 상품 */}
      <RelatedProducts categoryId={product.categoryId} currentProductId={product.id} />
    </div>
  );
}
