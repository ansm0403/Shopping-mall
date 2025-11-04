import { IsNumber, IsString } from 'class-validator';

export class PaginateProductDto {
    @IsNumber()
    page: number;
    
    @IsString()
    category: string;
}