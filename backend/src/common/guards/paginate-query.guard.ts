import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { FILTER_MAPPER } from '../const/filter-mapper.const';

@Injectable()
export class PaginateQueryGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const query = request.query;

    const allowedKeys = ['page', 'take', 'order__createdAt'];
    const allowedPrefixes = ['where__', 'order__'];

    // 모든 쿼리 파라미터 검증
    for (const key of Object.keys(query)) {
      // 기본 허용 키는 통과
      if (allowedKeys.includes(key)) {
        continue;
      }

      // where__ 또는 order__로 시작하는지 확인
      if (!allowedPrefixes.some(prefix => key.startsWith(prefix))) {
        throw new BadRequestException(
          `Invalid query parameter: "${key}". Only "where__field__filter" and "order__field" formats are allowed.`
        );
      }

      // where__ 형식인 경우 필터 타입 검증
      if (key.startsWith('where__')) {
        const whereParts = key.replace('where__', '').split('__');
        if (whereParts.length < 2) {
          throw new BadRequestException(
            `Invalid where filter format: "${key}". Expected format: "where__field__filterType"`
          );
        }
        const filterType = whereParts.slice(1).join('__');
        if (!FILTER_MAPPER[filterType as keyof typeof FILTER_MAPPER]) {
          throw new BadRequestException(
            `Unknown filter type: "${filterType}". Available filters: ${Object.keys(FILTER_MAPPER).join(', ')}`
          );
        }
      }

      // order__ 형식인 경우 값이 ASC 또는 DESC인지 확인
      if (key.startsWith('order__')) {
        const orderValue = query[key];
        if (orderValue !== 'ASC' && orderValue !== 'DESC') {
          throw new BadRequestException(
            `Invalid order value for "${key}": "${orderValue}". Must be "ASC" or "DESC".`
          );
        }
      }
    }

    return true;
  }
}

