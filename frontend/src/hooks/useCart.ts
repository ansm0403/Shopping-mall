'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { addCartItem } from '@/service/cart';
import { authStorage } from '@/service/auth-storage';

/**
 * 장바구니 추가 mutation hook
 *
 * 사용법:
 *   const addToCart = useAddToCart();
 *   addToCart.mutate({ productId: 1, quantity: 2 });
 *
 * 상태:
 *   addToCart.isPending  → API 요청 중 (버튼 비활성화용)
 *   addToCart.isSuccess  → 성공 (버튼 피드백용)
 *   addToCart.isError    → 실패
 */
export function useAddToCart() {
  const router = useRouter();

  return useMutation({
    mutationFn: ({ productId, quantity }: { productId: number; quantity: number }) =>
      addCartItem(productId, quantity),

    onMutate: () => {
      // 요청 직전: 로그인 상태 확인
      // 토큰이 없으면 에러를 throw → mutationFn이 실행되지 않고 onError로 감
      if (!authStorage.getAccessToken()) {
        router.push('/login');
        throw new Error('로그인이 필요합니다.');
      }
    },

    onError: (error: any) => {
      // 로그인 체크 에러는 이미 redirect 처리했으므로 메시지 생략
      if (error?.message === '로그인이 필요합니다.') return;

      // 백엔드 에러 메시지 (재고 부족 등)
      const message = error?.response?.data?.message ?? '오류가 발생했습니다. 다시 시도해주세요.';
      alert(message);
    },
  });
}
