import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLogEntity, AuditAction } from './entity/audit-log.entity';

interface LogData {
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

  async getUserLogs(userId: number, limit = 50) {
    return this.auditLogRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
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
