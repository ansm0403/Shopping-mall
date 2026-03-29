import { IsNotEmpty, IsString } from 'class-validator';

export class RejectProductDto {
  @IsNotEmpty()
  @IsString()
  reason: string;
}
