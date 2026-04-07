'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toggleWishlist } from '@/service/wishlist';
import { authStorage } from '@/service/auth-storage';

/**
 * 위시리스트 토글 mutation hook
 *
 * 사용법:
 *   const wishlistToggle = useWishlistToggle();
 *   wishlistToggle.mutate(productId, {
 *     onSuccess: (res) => setIsWished(res.data.action === 'added'),
 *   });
 *
 * 상태:
 *   wishlistToggle.isPending → API 요청 중 (버튼 비활성화용)
 */
export function useWishlistToggle() {
  const router = useRouter();

  return useMutation({
    mutationFn: (productId: number) => toggleWishlist(productId),

    onMutate: () => {
      // 요청 직전: 로그인 상태 확인
      if (!authStorage.getAccessToken()) {
        router.push('/login');
        throw new Error('로그인이 필요합니다.');
      }
    },

    onError: (error: any) => {
      if (error?.message === '로그인이 필요합니다.') return;

      const message = error?.response?.data?.message ?? '오류가 발생했습니다. 다시 시도해주세요.';
      alert(message);
    },
  });
}
