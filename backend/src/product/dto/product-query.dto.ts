import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApprovalStatus, ProductStatus } from '../entity/product.entity';
import { BasePaginateDto } from '../../common/dto/paginate.dto';

export class ProductQueryDto extends BasePaginateDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoryId?: number;

  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @IsOptional()
  @IsEnum(ApprovalStatus)
  approvalStatus?: ApprovalStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sellerId?: number;
}
