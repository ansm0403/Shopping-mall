export class ShipmentShippedEvent {
  constructor(
    public readonly orderId: number,
    public readonly sellerId: number,
    public readonly orderNumber: string,
    public readonly trackingNumber: string,
    public readonly carrier: string,
  ) {}
}

export class OrderShippedEvent {
  constructor(
    public readonly orderId: number,
    public readonly orderNumber: string,
  ) {}
}

export class OrderDeliveredEvent {
  constructor(
    public readonly orderId: number,
    public readonly orderNumber: string,
  ) {}
}

export class OrderCompletedEvent {
  constructor(
    public readonly orderId: number,
    public readonly userId: number,
    public readonly orderNumber: string,
  ) {}
}
