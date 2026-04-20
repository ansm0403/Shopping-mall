import { ArrayMaxSize, IsArray, IsEnum, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';
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

  /** 제품명 + 태그명 통합 검색어 */
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: '검색어는 최대 100자까지 입력 가능합니다' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  keyword?: string;

  /**
   * 특정 태그 필터 (AND 조건)
   * 쿼리스트링: tags=블루투스,여름 → ['블루투스', '여름']
   */
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10, { message: '태그는 최대 10개까지 지정 가능합니다' })
  @IsString({ each: true })
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.split(',').map((v: string) => v.trim()).filter(Boolean)
      : value,
  )
  tags?: string[];
}
