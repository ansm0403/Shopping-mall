import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ProductModule } from '../product/product.module';
import { WishListModule } from '../wish-list/wish-list.module';
import { UserModule } from '../user/user.module';
import { ReviewModule } from '../review/review.module';
import { AuthModule } from '../auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { RoleEntity } from '../user/entity/role.entity';
import { RolesSeedService } from '../common/seeds/roles.seed';
import { CategoryEntity } from '../category/entity/category.entity';
import { CategorySeedService } from '../common/seeds/category.seed';
import { SellerModule } from '../seller/seller.module';
import { CategoryModule } from '../category/category.module';
import { CartModule } from '../cart/cart.module';
import { OrderModule } from '../order/order.module';
import { PaymentModule } from '../payment/payment.module';
import { SettlementModule } from '../settlement/settlement.module';
import { InquiryModule } from '../inquiry/inquiry.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        // 글로벌 기본: IP당 1분에 100회
        // 봇은 이를 초과, 일반 사용자는 이 이내
        ttl: 60000,
        limit: 100,
      },
    ]),
    EventEmitterModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '4321', 10),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      autoLoadEntities: true,
      synchronize: true,
    }),
    TypeOrmModule.forFeature([RoleEntity, CategoryEntity]),
    AuthModule,
    SellerModule,
    CategoryModule,
    ProductModule,
    ReviewModule,
    UserModule,
    WishListModule,
    CartModule,
    OrderModule,
    PaymentModule,
    SettlementModule,
    InquiryModule,
    AuditModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    RolesSeedService,
    CategorySeedService,
    // 모든 HTTP 엔드포인트에 ThrottlerGuard를 전역 적용
    // 개별 엔드포인트에서 @Throttle()로 override, @SkipThrottle()로 제외 가능
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
