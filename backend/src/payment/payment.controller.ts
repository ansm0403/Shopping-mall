import {
  Body,
  Controller,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { PaymentService } from './payment.service';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { CancelPaymentDto } from './dto/cancel-payment.dto';
import { WebhookPaymentDto } from './dto/webhook-payment.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../user/entity/role.entity';
import { Serialize } from '../common/interceptors/serialize.interceptor';
import { Auditable } from '../audit/decorators/auditable.decorator';
import { AuditAction } from '../audit/entity/audit-log.entity';

@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.BUYER)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('verify')
  @Serialize(PaymentResponseDto)
  @Auditable(AuditAction.PAYMENT_VERIFIED)
  verifyPayment(@Body() dto: VerifyPaymentDto, @Req() req: any) {
    return this.paymentService.verifyPayment(req.user.sub, dto);
  }

  @Post(':orderNumber/cancel')
  @Serialize(PaymentResponseDto)
  @Auditable(AuditAction.PAYMENT_CANCELLED, { captureBody: ['reason'] })
  cancelPayment(
    @Param('orderNumber') orderNumber: string,
    @Body() dto: CancelPaymentDto,
    @Req() req: any,
  ) {
    return this.paymentService.cancelPayment(req.user.sub, orderNumber, dto);
  }
}

/** PortOne 웹훅 — 인증 없이 서버 간 통신 */
// PortOne 서버에서 오는 요청이므로 IP가 고정되지 않아 Rate Limit 제외
@SkipThrottle()
@Controller('payments')
export class PaymentWebhookController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('webhook')
  @Auditable(AuditAction.PAYMENT_WEBHOOK)
  handleWebhook(@Body() dto: WebhookPaymentDto) {
    return this.paymentService.handleWebhook(dto);
  }
}

/** 관리자 결제 관리 */
@Controller('admin/payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminPaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post(':orderNumber/cancel')
  @Serialize(PaymentResponseDto)
  @Auditable(AuditAction.PAYMENT_CANCELLED_ADMIN, { captureBody: ['reason'] })
  cancelPayment(
    @Param('orderNumber') orderNumber: string,
    @Body() dto: CancelPaymentDto,
  ) {
    return this.paymentService.cancelPaymentByAdmin(orderNumber, dto);
  }
}
