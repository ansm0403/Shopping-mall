'use client';

import { useQuery } from '@tanstack/react-query';
import CartIcons from '@/components/icons/CartIcons';
import { cartQueryOptions } from '@/lib/react-query/cart-query-options';
import { useAuth } from '@/contexts/AuthContext';
import { Cart } from '@/model/cart';

export default function HomeCart() {
  const { user } = useAuth();
  const { data } = useQuery(cartQueryOptions.myCart(!!user));

  const cart = data?.data as Cart | undefined;
  const items = cart?.items ?? [];
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <div className="flex gap-4 text-white text-sm items-center justify-center bg-sky-500 self-stretch px-7 whitespace-nowrap">
      <CartIcons size={'xl'} />
      <div>
        <div>장바구니</div>
        <div>
          {totalCount} ITEM - {totalPrice.toLocaleString()} 원
        </div>
      </div>
    </div>
  );
}
