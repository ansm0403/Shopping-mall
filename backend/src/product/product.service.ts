import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity, ProductStatus } from './entity/product.entity';
import { ProductImageEntity } from './entity/product-image.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(ProductImageEntity)
    private readonly productImageRepository: Repository<ProductImageEntity>,
  ) {}

  async findAll(query: ProductQueryDto) {
    const { page = 1, take = 20, categoryId, status, sellerId } = query;

    const qb = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.images', 'images')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.seller', 'seller')
      .orderBy('product.createdAt', 'DESC')
      .take(take)
      .skip((page - 1) * take);

    if (categoryId) {
      qb.andWhere('product.categoryId = :categoryId', { categoryId });
    }
    if (status) {
      qb.andWhere('product.status = :status', { status });
    } else {
      qb.andWhere('product.status = :status', { status: ProductStatus.PUBLISHED });
    }
    if (sellerId) {
      qb.andWhere('product.sellerId = :sellerId', { sellerId });
    }

    const [data, total] = await qb.getManyAndCount();
    const lastPage = Math.ceil(total / take);

    return {
      data,
      meta: { total, page, lastPage, take, hasNextPage: page < lastPage },
    };
  }

  async findOne(id: number): Promise<ProductEntity> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['images', 'category', 'seller', 'tags'],
    });
    if (!product) {
      throw new NotFoundException(`상품 ID ${id}를 찾을 수 없습니다.`);
    }
    await this.productRepository.increment({ id }, 'viewCount', 1);
    return product;
  }

  async create(dto: CreateProductDto, sellerId: number): Promise<ProductEntity> {
    const product = this.productRepository.create({
      name: dto.name,
      description: dto.description,
      price: dto.price,
      brand: dto.brand,
      stockQuantity: dto.stockQuantity ?? 0,
      isEvent: dto.isEvent ?? false,
      discountRate: dto.discountRate,
      categoryId: dto.categoryId ?? null,
      sellerId,
      status: ProductStatus.PUBLISHED,
    });
    return this.productRepository.save(product);
  }

  async update(id: number, dto: UpdateProductDto, sellerId: number): Promise<ProductEntity> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`상품 ID ${id}를 찾을 수 없습니다.`);
    }
    if (product.sellerId !== sellerId) {
      throw new ForbiddenException('본인의 상품만 수정할 수 있습니다.');
    }

    Object.assign(product, {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.price !== undefined && { price: dto.price }),
      ...(dto.brand !== undefined && { brand: dto.brand }),
      ...(dto.stockQuantity !== undefined && { stockQuantity: dto.stockQuantity }),
      ...(dto.isEvent !== undefined && { isEvent: dto.isEvent }),
      ...(dto.discountRate !== undefined && { discountRate: dto.discountRate }),
      ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
    });

    return this.productRepository.save(product);
  }

  async remove(id: number, sellerId: number): Promise<void> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`상품 ID ${id}를 찾을 수 없습니다.`);
    }
    if (product.sellerId !== sellerId) {
      throw new ForbiddenException('본인의 상품만 삭제할 수 있습니다.');
    }
    await this.productRepository.remove(product);
  }

  async addImage(productId: number, sellerId: number, file: Express.Multer.File): Promise<ProductImageEntity> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: ['images'],
    });
    if (!product) {
      throw new NotFoundException(`상품 ID ${productId}를 찾을 수 없습니다.`);
    }
    if (product.sellerId !== sellerId) {
      throw new ForbiddenException('본인의 상품에만 이미지를 추가할 수 있습니다.');
    }

    const isPrimary = product.images.length === 0;
    const sortOrder = product.images.length;

    const image = this.productImageRepository.create({
      url: `/uploads/${file.filename}`,
      isPrimary,
      sortOrder,
      product,
    });
    return this.productImageRepository.save(image);
  }
}
