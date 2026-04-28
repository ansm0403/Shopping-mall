import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModel } from '../user/entity/user.entity';
import { RoleEntity } from '../user/entity/role.entity';
import { SellerEntity } from '../seller/entity/seller.entity';
import { DashboardSeedService } from './dashboard.seed.service';

/**
 * NODE_SEED=true 일 때만 AppModule 에 등록되는 시드 모듈.
 * AppModule 의 TypeOrmModule.forRoot 가 전역 DataSource 를 제공하므로,
 * forFeature 에는 이 모듈에서 직접 쓰는 엔티티만 등록.
 */
@Module({
  imports: [TypeOrmModule.forFeature([UserModel, RoleEntity, SellerEntity])],
  providers: [DashboardSeedService],
})
export class SeedModule {}
