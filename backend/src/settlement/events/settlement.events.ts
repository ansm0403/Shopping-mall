export class SettlementCreatedEvent {
  constructor(
    public readonly settlementId: number,
    public readonly orderId: number,
    public readonly sellerId: number,
    public readonly settlementAmount: number,
  ) {}
}
