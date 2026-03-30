import { IsInt, IsString, Min, Max, IsOptional, IsArray, ArrayMaxSize } from 'class-validator';

export class CreateReviewDto {
  @IsInt()
  orderId: number;

  @IsInt()
  productId: number;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  comment: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(5)
  imageUrls?: string[];
}
