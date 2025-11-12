import { Type } from 'class-transformer';
import { IsIn, IsNumber, IsOptional } from 'class-validator';

export class BasePaginateDto {
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  page?: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  where__id__less_than?: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  where__id__more_than?: number;

  @IsIn(['DESC', 'ASC'], { message: 'order must be either ASC or DESC' })
  @IsOptional()
  order__createdAt?: 'ASC' | 'DESC';

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  take = 20;

  // 동적 필터를 위한 인덱스 시그니처
  // where__필드명__필터타입 형식의 필터를 동적으로 받을 수 있음
  // 예: where__id__more_than, where__name__like, where__price__between 등
  [key: string]: any;
}