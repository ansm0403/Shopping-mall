import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../user/entity/role.entity';
import { Serialize } from '../common/interceptors/serialize.interceptor';

/** 구매자 주문 */
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.BUYER)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @Serialize(OrderResponseDto)
  createOrder(@Body() dto: CreateOrderDto, @Req() req: any) {
    return this.orderService.createOrder(req.user.sub, dto);
  }

  @Get()
  @Serialize(OrderResponseDto)
  getMyOrders(@Query() query: OrderQueryDto, @Req() req: any) {
    return this.orderService.getMyOrders(req.user.sub, query);
  }

  @Get(':orderNumber')
  @Serialize(OrderResponseDto)
  getOrderDetail(@Param('orderNumber') orderNumber: string, @Req() req: any) {
    return this.orderService.getOrderDetail(req.user.sub, orderNumber);
  }

  @Patch(':orderNumber/cancel')
  @Serialize(OrderResponseDto)
  cancelOrder(@Param('orderNumber') orderNumber: string, @Req() req: any) {
    return this.orderService.cancelOrder(req.user.sub, orderNumber);
  }
}

/** 셀러 주문 관리 */
@Controller('seller/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SELLER)
export class SellerOrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  @Serialize(OrderResponseDto)
  getSellerOrders(@Query() query: OrderQueryDto, @Req() req: any) {
    return this.orderService.getSellerOrders(req.user.sub, query);
  }

  @Patch(':orderNumber/prepare')
  @Serialize(OrderResponseDto)
  markPreparing(@Param('orderNumber') orderNumber: string, @Req() req: any) {
    return this.orderService.markPreparing(req.user.sub, orderNumber);
  }
}

/** 관리자 주문 관리 */
@Controller('admin/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminOrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  @Serialize(OrderResponseDto)
  getAllOrders(@Query() query: OrderQueryDto) {
    return this.orderService.getAllOrders(query);
  }

  @Get(':orderNumber')
  @Serialize(OrderResponseDto)
  getOrderDetail(@Param('orderNumber') orderNumber: string) {
    return this.orderService.getOrderDetailAdmin(orderNumber);
  }
}
