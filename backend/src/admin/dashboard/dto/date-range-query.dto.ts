import { IsISO8601, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * 대시보드 모든 엔드포인트의 공통 기간 쿼리 DTO.
 * - YYYY-MM-DD 형식만 허용 (KST 기준 자정으로 해석)
 * - 추가 검증 (startDate ≤ endDate, 90일 제한)은 서비스 레이어에서 수행
 */
export class DateRangeQueryDto {
  @IsISO8601({ strict: true }, { message: 'startDate는 YYYY-MM-DD 형식이어야 합니다.' })
  startDate: string;

  @IsISO8601({ strict: true }, { message: 'endDate는 YYYY-MM-DD 형식이어야 합니다.' })
  endDate: string;
}

/** order-trend 전용 — compare 옵션 추가 */
export class OrderTrendQueryDto extends DateRangeQueryDto {
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  compareWithPrevious?: boolean = false;
}
