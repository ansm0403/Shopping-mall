import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductCategory, ProductEntity } from './entity/product.entity';
import { Repository } from 'typeorm';
import { beautyProductsData } from '../data/beauty-products';
import { clothingProductsData } from '../data/clothing-products';
import { shoesProductsData } from '../data/shoes-products';
import { bookProductsData } from '../data/book-products';
import { foodProductsData } from '../data/food-products';
import { livingProductsData } from '../data/living-products';
import { PaginateProductDto } from './dto/paginate-product.dto';
import { CommonService } from '../common/common.service';
import { BasePaginateDto } from '../common/dto/paginate.dto';


@Injectable()
export class ProductService {
    constructor(
        @InjectRepository(ProductEntity)
        private readonly productRepository: Repository<ProductEntity>,
        private readonly commonService: CommonService,
    ) {}

    async createProducts() {
        await this.productRepository.save(beautyProductsData);

        await this.productRepository.save(clothingProductsData);

        await this.productRepository.save(shoesProductsData);

        await this.productRepository.save(bookProductsData);

        await this.productRepository.save(foodProductsData);

        await this.productRepository.save(livingProductsData);

        return { message: `${beautyProductsData.length}개의 뷰티 제품, ${clothingProductsData.length}개의 의류 제품, ${shoesProductsData.length}개의 신발 제품, ${bookProductsData.length}개의 책 제품, ${foodProductsData.length}개의 음식 제품, ${livingProductsData.length}개의 생활용품이 성공적으로 삽입되었습니다.` };
    }

    async getAllProducts() {
        const books = this.productRepository.find({
            where: {
                category: ProductCategory.BOOK
            }
        });

        console.log(books);
        return books;
    }

    async paginateProduct(query: BasePaginateDto) {
        return this.commonService.paginate(
            query,
            this.productRepository,
            {},
            'product'
        )
    }
}
