'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { orderQueryOptions } from '@/lib/react-query/order-query-options';
import { useCancelOrder, useConfirmOrder, useCancelPayment } from '@/hooks/useOrder';
import { Modal, ModalFooter } from '@/components/common/Modal';
import { OrderResponse, OrderStatus } from '@/model/order';

// ─── 상태 표시 설정 ──────────────────────────────────────────────────────────

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending_payment: '결제 대기',
  paid: '결제 완료',
  preparing: '배송 준비',
  shipped: '배송 중',
  delivered: '배송 완료',
  completed: '구매 확정',
  cancelled: '취소됨',
};

const STATUS_COLOR: Record<OrderStatus, string> = {
  pending_payment: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  paid: 'text-blue-600 bg-blue-50 border-blue-200',
  preparing: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  shipped: 'text-purple-600 bg-purple-50 border-purple-200',
  delivered: 'text-green-600 bg-green-50 border-green-200',
  completed: 'text-secondary-600 bg-secondary-100 border-secondary-200',
  cancelled: 'text-red-600 bg-red-50 border-red-200',
};

// 진행 단계 (cancelled/completed 제외)
const STEPS: OrderStatus[] = ['pending_payment', 'paid', 'preparing', 'shipped', 'delivered', 'completed'];

// ─── 메인 컴포넌트 ────────────────────────────────────────────────────────────

export default function OrderDetailPage() {
  const params = useParams();
  const orderNumber = params.orderNumber as string;
  const router = useRouter();
  const { user, isHydrated } = useAuth();
  const isLoggedIn = !!user;

  useEffect(() => {
    if (isHydrated && !isLoggedIn) router.push('/login');
  }, [isHydrated, isLoggedIn, router]);

  const detailOpts = orderQueryOptions.detail(orderNumber);
  const { data, isLoading } = useQuery({
    ...detailOpts,
    enabled: isLoggedIn && !!orderNumber,
  });
  const order = data?.data as OrderResponse | undefined;

  if (isLoading) {
    return <div className="py-20 text-center text-secondary-400">불러오는 중...</div>;
  }

  if (!order) {
    return (
      <div className="py-20 text-center text-secondary-400">
        <p>주문을 찾을 수 없습니다.</p>
        <button
          onClick={() => router.push('/my/orders')}
          className="mt-4 text-primary-600 underline text-sm"
        >
          주문 목록으로
        </button>
      </div>
    );
  }

  return (
    <div className="py-8 max-w-2xl mx-auto">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.push('/my/orders')}
          className="text-secondary-400 hover:text-secondary-600 transition-colors"
          aria-label="뒤로"
        >
          ←
        </button>
        <h1 className="text-xl font-bold text-secondary-900">주문 상세</h1>
      </div>

      <div className="space-y-4">
        {/* 주문 상태 */}
        <StatusCard order={order} />

        {/* 주문 상품 */}
        <ItemsCard order={order} />

        {/* 배송 정보 */}
        <ShippingCard order={order} />

        {/* 결제 정보 */}
        {order.payment && <PaymentCard order={order} />}

        {/* 액션 버튼 */}
        <ActionSection order={order} />
      </div>
    </div>
  );
}

// ─── 하위 컴포넌트 ────────────────────────────────────────────────────────────

function StatusCard({ order }: { order: OrderResponse }) {
  const isCancelled = order.status === 'cancelled';
  const currentStepIdx = STEPS.indexOf(order.status);

  return (
    <section className="bg-white rounded-xl border border-secondary-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-secondary-400 mb-0.5">
            {new Date(order.createdAt).toLocaleDateString('ko-KR', {
              year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
            })}
          </p>
          <p className="text-xs text-secondary-500">{order.orderNumber}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${STATUS_COLOR[order.status]}`}>
          {STATUS_LABEL[order.status]}
        </span>
      </div>

      {/* 진행 단계 표시 (취소가 아닌 경우) */}
      {!isCancelled && (
        <div className="flex items-center gap-1 mt-2 overflow-x-auto pb-1">
          {STEPS.map((step, idx) => {
            const isActive = idx === currentStepIdx;
            const isPast = idx < currentStepIdx;
            return (
              <div key={step} className="flex items-center gap-1 shrink-0">
                <div className={`w-2 h-2 rounded-full shrink-0 ${
                  isPast || isActive ? 'bg-primary-600' : 'bg-secondary-200'
                }`} />
                <span className={`text-xs whitespace-nowrap ${
                  isActive ? 'text-primary-600 font-semibold' : isPast ? 'text-secondary-500' : 'text-secondary-300'
                }`}>
                  {STATUS_LABEL[step]}
                </span>
                {idx < STEPS.length - 1 && (
                  <div className={`w-4 h-px mx-0.5 ${isPast ? 'bg-primary-400' : 'bg-secondary-200'}`} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 취소 사유 */}
      {isCancelled && order.cancellationReason && (
        <p className="text-sm text-red-500 mt-2">취소 사유: {order.cancellationReason}</p>
      )}
    </section>
  );
}

function ItemsCard({ order }: { order: OrderResponse }) {
  return (
    <section className="bg-white rounded-xl border border-secondary-200 p-5">
      <h2 className="text-sm font-bold text-secondary-900 mb-3">주문 상품</h2>
      <div className="divide-y divide-secondary-100">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            {item.productImageUrl ? (
              <img
                src={item.productImageUrl}
                alt={item.productName}
                className="w-12 h-12 rounded-lg object-cover shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center shrink-0">
                <span className="text-primary-600 font-bold text-base">
                  {item.productName.charAt(0)}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-secondary-900 truncate">{item.productName}</p>
              <p className="text-xs text-secondary-500">
                {Number(item.productPrice).toLocaleString()}원 × {item.quantity}개
              </p>
            </div>
            <p className="text-sm font-bold text-secondary-900 shrink-0">
              {Number(item.subtotal).toLocaleString()}원
            </p>
          </div>
        ))}
      </div>
      <div className="border-t border-secondary-200 pt-3 mt-1 flex justify-between items-center">
        <span className="text-sm font-bold text-secondary-900">총 결제금액</span>
        <span className="text-base font-bold text-primary-600">
          {Number(order.totalAmount).toLocaleString()}원
        </span>
      </div>
    </section>
  );
}

function ShippingCard({ order }: { order: OrderResponse }) {
  return (
    <section className="bg-white rounded-xl border border-secondary-200 p-5">
      <h2 className="text-sm font-bold text-secondary-900 mb-3">배송 정보</h2>
      <dl className="space-y-2 text-sm">
        <Row label="수령인" value={order.recipientName} />
        <Row label="연락처" value={order.recipientPhone} />
        <Row label="주소" value={order.shippingAddress} />
        {order.memo && <Row label="배송 메모" value={order.memo} />}
      </dl>

      {/* 셀러별 배송 현황 */}
      {order.shipments.length > 0 && (
        <div className="mt-4 pt-4 border-t border-secondary-100 space-y-3">
          <p className="text-xs font-semibold text-secondary-500">배송 현황</p>
          {order.shipments.map((shipment) => (
            <div key={shipment.id} className="text-sm">
              <div className="flex items-center justify-between">
                <span className="text-secondary-600">
                  {shipment.status === 'preparing' ? '배송 준비' : shipment.status === 'shipped' ? '배송 중' : '배송 완료'}
                </span>
                {shipment.trackingNumber && (
                  <span className="text-secondary-500 text-xs">
                    {shipment.carrier} {shipment.trackingNumber}
                  </span>
                )}
              </div>
              {shipment.shippedAt && (
                <p className="text-xs text-secondary-400 mt-0.5">
                  발송: {new Date(shipment.shippedAt).toLocaleDateString('ko-KR')}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function PaymentCard({ order }: { order: OrderResponse }) {
  const payment = order.payment!;
  return (
    <section className="bg-white rounded-xl border border-secondary-200 p-5">
      <h2 className="text-sm font-bold text-secondary-900 mb-3">결제 정보</h2>
      <dl className="space-y-2 text-sm">
        <Row label="결제 수단" value={payment.paymentMethod ?? '-'} />
        <Row label="결제 금액" value={`${Number(payment.amount).toLocaleString()}원`} />
        <Row
          label="결제 상태"
          value={
            payment.status === 'paid' ? '결제 완료'
              : payment.status === 'cancelled' ? '결제 취소'
              : payment.status === 'partial_cancelled' ? '부분 취소'
              : payment.status === 'ready' ? '결제 대기'
              : '실패'
          }
        />
        {payment.paidAt && (
          <Row
            label="결제일시"
            value={new Date(payment.paidAt).toLocaleString('ko-KR')}
          />
        )}
        {payment.receiptUrl && (
          <div className="flex justify-between items-center">
            <dt className="text-secondary-500">영수증</dt>
            <dd>
              <a
                href={payment.receiptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 underline text-xs"
              >
                영수증 보기
              </a>
            </dd>
          </div>
        )}
      </dl>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-secondary-500 shrink-0">{label}</dt>
      <dd className="text-secondary-900 text-right">{value}</dd>
    </div>
  );
}

// ─── 액션 버튼 영역 ───────────────────────────────────────────────────────────

function ActionSection({ order }: { order: OrderResponse }) {
  const [cancelModal, setCancelModal] = useState(false);
  const [refundModal, setRefundModal] = useState(false);
  const [refundReason, setRefundReason] = useState('');

  const cancelOrder = useCancelOrder(order.orderNumber);
  const confirmOrder = useConfirmOrder(order.orderNumber);
  const cancelPayment = useCancelPayment(order.orderNumber);

  const handleCancelOrder = async () => {
    try {
      await cancelOrder.mutateAsync();
      setCancelModal(false);
    } catch {
      // onError 핸들러에서 alert 처리됨
    }
  };

  const handleRefund = async () => {
    if (!refundReason.trim()) {
      alert('취소 사유를 입력해주세요.');
      return;
    }
    try {
      await cancelPayment.mutateAsync({ reason: refundReason });
      setRefundModal(false);
      setRefundReason('');
    } catch {
      // onError 핸들러에서 alert 처리됨
    }
  };

  const handleConfirm = async () => {
    if (!confirm('구매를 확정하시겠습니까? 확정 후에는 취소할 수 없습니다.')) return;
    try {
      await confirmOrder.mutateAsync();
    } catch {
      // onError 핸들러에서 alert 처리됨
    }
  };

  const showCancelOrder = order.status === 'pending_payment';
  const showRefund = order.status === 'paid' || order.status === 'preparing';
  const showConfirm = order.status === 'delivered';

  if (!showCancelOrder && !showRefund && !showConfirm) return null;

  return (
    <>
      <section className="space-y-2">
        {showConfirm && (
          <button
            onClick={handleConfirm}
            disabled={confirmOrder.isPending}
            className="w-full py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all disabled:opacity-60"
          >
            {confirmOrder.isPending ? '처리 중...' : '구매 확정'}
          </button>
        )}
        {showCancelOrder && (
          <button
            onClick={() => setCancelModal(true)}
            className="w-full py-3 border border-red-300 text-red-500 rounded-xl font-semibold hover:bg-red-50 transition-colors"
          >
            주문 취소
          </button>
        )}
        {showRefund && (
          <button
            onClick={() => setRefundModal(true)}
            className="w-full py-3 border border-red-300 text-red-500 rounded-xl font-semibold hover:bg-red-50 transition-colors"
          >
            결제 취소 / 환불
          </button>
        )}
      </section>

      {/* 주문 취소 확인 모달 */}
      <Modal
        isOpen={cancelModal}
        onClose={() => setCancelModal(false)}
        title="주문 취소"
        size="sm"
      >
        <p className="text-sm text-secondary-600">주문을 취소하시겠습니까?</p>
        <ModalFooter>
          <button
            onClick={() => setCancelModal(false)}
            className="px-4 py-2 text-sm border border-secondary-300 rounded-lg text-secondary-600 hover:bg-secondary-50 transition-colors"
          >
            닫기
          </button>
          <button
            onClick={handleCancelOrder}
            disabled={cancelOrder.isPending}
            className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-60"
          >
            {cancelOrder.isPending ? '처리 중...' : '취소 확인'}
          </button>
        </ModalFooter>
      </Modal>

      {/* 결제 취소/환불 모달 */}
      <Modal
        isOpen={refundModal}
        onClose={() => setRefundModal(false)}
        title="결제 취소 / 환불"
        size="sm"
      >
        <div className="space-y-3">
          <p className="text-sm text-secondary-600">결제를 취소하고 환불을 신청합니다.</p>
          <textarea
            value={refundReason}
            onChange={(e) => setRefundReason(e.target.value)}
            rows={3}
            placeholder="취소 사유를 입력해주세요"
            className="w-full px-3 py-2 text-sm border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          />
        </div>
        <ModalFooter>
          <button
            onClick={() => { setRefundModal(false); setRefundReason(''); }}
            className="px-4 py-2 text-sm border border-secondary-300 rounded-lg text-secondary-600 hover:bg-secondary-50 transition-colors"
          >
            닫기
          </button>
          <button
            onClick={handleRefund}
            disabled={cancelPayment.isPending}
            className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-60"
          >
            {cancelPayment.isPending ? '처리 중...' : '환불 신청'}
          </button>
        </ModalFooter>
      </Modal>
    </>
  );
}
