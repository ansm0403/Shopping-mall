import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { RefreshTokenEntity } from './entity/refresh-token.entity';
import { UserModel } from '../user/entity/user.entity';
import { EmailModule } from '../intrastructure/emailVerify/email.module';
import { AuditModule } from '../audit/audit.module';
import { RedisModule } from '../intrastructure/redis/redis.module';

@Module({
  imports: [
    ConfigModule,
    RedisModule.forRoot(),
    EmailModule,
    AuditModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: '15m',
        },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([RefreshTokenEntity, UserModel]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
