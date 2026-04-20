import { Suspense } from 'react';
import CheckoutCompleteContent from './CheckoutCompleteContent';

function LoadingFallback() {
  return (
    <div className="py-20 text-center">
      <div className="inline-block w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
    </div>
  );
}

export default function CheckoutCompletePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CheckoutCompleteContent />
    </Suspense>
  );
}
