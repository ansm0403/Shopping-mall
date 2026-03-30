export class ReviewCreatedEvent {
  constructor(
    public readonly reviewId: number,
    public readonly productId: number,
    public readonly rating: number,
  ) {}
}

export class ReviewDeletedEvent {
  constructor(
    public readonly productId: number,
    public readonly rating: number,
  ) {}
}
