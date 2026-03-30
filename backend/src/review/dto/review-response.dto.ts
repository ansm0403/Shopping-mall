import { Expose, Type } from 'class-transformer';
import { BaseModel } from '../../common/entity/base.entity';

class ReviewAuthorDto {
  @Expose()
  id: number;

  @Expose()
  nickName: string;
}

export class ReviewResponseDto extends BaseModel {
  @Expose()
  userId: number;

  @Expose()
  productId: number;

  @Expose()
  orderId: number;

  @Expose()
  rating: number;

  @Expose()
  comment: string;

  @Expose()
  imageUrls: string[];

  @Expose()
  @Type(() => ReviewAuthorDto)
  user: ReviewAuthorDto;
}
