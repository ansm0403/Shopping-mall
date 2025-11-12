
import { BasePaginateDto } from '../../common/dto/paginate.dto';
import { IsNumber, IsString } from 'class-validator';

export class PaginateProductDto extends BasePaginateDto {
    @IsString()
    category: string;
}