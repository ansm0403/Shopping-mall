import { Expose, Type } from 'class-transformer';

class SecurityPointDto {
  @Expose() date: string;          // 'YYYY-MM-DD' (KST)
  @Expose() failed: number;        // FAILED_LOGIN 건수
  @Expose() locked: number;        // ACCOUNT_LOCKED 건수
  @Expose() total: number;         // success + failed (로그인 시도 총수, locked 제외)
  @Expose() failureRate: number;   // 0~100, 소수 1자리 (total=0이면 0)
}

export class SecurityResponseDto {
  @Expose()
  @Type(() => SecurityPointDto)
  daily: SecurityPointDto[];

  @Expose()
  generatedAt: string;
}
