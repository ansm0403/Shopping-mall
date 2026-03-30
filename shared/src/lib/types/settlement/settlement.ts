import { BaseModel } from "../base.model.js";

export enum SettlementStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PAID = 'paid',
}

export interface Settlement extends BaseModel {
  orderId: number;
  sellerId: number;
  orderNumber: string;
  amount: number;
  commissionRate: number;
  commissionAmount: number;
  settlementAmount: number;
  status: SettlementStatus;
  confirmedAt: string | null;
  paidAt: string | null;
}

export interface SettlementSummary {
  totalAmount: number;
  totalSettlement: number;
  totalCommission: number;
  pendingCount: number;
  pendingAmount: number;
  confirmedCount: number;
  paidCount: number;
}
