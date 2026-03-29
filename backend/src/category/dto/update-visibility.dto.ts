import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateVisibilityDto {
  @IsNotEmpty()
  @IsBoolean()
  isVisible: boolean;
}
