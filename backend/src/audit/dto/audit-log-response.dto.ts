import { Expose } from 'class-transformer';

export class AuditLogResponseDto {
  @Expose()
  id: number;

  @Expose()
  userId: number;

  @Expose()
  action: string;

  @Expose()
  ipAddress: string;

  @Expose()
  userAgent: string;

  @Expose()
  metadata: Record<string, any>;

  @Expose()
  success: boolean;

  @Expose()
  errorMessage: string;

  @Expose()
  createdAt: Date;
}
