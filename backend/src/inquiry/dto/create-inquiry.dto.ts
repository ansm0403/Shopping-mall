import { IsInt, IsString, IsOptional, IsBoolean, Length } from 'class-validator';

export class CreateInquiryDto {
  @IsInt()
  productId: number;

  @IsString()
  @Length(2, 200)
  title: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsBoolean()
  isSecret?: boolean;
}
