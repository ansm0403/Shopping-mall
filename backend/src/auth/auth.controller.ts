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
  Res,
  Req,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { CheckEmailDto } from './dto/check-email.dto';
import { CheckNicknameDto } from './dto/check-nickname.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { User } from './decorators/user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@User('sub') userId: number) {
    return this.authService.getMe(userId);
  }

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
  async verifyEmail(
    @Res({ passthrough: true }) res: Response,
    @Query('token') token: string,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent?: string,
    @Headers('x-device-id') deviceId?: string,
  ) {
    const result = await this.authService.verifyEmail(token, {
      ipAddress,
      userAgent,
      deviceId,
    });

    // refreshToken은 httpOnly 쿠키로 설정
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
      path: '/',
    });

    // accessToken만 응답으로 반환
    return {
      accessToken: result.accessToken,
      expiresIn: result.expiresIn,
      tokenType: result.tokenType,
      user: result.user,
    };
  }

  @Post('login')
  async login(
    @Res({ passthrough: true }) res: Response,
    @Body() body: LoginDto,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent?: string,
    @Headers('x-device-id') deviceId?: string,
  ) {
    const result = await this.authService.login(body, {
      ipAddress,
      userAgent,
      deviceId,
    });

    // refreshToken은 httpOnly 쿠키로 설정
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
      path: '/',
    });

    // accessToken만 응답으로 반환 (refreshToken 제외)
    return {
      accessToken: result.accessToken,
      expiresIn: result.expiresIn,
      tokenType: result.tokenType,
      user: result.user,
    };
  }

  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent?: string,
    @Headers('x-device-id') deviceId?: string,
  ) {
    // 쿠키에서 refreshToken 읽기
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new Error('Refresh token not found');
    }

    const result = await this.authService.refresh(refreshToken, {
      ipAddress,
      userAgent,
      deviceId,
    });

    // 새로운 refreshToken을 httpOnly 쿠키로 설정
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
      path: '/',
    });

    // accessToken만 응답으로 반환
    return {
      accessToken: result.accessToken,
      expiresIn: result.expiresIn,
      tokenType: result.tokenType,
      user: result.user,
    };
  }


  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @User('sub') userId: number,
    @Body() body: { accessToken: string },
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent?: string,
    @Headers('x-device-id') deviceId?: string,
  ) {
    // 쿠키에서 refreshToken 읽기
    const refreshToken = req.cookies?.refreshToken || '';

    const result = await this.authService.logout(userId, body.accessToken, refreshToken, {
      ipAddress,
      userAgent,
      deviceId,
    });

    // refreshToken 쿠키 삭제
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    return result;
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

  @Get('check-email')
  checkEmail(
    @Query() query: CheckEmailDto,
    @Ip() ipAddress: string,
  ) {
    return this.authService.checkEmailDuplicate(query.email, ipAddress);
  }

  @Get('check-nickname')
  checkNickname(
    @Query() query: CheckNicknameDto,
    @Ip() ipAddress: string,
  ) {
    return this.authService.checkNicknameDuplicate(query.nickName, ipAddress);
  }
}