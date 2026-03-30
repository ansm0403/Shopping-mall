import { SetMetadata } from '@nestjs/common';
import { AuditAction } from '../entity/audit-log.entity';

export const AUDIT_METADATA_KEY = '__audit_metadata__';

export interface AuditOptions {
  /** 캡처할 req.body 필드명 목록 */
  captureBody?: string[];
  /** 캡처할 req.params 필드명 목록 (기본: 전부 캡처) */
  captureParams?: string[];
}

export interface AuditMetadata {
  action: AuditAction;
  options?: AuditOptions;
}

/**
 * 컨트롤러 메서드에 부착하면 AuditInterceptor가 자동으로 감사 로그를 남깁니다.
 *
 * @example
 * @Auditable(AuditAction.ORDER_CREATED, { captureBody: ['totalAmount'] })
 * createOrder(...) { ... }
 */
export const Auditable = (action: AuditAction, options?: AuditOptions) =>
  SetMetadata(AUDIT_METADATA_KEY, { action, options } as AuditMetadata);
