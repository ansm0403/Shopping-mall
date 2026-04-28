import { Expose, Type } from 'class-transformer';

class KpiMetricDto {
  @Expose() value: number;
  @Expose() deltaPercent: number;
}

class KpiSimpleMetricDto {
  @Expose() value: number;
}

class KpiFailureRateDto {
  @Expose() value: number;
  @Expose() threshold: number;
}

export class KpiResponseDto {
  @Expose()
  @Type(() => KpiMetricDto)
  todayOrders: KpiMetricDto;

  @Expose()
  @Type(() => KpiMetricDto)
  todayRevenue: KpiMetricDto;

  @Expose()
  @Type(() => KpiSimpleMetricDto)
  pendingShipments: KpiSimpleMetricDto;

  @Expose()
  @Type(() => KpiFailureRateDto)
  loginFailureRate: KpiFailureRateDto;

  @Expose()
  generatedAt: string;
}
