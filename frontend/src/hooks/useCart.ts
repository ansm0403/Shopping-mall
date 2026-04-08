'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { addCartItem, updateCartItem, removeCartItem, clearCart } from '@/service/cart';
import { authStorage } from '@/service/auth-storage';
import { cartKeys } from '@/lib/react-query/cart-query-options';

/**
 * 로그인 체크 공통 유틸
 * 토큰이 없으면 /login으로 redirect하고 에러를 throw
 */
function requireAuth(router: ReturnType<typeof useRouter>) {
  if (!authStorage.getAccessToken()) {
    router.push('/login');
    throw new Error('로그인이 필요합니다.');
  }
}

/**
 * 인증 관련 에러는 이미 redirect 처리했으므로 무시하고,
 * 그 외 에러는 백엔드 메시지를 alert으로 표시
 */
function handleCartError(error: any) {
  if (error?.message === '로그인이 필요합니다.') return;
  const message = error?.response?.data?.message ?? '오류가 발생했습니다. 다시 시도해주세요.';
  alert(message);
}

/**
 * 장바구니 추가
 *
 * 사용법:
 *   const addToCart = useAddToCart();
 *   addToCart.mutate({ productId: 1, quantity: 2 });
 *
 * onSuccess: cartKeys.all 범위 invalidation → HomeCart 자동 재조회
 */
export function useAddToCart() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: ({ productId, quantity }: { productId: number; quantity: number }) =>
      addCartItem(productId, quantity),

    onMutate: () => {
      requireAuth(router);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },

    onError: handleCartError,
  });
}

/**
 * 장바구니 아이템 수량 변경
 *
 * 사용법:
 *   const updateItem = useUpdateCartItem();
 *   updateItem.mutate({ itemId: 3, quantity: 5 });
 */
export function useUpdateCartItem() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: number; quantity: number }) =>
      updateCartItem(itemId, quantity),

    onMutate: () => {
      requireAuth(router);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },

    onError: handleCartError,
  });
}

/**
 * 장바구니 아이템 삭제
 *
 * 사용법:
 *   const removeItem = useRemoveCartItem();
 *   removeItem.mutate(itemId);
 */
export function useRemoveCartItem() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (itemId: number) => removeCartItem(itemId),

    onMutate: () => {
      requireAuth(router);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },

    onError: handleCartError,
  });
}

/**
 * 장바구니 전체 비우기
 *
 * 사용법:
 *   const clear = useClearCart();
 *   clear.mutate();
 */
export function useClearCart() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: clearCart,

    onMutate: () => {
      requireAuth(router);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },

    onError: handleCartError,
  });
}
