import { Suspense } from 'react';
import MaxWidthContainer from '@/components/layout/MaxWidthContainer';
import ProductsClient from './ProductsClient';

export default function ProductsPage() {
  return (
    <MaxWidthContainer>
      <Suspense fallback={null}>
        <ProductsClient />
      </Suspense>
    </MaxWidthContainer>
  );
}
