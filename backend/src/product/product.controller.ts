import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ProductService } from './product.service';
import { PaginateProductDto } from './dto/paginate-product.dto';
import { CommonService } from '../common/common.service';
import { BasePaginateDto } from '../common/dto/paginate.dto';

@Controller('product')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly CommonService: CommonService
  ) {}

  @Get('test')
  testProducts() {
    return { message: '테스트 제품 생성 완료' };
  }

  @Post('create')
  createProducts() {
    return this.productService.createProducts();
  }

  @Get('all')
  getAllProducts() {
    return this.productService.getAllProducts();
  }

  @Get()
  getPaginateProducts(@Query() query: PaginateProductDto) {
    console.log("페이지네이션 가동, 쿼리 : ", query);
    console.log(query instanceof BasePaginateDto);
    return this.productService.paginateProduct(query);
  }
}
