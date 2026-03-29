import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartResponseDto } from './dto/cart-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../user/entity/role.entity';
import { Serialize } from '../common/interceptors/serialize.interceptor';

@Controller('cart')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.BUYER)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @Serialize(CartResponseDto)
  getMyCart(@Req() req: any) {
    return this.cartService.getMyCart(req.user.sub);
  }

  @Post('items')
  @Serialize(CartResponseDto)
  addItem(@Body() dto: AddCartItemDto, @Req() req: any) {
    return this.cartService.addItem(req.user.sub, dto);
  }

  @Patch('items/:itemId')
  @Serialize(CartResponseDto)
  updateItemQuantity(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() dto: UpdateCartItemDto,
    @Req() req: any,
  ) {
    return this.cartService.updateItemQuantity(req.user.sub, itemId, dto);
  }

  @Delete('items/:itemId')
  @Serialize(CartResponseDto)
  removeItem(@Param('itemId', ParseIntPipe) itemId: number, @Req() req: any) {
    return this.cartService.removeItem(req.user.sub, itemId);
  }

  @Delete()
  @HttpCode(204)
  clearCart(@Req() req: any) {
    return this.cartService.clearCart(req.user.sub);
  }
}
