import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../user/entity/role.entity';
import { Serialize } from '../../common/interceptors/serialize.interceptor';
import { KpiResponseDto } from './dto/kpi-response.dto';
import { OrderTrendResponseDto } from './dto/order-trend-response.dto';
import { SecurityResponseDto } from './dto/security-response.dto';
import { FunnelResponseDto } from './dto/funnel-response.dto';
import { DateRangeQueryDto, OrderTrendQueryDto } from './dto/date-range-query.dto';

@Controller('admin/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('kpi')
  @Serialize(KpiResponseDto)
  getKpi() {
    return this.dashboardService.getKpi();
  }

  @Get('order-trend')
  @Serialize(OrderTrendResponseDto)
  getOrderTrend(@Query() query: OrderTrendQueryDto) {
    return this.dashboardService.getOrderTrend(query);
  }

  @Get('security')
  @Serialize(SecurityResponseDto)
  getSecurity(@Query() query: DateRangeQueryDto) {
    return this.dashboardService.getSecurity(query);
  }

  /**
   * GET /v1/admin/dashboard/funnel
   * 결제 전환 펀넬 — orders 테이블 코호트 기준 5단계 도달률.
   * DateRangeQueryDto 재사용 (compareWithPrevious 미지원 — Phase 4 한정 의도).
   */
  @Get('funnel')
  @Serialize(FunnelResponseDto)
  getFunnel(@Query() query: DateRangeQueryDto) {
    return this.dashboardService.getFunnel(query);
  }
}
