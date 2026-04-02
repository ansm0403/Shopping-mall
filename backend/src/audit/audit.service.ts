import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { AuditLogEntity, AuditAction } from './entity/audit-log.entity';
import { AuditLogQueryDto } from './dto/audit-log-query.dto';
import { BasePaginateDto } from '../common/dto/paginate.dto';
import { CommonService } from '../common/common.service';

export interface LogData {
  userId?: number;
  action: AuditAction;
  ipAddress: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  success?: boolean;
  errorMessage?: string;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLogEntity)
    private readonly auditLogRepository: Repository<AuditLogEntity>,
    private readonly commonService: CommonService,
  ) {}

  async log(data: LogData): Promise<void> {
    try {
      const log = this.auditLogRepository.create({
        userId: data.userId,
        action: data.action,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        metadata: data.metadata,
        success: data.success ?? true,
        errorMessage: data.errorMessage,
      });

      await this.auditLogRepository.save(log);
    } catch (error) {
      // 로그 저장 실패는 서비스에 영향 주지 않음
      console.error('Failed to save audit log:', error);
    }
  }

  async getUserLogs(userId: number, query: BasePaginateDto) {
    return this.commonService.paginate(query, this.auditLogRepository, 'audit/user-logs', {
      where: { userId },
    });
  }

  async getAuditLogs(query: AuditLogQueryDto) {
    const { page = 1, take = 50, userId, action, success, startDate, endDate, ipAddress } = query;

    const where: any = {};

    if (userId !== undefined) where.userId = userId;
    if (action) where.action = action;
    if (success !== undefined) where.success = success;
    if (ipAddress) where.ipAddress = ipAddress;

    if (startDate && endDate) {
      where.createdAt = Between(new Date(startDate), new Date(endDate));
    } else if (startDate) {
      where.createdAt = MoreThanOrEqual(new Date(startDate));
    } else if (endDate) {
      where.createdAt = LessThanOrEqual(new Date(endDate));
    }

    const [data, total] = await this.auditLogRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      take,
      skip: (page - 1) * take,
    });

    const lastPage = Math.ceil(total / take);
    return {
      data,
      meta: { total, page, lastPage, take, hasNextPage: page < lastPage },
    };
  }

  async getFailedLoginAttempts(email: string, hours = 24) {
    const since = new Date();
    since.setHours(since.getHours() - hours);

    return this.auditLogRepository.count({
      where: {
        action: AuditAction.FAILED_LOGIN,
        metadata: { email } as any,
        success: false,
        createdAt: since as any,
      },
    });
  }
}
