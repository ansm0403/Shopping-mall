import { authClient } from '../lib/axios/axios-http-client';

/**
 * 장바구니에 상품 추가
 * - 이미 담긴 상품이면 수량이 합산됨 (백엔드 로직)
 * - authClient 사용: JWT 토큰 자동 첨부 (BUYER 권한 필요)
 */
export function addCartItem(productId: number, quantity: number) {
  return authClient.post('/cart/items', { productId, quantity });
}
