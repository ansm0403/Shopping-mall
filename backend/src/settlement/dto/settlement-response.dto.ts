import { Expose, Type } from 'class-transformer';
import { BaseModel } from '../../common/entity/base.entity';

class SettlementSellerDto {
  @Expose()
  id: number;

  @Expose()
  businessName: string;
}

export class SettlementResponseDto extends BaseModel {
  @Expose()
  orderId: number;

  @Expose()
  sellerId: number;

  @Expose()
  orderNumber: string;

  @Expose()
  amount: number;

  @Expose()
  commissionRate: number;

  @Expose()
  commissionAmount: number;

  @Expose()
  settlementAmount: number;

  @Expose()
  status: string;

  @Expose()
  confirmedAt: Date | null;

  @Expose()
  paidAt: Date | null;

  @Expose()
  @Type(() => SettlementSellerDto)
  seller: SettlementSellerDto;
}

export class SettlementSummaryDto {
  @Expose()
  totalAmount: number;

  @Expose()
  totalSettlement: number;

  @Expose()
  totalCommission: number;

  @Expose()
  pendingCount: number;

  @Expose()
  pendingAmount: number;

  @Expose()
  confirmedCount: number;

  @Expose()
  paidCount: number;
}
