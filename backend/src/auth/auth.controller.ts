import {
  Body,
  Controller,
  Post,
  Get,
  Query,
  Ip,
  Headers,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';

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
}