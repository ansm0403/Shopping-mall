import { IsEnum, IsOptional } from 'class-validator';
import { BasePaginateDto } from '../../common/dto/paginate.dto';
import { SellerStatus } from '../entity/seller.entity';

export class SellerApplicationQueryDto extends BasePaginateDto {
  @IsOptional()
  @IsEnum(SellerStatus)
  status?: SellerStatus;
}
