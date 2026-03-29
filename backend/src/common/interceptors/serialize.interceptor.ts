import {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
  SetMetadata,
  UseInterceptors,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { plainToInstance } from 'class-transformer';

const SERIALIZE_TYPE_KEY = '__serialize_type__';

/**
 * 컨트롤러 메서드에 @Serialize(Dto)를 붙이면
 * 응답을 해당 DTO 형태로 직렬화합니다.
 *
 * 페이지네이션 응답 { data: T[], meta } 도 자동 처리합니다.
 */
export function Serialize(dto: new (...args: any[]) => any) {
  return function (target: any, key?: string, descriptor?: PropertyDescriptor) {
    SetMetadata(SERIALIZE_TYPE_KEY, dto)(target, key!, descriptor!);
    UseInterceptors(new SerializeInterceptor(dto))(target, key!, descriptor!);
  };
}

class SerializeInterceptor implements NestInterceptor {
  constructor(private readonly dto: new (...args: any[]) => any) {}

  intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        if (data && data.data && data.meta) {
          return {
            data: this.transform(data.data),
            meta: data.meta,
          };
        }
        return this.transform(data);
      }),
    );
  }

  private transform(data: any) {
    return plainToInstance(this.dto, data, {
      excludeExtraneousValues: true,
    });
  }
}
