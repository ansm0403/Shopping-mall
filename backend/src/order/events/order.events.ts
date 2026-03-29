export class OrderCreatedEvent {
  constructor(
    public readonly orderId: number,
    public readonly userId: number,
    public readonly orderNumber: string,
    public readonly totalAmount: number,
  ) {}
}

export class OrderPaidEvent {
  constructor(
    public readonly orderId: number,
    public readonly userId: number,
    public readonly orderNumber: string,
    public readonly impUid: string,
  ) {}
}

export class OrderCancelledEvent {
  constructor(
    public readonly orderId: number,
    public readonly userId: number,
    public readonly orderNumber: string,
    public readonly reason: string,
    public readonly refundRequired: boolean,
  ) {}
}
