import { BaseModel } from '../base.model.js';
import type { Shipment } from './shipment.js';

export const OrderStatus = {
  PENDING_PAYMENT: 'pending_payment',
  PAID: 'paid',
  PREPARING: 'preparing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export const PaymentStatus = {
  READY: 'ready',
  PAID: 'paid',
  CANCELLED: 'cancelled',
  PARTIAL_CANCELLED: 'partial_cancelled',
  FAILED: 'failed',
} as const;

export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export interface Order extends BaseModel {
  orderNumber: string;
  userId: number;
  status: OrderStatus;
  totalAmount: number;
  shippingAddress: string;
  recipientName: string;
  recipientPhone: string;
  memo?: string | null;
  paidAt?: Date | null;
  cancelledAt?: Date | null;
  shippedAt?: Date | null;
  deliveredAt?: Date | null;
  completedAt?: Date | null;
  items: OrderItem[];
  shipments?: Shipment[];
}

export interface OrderItem extends BaseModel {
  orderId: number;
  productId: number;
  sellerId: number;
  productName: string;
  productPrice: number;
  productImageUrl?: string | null;
  quantity: number;
  subtotal: number;
}
