import {
  Body,
  Controller,
  Post,
  Get,
  Delete,
  Query,
  Param,
  Ip,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { User } from './decorators/user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(
    @Body() body: RegisterDto,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent?: string,
    @Headers('x-device-id') deviceId?: string,
  ) {
    return this.authService.register(body, {
      ipAddress,
      userAgent,
      deviceId,
    });
  }

  @Get('verify-email')
  verifyEmail(
    @Query('token') token: string,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent?: string,
    @Headers('x-device-id') deviceId?: string,
  ) {
    return this.authService.verifyEmail(token, {
      ipAddress,
      userAgent,
      deviceId,
    });
  }

  @Post('login')
  login(
    @Body() body: { email: string; password: string },
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent?: string,
    @Headers('x-device-id') deviceId?: string,
  ) {
    return this.authService.login(body, {
      ipAddress,
      userAgent,
      deviceId,
    });
  }

  @Post('refresh')
  refresh(
    @Body() body: { refreshToken: string },
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent?: string,
    @Headers('x-device-id') deviceId?: string,
  ) {
    return this.authService.refresh(body.refreshToken, {
      ipAddress,
      userAgent,
      deviceId,
    });
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  logout(
    @User('sub') userId: number,
    @Body() body: { accessToken: string; refreshToken: string },
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent?: string,
    @Headers('x-device-id') deviceId?: string,
  ) {
    return this.authService.logout(userId, body.accessToken, body.refreshToken, {
      ipAddress,
      userAgent,
      deviceId,
    });
  }

  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  logoutAllDevices(
    @User('sub') userId: number,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent?: string,
    @Headers('x-device-id') deviceId?: string,
  ) {
    return this.authService.logoutAllDevices(userId, {
      ipAddress,
      userAgent,
      deviceId,
    });
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  getActiveSessions(@User('sub') userId: number) {
    return this.authService.getActiveSessions(userId);
  }

  @Delete('sessions/:tokenId')
  @UseGuards(JwtAuthGuard)
  revokeSession(
    @User('sub') userId: number,
    @Param('tokenId') tokenId: string,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent?: string,
    @Headers('x-device-id') deviceId?: string,
  ) {
    return this.authService.revokeSession(userId, tokenId, {
      ipAddress,
      userAgent,
      deviceId,
    });
  }
}