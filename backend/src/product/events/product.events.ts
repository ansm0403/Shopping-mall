export class ProductCreatedEvent {
  constructor(
    public readonly productId: number,
    public readonly sellerId: number,
  ) {}
}

export class ProductApprovedEvent {
  constructor(
    public readonly productId: number,
    public readonly sellerId: number,
  ) {}
}

export class ProductRejectedEvent {
  constructor(
    public readonly productId: number,
    public readonly sellerId: number,
    public readonly reason: string,
  ) {}
}
