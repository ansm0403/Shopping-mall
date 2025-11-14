import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsIn, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

/**
 * 페이지 기반 페이지네이션의 예시 쿼리
 * {
 *  page: 3, 
 *  order__id: "DESC",
 *  take: 20,
 * }
 * 
 * 무한 스크롤 페이지네이션의 예시 쿼리
 * {
 *  where__id__more_than: 21,
 *  order__id: "DESC",
 *  take: 20,
 * }
 * 
 * page 쿼리는 페이지 기반에선 필수이며, 해당 쿼리가 없을 때 무한 스크롤이다.
 * where__id 이던 where__rating 이던간에 무한 스크롤에서 where 쿼리는 필수이다.(하지만 페이지 첫 진입시에는 where 에 넣을 id 값이나 rating 값을 알 수 없기에 예외이다.)
 * 그래서 order__id 나 order__rating 을 기준으로 먼저 데이터를 받아온 후 커서값을 where__id 나 where__rating 에 넣어서 프론트엔드에 전달해줘야 한다.
 * 페이지 기반에서는 특정 평점이상의 상품들만 보여달라는 조건(where__rating__more_than=4.0)이나 특정 카테고리의 상품만 보여달라는 조건(where__category="book") 등이 있을 때 where 쿼리를 받는다.
 * order 쿼리는 두 페이지네이션에서 필수 쿼리이다. 
 * order 쿼리가 들어오지 않을 때는 자동으로 where 쿼리에서 요구하는 기준(where__id 면 order__id 로 받는다.)과 동일하게 한다.
 * 하지만 where 쿼리가가 없는 경우에는 order__rating="DESC" 를 default 로 한다.
 * 
 */
export class BasePaginateDto {
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  page?: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  take = 20;

  @IsOptional()
  @IsEnum(['id', 'createdAt', 'rating', 'price', 'viewCount'])
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';

  // ✅ 커서 추가
  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @ValidateNested()
  @Type(()=>PaginateFilterDto)
  filter? : PaginateFilterDto;

  // 동적 필터를 위한 인덱스 시그니처
  // where__필드명__필터타입 형식의 필터를 동적으로 받을 수 있음
  // 예: where__id__more_than, where__name__like, where__price__between 등
  [key: string]: any;
}

class PaginateFilterDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => NumberFilterDto)
  rating?: NumberFilterDto;

  @IsOptional()
  @ValidateNested()
  @Type(()=>StringFilterDto)
  status?: StringFilterDto;

  @IsOptional()
  @ValidateNested()
  @Type(()=>StringFilterDto)
  category?: StringFilterDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => NumberFilterDto)
  price?: NumberFilterDto;
}
class NumberFilterDto {
  @IsOptional()
  @IsNumber()
  equals?: number;

  @IsOptional()
  @IsNumber()
  gt?: number;

  @IsOptional()
  @IsNumber()
  gte?: number;

  @IsOptional()
  @IsNumber()
  lt?: number;

  @IsOptional()
  @IsNumber()
  lte?: number;
}

class StringFilterDto {
  @IsOptional()
  @IsString()
  equals?: string;

  @IsOptional()
  @IsString()
  contains?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  in?: string[];
}