import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, IsBoolean } from 'class-validator';
import { AuditAction } from '../entity/audit-log.entity';

export class AuditLogQueryDto {
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  page?: number = 1;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  take?: number = 50;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  userId?: number;

  @IsOptional()
  @IsString()
  action?: AuditAction;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  success?: boolean;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsString()
  ipAddress?: string;
}
