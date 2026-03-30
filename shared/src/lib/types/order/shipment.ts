import { BaseModel } from '../base.model.js';

export const ShipmentStatus = {
  PREPARING: 'preparing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
} as const;

export type ShipmentStatus = (typeof ShipmentStatus)[keyof typeof ShipmentStatus];

export interface Shipment extends BaseModel {
  orderId: number;
  sellerId: number;
  status: ShipmentStatus;
  trackingNumber?: string | null;
  carrier?: string | null;
  shippedAt?: Date | null;
  deliveredAt?: Date | null;
}
