import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductEntity } from './entity/product.entity';
import { BeautyEntity } from './entity/beauty/beauty.entity';
import { Repository } from 'typeorm';
import { beautyProducts } from '../../../mocks/src/lib/beauty/beauty';

@Injectable()
export class ProductService {
    constructor(
        @InjectRepository(ProductEntity)
        private readonly productRepository: Repository<ProductEntity>,
    ) {}

    async createProducts() {
        const beautyEntities = beautyProducts.map(product => {
            const beauty = new BeautyEntity();
            Object.assign(beauty, product);
            return beauty;
        });
        
        await this.productRepository.save(beautyEntities);
        return { message: `${beautyProducts.length}개의 뷰티 제품이 성공적으로 삽입되었습니다.` };
    }
}
