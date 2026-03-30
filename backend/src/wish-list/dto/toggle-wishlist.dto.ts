import { IsInt } from 'class-validator';

export class ToggleWishlistDto {
  @IsInt()
  productId: number;
}
