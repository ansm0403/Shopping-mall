import {
  Body,
  Controller,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { CancelPaymentDto } from './dto/cancel-payment.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../user/entity/role.entity';
import { Serialize } from '../common/interceptors/serialize.interceptor';

@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.BUYER)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('verify')
  @Serialize(PaymentResponseDto)
  verifyPayment(@Body() dto: VerifyPaymentDto, @Req() req: any) {
    return this.paymentService.verifyPayment(req.user.sub, dto);
  }

  @Post(':orderNumber/cancel')
  @Serialize(PaymentResponseDto)
  cancelPayment(
    @Param('orderNumber') orderNumber: string,
    @Body() dto: CancelPaymentDto,
    @Req() req: any,
  ) {
    return this.paymentService.cancelPayment(req.user.sub, orderNumber, dto);
  }
}
