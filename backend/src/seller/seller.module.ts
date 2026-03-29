import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SellerController } from './seller.controller';
import { SellerService } from './seller.service';
import { SellerEntity } from './entity/seller.entity';
import { UserModel } from '../user/entity/user.entity';
import { RoleEntity } from '../user/entity/role.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SellerEntity, UserModel, RoleEntity]),
    AuthModule,
  ],
  controllers: [SellerController],
  providers: [SellerService],
  exports: [SellerService],
})
export class SellerModule {}
