import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { AuditService } from '../audit.service';
import {
  AUDIT_METADATA_KEY,
  AuditMetadata,
} from '../decorators/auditable.decorator';

/**
 * @Auditable() 데코레이터가 붙은 핸들러의 요청/응답을 자동으로 감사 로깅합니다.
 * APP_INTERCEPTOR로 글로벌 등록되지만, 데코레이터가 없는 핸들러는 무시합니다.
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly auditService: AuditService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const metadata = this.reflector.get<AuditMetadata>(
      AUDIT_METADATA_KEY,
      context.getHandler(),
    );

    // @Auditable이 없으면 패스스루
    if (!metadata) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const { action, options } = metadata;

    const userId = request.user?.sub ?? null;
    const ipAddress =
      request.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      request.ip ||
      'unknown';
    const userAgent = request.headers['user-agent'] ?? null;

    // 메타데이터 구성
    const auditMeta: Record<string, any> = {};

    // params는 기본 전부 캡처, 또는 명시된 것만
    const params = request.params ?? {};
    if (options?.captureParams) {
      for (const key of options.captureParams) {
        if (params[key] !== undefined) auditMeta[key] = params[key];
      }
    } else {
      Object.assign(auditMeta, params);
    }

    // body는 명시된 필드만 캡처
    if (options?.captureBody && request.body) {
      for (const key of options.captureBody) {
        if (request.body[key] !== undefined) auditMeta[key] = request.body[key];
      }
    }

    return next.handle().pipe(
      tap(() => {
        this.auditService
          .log({
            userId,
            action,
            ipAddress,
            userAgent,
            metadata: Object.keys(auditMeta).length > 0 ? auditMeta : undefined,
            success: true,
          })
          .catch((err) =>
            this.logger.error(`감사 로그 저장 실패: ${err.message}`),
          );
      }),
      catchError((error) => {
        this.auditService
          .log({
            userId,
            action,
            ipAddress,
            userAgent,
            metadata: Object.keys(auditMeta).length > 0 ? auditMeta : undefined,
            success: false,
            errorMessage:
              error instanceof Error ? error.message : String(error),
          })
          .catch((err) =>
            this.logger.error(`감사 로그 저장 실패: ${err.message}`),
          );

        return throwError(() => error);
      }),
    );
  }
}
