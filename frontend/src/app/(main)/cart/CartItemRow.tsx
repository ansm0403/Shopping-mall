'use client';

import { FaTrash } from 'react-icons/fa';
import { CartItem } from '@/model/cart';
import { useUpdateCartItem, useRemoveCartItem } from '@/hooks/useCart';

interface CartItemRowProps {
  item: CartItem;
}

export default function CartItemRow({ item }: CartItemRowProps) {
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();

  const { product, quantity, id: itemId } = item;
  const isOutOfStock = product.status === 'sold_out' || product.stockQuantity === 0;
  const totalPrice = product.price * quantity;

  const handleDecrease = () => {
    if (quantity <= 1) return;
    updateItem.mutate({ itemId, quantity: quantity - 1 });
  };

  const handleIncrease = () => {
    if (quantity >= product.stockQuantity) return;
    updateItem.mutate({ itemId, quantity: quantity + 1 });
  };

  const handleRemove = () => {
    removeItem.mutate(itemId);
  };

  const isMutating = updateItem.isPending || removeItem.isPending;

  return (
    <div className={`flex items-center gap-4 p-4 bg-white rounded-xl border border-secondary-200 transition-opacity ${isMutating ? 'opacity-50' : ''}`}>

      {/* 브랜드 이니셜 아바타 */}
      <div className="w-16 h-16 rounded-lg bg-primary-100 flex items-center justify-center shrink-0">
        <span className="text-primary-600 font-bold text-xl">
          {product.brand.charAt(0).toUpperCase()}
        </span>
      </div>

      {/* 상품 정보 */}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-secondary-400 mb-0.5">{product.brand}</p>
        <p className="text-sm font-semibold text-secondary-900 truncate">{product.name}</p>
        <div className="flex items-center gap-1 mt-0.5">
          {product.discountRate && product.discountRate > 0 && (
            <span className="text-xs text-primary-600 font-bold">{product.discountRate}%↓</span>
          )}
          <span className="text-sm font-bold text-secondary-900">
            {product.price.toLocaleString()}원
          </span>
        </div>
        {isOutOfStock && (
          <span className="text-xs text-red-500 font-medium">품절</span>
        )}
      </div>

      {/* 수량 조절 */}
      <div className="flex items-center border border-secondary-300 rounded-lg overflow-hidden shrink-0">
        <button
          onClick={handleDecrease}
          disabled={isMutating || quantity <= 1}
          className="w-8 h-8 flex items-center justify-center text-secondary-600 hover:bg-secondary-50 disabled:opacity-30 transition-colors font-bold text-lg"
        >
          −
        </button>
        <span className="w-8 text-center text-sm font-semibold select-none">
          {quantity}
        </span>
        <button
          onClick={handleIncrease}
          disabled={isMutating || quantity >= product.stockQuantity}
          className="w-8 h-8 flex items-center justify-center text-secondary-600 hover:bg-secondary-50 disabled:opacity-30 transition-colors font-bold text-lg"
        >
          +
        </button>
      </div>

      {/* 합계 금액 */}
      <div className="text-right shrink-0 w-24">
        <p className="text-sm font-bold text-secondary-900">
          {totalPrice.toLocaleString()}원
        </p>
      </div>

      {/* 삭제 버튼 */}
      <button
        onClick={handleRemove}
        disabled={isMutating}
        className="p-2 text-secondary-300 hover:text-red-400 disabled:opacity-30 transition-colors shrink-0"
        aria-label="장바구니에서 제거"
      >
        <FaTrash size={14} />
      </button>
    </div>
  );
}
