import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ProductService } from './product.service';
import { PaginateProductDto } from './dto/paginate-product.dto';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get('test')
  testProducts(){
    return { message: "테스트 제품 생성 완료" };
  }

  @Post('create')
  createProducts() {
    return this.productService.createProducts();
  }

  @Get('all')
  getAllProducts() {
    return this.productService.getAllProducts();
  }

  @Get('paginate')
  getPaginateProducts(
    @Query() PaginateProductDto: PaginateProductDto
  ){
    return "";
  }
}
