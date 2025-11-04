import { IsIn, IsNumber, IsOptional } from "class-validator";

export class BasePaginateDto {
    @IsNumber()
    page: number;

    @IsNumber()
    @IsOptional()
    where__id__less_than?: number;

    @IsNumber()
    @IsOptional()
    where__id__more_than?: number;

    @IsIn(["DESC", "ASC"], {message: 'order must be either ASC or DESC'})
    @IsOptional()
    order__createdAt: 'ASC' | 'DESC' = 'DESC';

    @IsNumber()
    @IsOptional()
    take = 20;
}