'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const badgeVariants = cva(
  'inline-flex items-center font-medium rounded-full',
  {
    variants: {
      variant: {
        default:  'bg-secondary-100 text-secondary-700',
        primary:  'bg-primary-100 text-primary-700',
        success:  'bg-green-100 text-green-700',
        warning:  'bg-yellow-100 text-yellow-800',
        danger:   'bg-red-100 text-red-700',
        info:     'bg-sky-100 text-sky-700',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-sm',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, children, ...props }: BadgeProps) {
  return (
    <span
      className={twMerge(clsx(badgeVariants({ variant, size }), className))}
      {...props}
    >
      {children}
    </span>
  );
}

// 주문 상태를 Badge variant에 매핑하는 헬퍼
const ORDER_STATUS_MAP: Record<string, VariantProps<typeof badgeVariants>['variant']> = {
  PENDING:         'warning',
  PAID:            'primary',
  PREPARING:       'info',
  SHIPPED:         'info',
  DELIVERED:       'success',
  CONFIRMED:       'success',
  CANCELLED:       'danger',
  REFUND_PENDING:  'warning',
  REFUNDED:        'danger',
};

const ORDER_STATUS_LABEL: Record<string, string> = {
  PENDING:         '결제 대기',
  PAID:            '결제 완료',
  PREPARING:       '상품 준비중',
  SHIPPED:         '배송중',
  DELIVERED:       '배송 완료',
  CONFIRMED:       '구매 확정',
  CANCELLED:       '취소됨',
  REFUND_PENDING:  '환불 요청',
  REFUNDED:        '환불 완료',
};

export interface OrderStatusBadgeProps extends Omit<BadgeProps, 'variant' | 'children'> {
  status: string;
}

export function OrderStatusBadge({ status, ...props }: OrderStatusBadgeProps) {
  return (
    <Badge variant={ORDER_STATUS_MAP[status] ?? 'default'} {...props}>
      {ORDER_STATUS_LABEL[status] ?? status}
    </Badge>
  );
}
