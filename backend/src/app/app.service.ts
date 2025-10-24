import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from '../product/entity/product.entity';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) {}
  getData(): { message: string } {
    return { message: 'Hello API' };
  }

  createProduct() {
    this.productRepository.save({

    })
    this.productRepository.save({

    })
    this.productRepository.save({

    })
    this.productRepository.save({

    })
    this.productRepository.save({

    })
    this.productRepository.save({

    })
  }
}
