import { Expose, Type } from 'class-transformer';
import { BaseModel } from '../../common/entity/base.entity';

class WishlistProductDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  price: number;

  @Expose()
  status: string;

  @Expose()
  brand: string;

  @Expose()
  rating: number;
}

export class WishlistItemResponseDto extends BaseModel {
  @Expose()
  productId: number;

  @Expose()
  @Type(() => WishlistProductDto)
  product: WishlistProductDto;
}
