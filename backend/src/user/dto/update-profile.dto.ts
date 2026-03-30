import { IsOptional, IsString, Length } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @Length(2, 20)
  nickName?: string;

  @IsOptional()
  @IsString()
  @Length(10, 15)
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  @Length(5, 200)
  address?: string;
}
