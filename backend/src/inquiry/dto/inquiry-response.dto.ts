import { Expose, Type } from 'class-transformer';
import { BaseModel } from '../../common/entity/base.entity';

class InquiryAuthorDto {
  @Expose()
  id: number;

  @Expose()
  nickName: string;
}

export class InquiryResponseDto extends BaseModel {
  @Expose()
  userId: number;

  @Expose()
  productId: number;

  @Expose()
  sellerId: number;

  @Expose()
  title: string;

  @Expose()
  content: string;

  @Expose()
  answer: string | null;

  @Expose()
  answeredAt: Date | null;

  @Expose()
  isSecret: boolean;

  @Expose()
  status: string;

  @Expose()
  @Type(() => InquiryAuthorDto)
  user: InquiryAuthorDto;
}
