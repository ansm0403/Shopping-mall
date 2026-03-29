import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryEntity } from './entity/category.entity';
import { CategoryService } from './category.service';
import { CategoryController, AdminCategoryController } from './category.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CategoryEntity])],
  controllers: [CategoryController, AdminCategoryController],
  providers: [CategoryService],
  exports: [CategoryService, TypeOrmModule],
})
export class CategoryModule {}
