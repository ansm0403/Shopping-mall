import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DataSource, Repository } from 'typeorm';
import { ProductEntity, ProductStatus, ApprovalStatus } from './entity/product.entity';
import { ProductImageEntity } from './entity/product-image.entity';
import { SellerEntity, SellerStatus } from '../seller/entity/seller.entity';
import { RedisService } from '../intrastructure/redis/redis.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { ProductCreatedEvent, ProductApprovedEvent, ProductRejectedEvent } from './events/product.events';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(ProductImageEntity)
    private readonly productImageRepository: Repository<ProductImageEntity>,
    @InjectRepository(SellerEntity)
    private readonly sellerRepository: Repository<SellerEntity>,
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
    private readonly redisService: RedisService,
  ) {}

  private static readonly CACHE_TTL_LIST = 60;      // 목록 60초
  private static readonly CACHE_TTL_DETAIL = 300;   // 상세 5분

  /** 승인된 셀러 조회 — 미승인이면 ForbiddenException */
  private async getApprovedSeller(userId: number): Promise<SellerEntity> {
    const seller = await this.sellerRepository.findOne({
      where: { userId, status: SellerStatus.APPROVED },
    });
    if (!seller) {
      throw new ForbiddenException('승인된 셀러만 상품을 관리할 수 있습니다.');
    }
    return seller;
  }

  /** 구매자용: APPROVED + PUBLISHED 상품만 조회 (Redis 캐싱) */
  async findAll(query: ProductQueryDto) {
    const { page = 1, take = 20, categoryId, status, sellerId } = query;

    const cacheKey = `products:list:${page}:${take}:${categoryId ?? ''}:${status ?? ''}:${sellerId ?? ''}`;
    const cached = await this.redisService.getCache(cacheKey);
    if (cached) return cached;

    const qb = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.images', 'images')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.seller', 'seller')
      .andWhere('product.approvalStatus = :approvalStatus', {
        approvalStatus: ApprovalStatus.APPROVED,
      })
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

    const result = {
      data,
      meta: { total, page, lastPage, take, hasNextPage: page < lastPage },
    };

    await this.redisService.setCache(cacheKey, result, ProductService.CACHE_TTL_LIST);
    return result;
  }

  /** 상품 상세 조회 (Redis 캐싱) */
  async findOne(id: number): Promise<ProductEntity> {
    const cacheKey = `products:detail:${id}`;
    const cached = await this.redisService.getCache<ProductEntity>(cacheKey);
    if (cached) {
      // 캐시 히트여도 viewCount는 증가
      await this.productRepository.increment({ id }, 'viewCount', 1);
      return cached;
    }

    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['images', 'category', 'seller', 'tags'],
    });
    if (!product) {
      throw new NotFoundException(`상품 ID ${id}를 찾을 수 없습니다.`);
    }
    await this.productRepository.increment({ id }, 'viewCount', 1);

    await this.redisService.setCache(cacheKey, product, ProductService.CACHE_TTL_DETAIL);
    return product;
  }

  /** 셀러: 본인 상품 목록 (모든 상태) */
  async findMyProducts(userId: number, query: ProductQueryDto) {
    const seller = await this.getApprovedSeller(userId);
    const { page = 1, take = 20, categoryId, status, approvalStatus } = query;

    const qb = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.images', 'images')
      .leftJoinAndSelect('product.category', 'category')
      .andWhere('product.sellerId = :sellerId', { sellerId: seller.id })
      .orderBy('product.createdAt', 'DESC')
      .take(take)
      .skip((page - 1) * take);

    if (categoryId) {
      qb.andWhere('product.categoryId = :categoryId', { categoryId });
    }
    if (status) {
      qb.andWhere('product.status = :status', { status });
    }
    if (approvalStatus) {
      qb.andWhere('product.approvalStatus = :approvalStatus', { approvalStatus });
    }

    const [data, total] = await qb.getManyAndCount();
    const lastPage = Math.ceil(total / take);

    return {
      data,
      meta: { total, page, lastPage, take, hasNextPage: page < lastPage },
    };
  }

  /** 셀러: 상품 등록 (approvalStatus = PENDING) */
  async create(dto: CreateProductDto, userId: number): Promise<ProductEntity> {
    const seller = await this.getApprovedSeller(userId);

    const product = await this.dataSource.transaction(async (manager) => {
      const entity = manager.create(ProductEntity, {
        name: dto.name,
        description: dto.description,
        price: dto.price,
        brand: dto.brand,
        stockQuantity: dto.stockQuantity ?? 0,
        isEvent: dto.isEvent ?? false,
        discountRate: dto.discountRate,
        categoryId: dto.categoryId ?? null,
        salesType: dto.salesType,
        sellerId: seller.id,
        status: ProductStatus.DRAFT,
        approvalStatus: ApprovalStatus.PENDING,
      });
      return manager.save(entity);
    });

    this.eventEmitter.emit('product.created', new ProductCreatedEvent(product.id, seller.id));
    return product;
  }

  /** 셀러: 본인 상품 수정 */
  async update(id: number, dto: UpdateProductDto, userId: number): Promise<ProductEntity> {
    const seller = await this.getApprovedSeller(userId);
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`상품 ID ${id}를 찾을 수 없습니다.`);
    }
    if (product.sellerId !== seller.id) {
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
      ...(dto.salesType !== undefined && { salesType: dto.salesType }),
    });

    return this.productRepository.save(product);
  }

  /** 셀러: 본인 상품 삭제 */
  async remove(id: number, userId: number): Promise<void> {
    const seller = await this.getApprovedSeller(userId);
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`상품 ID ${id}를 찾을 수 없습니다.`);
    }
    if (product.sellerId !== seller.id) {
      throw new ForbiddenException('본인의 상품만 삭제할 수 있습니다.');
    }
    await this.productRepository.remove(product);
  }

  /** 셀러: 본인 상품 이미지 추가 */
  async addImage(productId: number, userId: number, file: Express.Multer.File): Promise<ProductImageEntity> {
    const seller = await this.getApprovedSeller(userId);
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: ['images'],
    });
    if (!product) {
      throw new NotFoundException(`상품 ID ${productId}를 찾을 수 없습니다.`);
    }
    if (product.sellerId !== seller.id) {
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

  // ──────────── 관리자 메서드 ────────────

  /** 관리자: 전체 상품 조회 (모든 상태) */
  async findAllAdmin(query: ProductQueryDto) {
    const { page = 1, take = 20, categoryId, status, approvalStatus, sellerId } = query;

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
    }
    if (approvalStatus) {
      qb.andWhere('product.approvalStatus = :approvalStatus', { approvalStatus });
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

  /** 관리자: 상품 승인 */
  async approve(productId: number): Promise<ProductEntity> {
    const product = await this.dataSource.transaction(async (manager) => {
      const entity = await manager.findOne(ProductEntity, { where: { id: productId } });
      if (!entity) {
        throw new NotFoundException(`상품 ID ${productId}를 찾을 수 없습니다.`);
      }
      if (entity.approvalStatus !== ApprovalStatus.PENDING) {
        throw new BadRequestException('대기 중인 상품만 승인할 수 있습니다.');
      }

      entity.approvalStatus = ApprovalStatus.APPROVED;
      entity.approvedAt = new Date();
      entity.rejectionReason = null;
      return manager.save(entity);
    });

    this.eventEmitter.emit('product.approved', new ProductApprovedEvent(product.id, product.sellerId ?? 0));
    return product;
  }

  /** 관리자: 상품 거절 */
  async reject(productId: number, reason: string): Promise<ProductEntity> {
    const product = await this.dataSource.transaction(async (manager) => {
      const entity = await manager.findOne(ProductEntity, { where: { id: productId } });
      if (!entity) {
        throw new NotFoundException(`상품 ID ${productId}를 찾을 수 없습니다.`);
      }
      if (entity.approvalStatus !== ApprovalStatus.PENDING) {
        throw new BadRequestException('대기 중인 상품만 거절할 수 있습니다.');
      }

      entity.approvalStatus = ApprovalStatus.REJECTED;
      entity.rejectionReason = reason;
      return manager.save(entity);
    });

    this.eventEmitter.emit('product.rejected', new ProductRejectedEvent(product.id, product.sellerId ?? 0, reason));
    return product;
  }
}
