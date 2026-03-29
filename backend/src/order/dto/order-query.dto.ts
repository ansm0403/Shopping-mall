import { IsEnum, IsOptional } from 'class-validator';
import { BasePaginateDto } from '../../common/dto/paginate.dto';
import { OrderStatus } from '../entity/order.entity';

export class OrderQueryDto extends BasePaginateDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}
