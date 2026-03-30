import { IsInt, IsString, Min, Max, IsOptional, IsArray, ArrayMaxSize } from 'class-validator';

export class UpdateReviewDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(5)
  imageUrls?: string[];
}
