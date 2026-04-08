'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { orderQueryOptions } from '@/lib/react-query/order-query-options';
import { OrderResponse, OrderStatus, PaginatedOrders } from '@/model/order';

const STATUS_TABS: { label: string; value: OrderStatus | '' }[] = [
  { label: '전체', value: '' },
  { label: '결제 대기', value: 'pending_payment' },
  { label: '결제 완료', value: 'paid' },
  { label: '배송 준비', value: 'preparing' },
  { label: '배송 중', value: 'shipped' },
  { label: '배송 완료', value: 'delivered' },
  { label: '구매 확정', value: 'completed' },
  { label: '취소', value: 'cancelled' },
];

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending_payment: '결제 대기',
  paid: '결제 완료',
  preparing: '배송 준비',
  shipped: '배송 중',
  delivered: '배송 완료',
  completed: '구매 확정',
  cancelled: '취소',
};

const STATUS_COLOR: Record<OrderStatus, string> = {
  pending_payment: 'text-yellow-600 bg-yellow-50',
  paid: 'text-blue-600 bg-blue-50',
  preparing: 'text-indigo-600 bg-indigo-50',
  shipped: 'text-purple-600 bg-purple-50',
  delivered: 'text-green-600 bg-green-50',
  completed: 'text-secondary-600 bg-secondary-100',
  cancelled: 'text-red-600 bg-red-50',
};

export default function OrdersPage() {
  const router = useRouter();
  const { user, isHydrated } = useAuth();
  const isLoggedIn = !!user;

  const [activeStatus, setActiveStatus] = useState<OrderStatus | ''>('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (isHydrated && !isLoggedIn) router.push('/login');
  }, [isHydrated, isLoggedIn, router]);

  // 탭 변경 시 페이지 초기화
  const handleTabChange = (status: OrderStatus | '') => {
    setActiveStatus(status);
    setPage(1);
  };

  const queryOpts = orderQueryOptions.myOrders({
    page,
    take: 10,
    ...(activeStatus ? { status: activeStatus } : {}),
  });
  const { data, isLoading } = useQuery({
    ...queryOpts,
    enabled: isLoggedIn,
  });

  const result = data?.data as PaginatedOrders | undefined;
  const orders = result?.data ?? [];
  const meta = result?.meta;

  return (
    <div className="py-8">
      <h1 className="text-2xl font-bold text-secondary-900 mb-6">주문 내역</h1>

      {/* 상태 필터 탭 */}
      <div className="flex gap-1 overflow-x-auto pb-1 mb-6 scrollbar-hide">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleTabChange(tab.value)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeStatus === tab.value
                ? 'bg-primary-600 text-white'
                : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 목록 */}
      {isLoading ? (
        <div className="py-20 text-center text-secondary-400">불러오는 중...</div>
      ) : orders.length === 0 ? (
        <div className="py-20 text-center text-secondary-400">
          <p className="text-base font-medium">주문 내역이 없습니다</p>
          <button
            onClick={() => router.push('/products')}
            className="mt-4 px-6 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
          >
            쇼핑하러 가기
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onClick={() => router.push(`/my/orders/${order.orderNumber}`)}
            />
          ))}
        </div>
      )}

      {/* 페이지네이션 */}
      {meta && meta.lastPage > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={!meta.hasPreviousPage}
            className="px-3 py-1.5 text-sm border border-secondary-300 rounded-lg disabled:opacity-40 hover:bg-secondary-50 transition-colors"
          >
            이전
          </button>
          <span className="text-sm text-secondary-600">
            {meta.page} / {meta.lastPage}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!meta.hasNextPage}
            className="px-3 py-1.5 text-sm border border-secondary-300 rounded-lg disabled:opacity-40 hover:bg-secondary-50 transition-colors"
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}

function OrderCard({ order, onClick }: { order: OrderResponse; onClick: () => void }) {
  const firstItem = order.items[0];
  const extraCount = order.items.length - 1;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-xl border border-secondary-200 p-4 hover:border-primary-300 hover:shadow-sm transition-all"
    >
      {/* 상단: 날짜 + 주문번호 + 상태 */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs text-secondary-400">
            {new Date(order.createdAt).toLocaleDateString('ko-KR', {
              year: 'numeric', month: 'long', day: 'numeric',
            })}
          </p>
          <p className="text-xs text-secondary-500 mt-0.5">{order.orderNumber}</p>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[order.status]}`}>
          {STATUS_LABEL[order.status]}
        </span>
      </div>

      {/* 상품 정보 */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center shrink-0">
          <span className="text-primary-600 font-bold text-base">
            {firstItem?.productName?.charAt(0) ?? '?'}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-secondary-900 truncate">
            {firstItem?.productName}
            {extraCount > 0 && (
              <span className="ml-1 text-secondary-400 font-normal">외 {extraCount}건</span>
            )}
          </p>
          <p className="text-sm font-bold text-primary-600 mt-0.5">
            {Number(order.totalAmount).toLocaleString()}원
          </p>
        </div>
      </div>
    </button>
  );
}
