import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductModule } from '../product/product.module';
import { WishListModule } from '../wish-list/wish-list.module';
import { UserModule } from '../user/user.module';
import { ReviewModule } from '../review/review.module';
import { AuthModule } from '../auth/auth.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 4321,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      autoLoadEntities: true, // 자동으로 엔티티 로드
      synchronize: true,
    }),
    AuthModule,
    ProductModule,
    ReviewModule,
    UserModule,
    WishListModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
