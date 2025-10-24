import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { ReviewEntity } from './entity/review.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([ReviewEntity])],
  controllers: [ReviewController],
  providers: [ReviewService],
  exports: [TypeOrmModule],
})
export class ReviewModule {}
