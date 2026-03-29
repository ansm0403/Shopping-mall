import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ProductService } from './product.service';
import { ProductEntity, ProductStatus, ApprovalStatus, SalesType } from './entity/product.entity';
import { ProductImageEntity } from './entity/product-image.entity';
import { SellerEntity, SellerStatus } from '../seller/entity/seller.entity';
import { RedisService } from '../intrastructure/redis/redis.service';

const mockProduct = (overrides: Partial<ProductEntity> = {}): ProductEntity =>
  ({
    id: 1,
    name: '테스트 상품',
    description: '설명',
    price: 10000,
    brand: '브랜드',
    stockQuantity: 10,
    isEvent: false,
    discountRate: null,
    rating: null,
    specs: {},
    status: ProductStatus.DRAFT,
    approvalStatus: ApprovalStatus.PENDING,
    salesType: SalesType.NORMAL,
    rejectionReason: null,
    approvedAt: null,
    salesCount: 0,
    viewCount: 0,
    sellerId: 1,
    categoryId: null,
    images: [],
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as ProductEntity);

const mockSeller = (overrides: Partial<SellerEntity> = {}): SellerEntity =>
  ({
    id: 1,
    userId: 100,
    businessName: '테스트 사업자',
    status: SellerStatus.APPROVED,
    ...overrides,
  } as SellerEntity);

const createQueryBuilder: any = {
  leftJoinAndSelect: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
};

const mockProductRepository = {
  createQueryBuilder: jest.fn().mockReturnValue(createQueryBuilder),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  increment: jest.fn(),
};

const mockImageRepository = {
  create: jest.fn(),
  save: jest.fn(),
};

const mockSellerRepository = {
  findOne: jest.fn(),
};

/** 트랜잭션 내부에서 사용되는 EntityManager mock */
const mockManager = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
};

const mockDataSource = {
  transaction: jest.fn((cb: (manager: any) => Promise<any>) => cb(mockManager)),
};

const mockEventEmitter = {
  emit: jest.fn(),
};

const mockRedisService = {
  getCache: jest.fn().mockResolvedValue(null),
  setCache: jest.fn().mockResolvedValue(undefined),
  delCache: jest.fn().mockResolvedValue(undefined),
  delCacheByPattern: jest.fn().mockResolvedValue(undefined),
};

describe('ProductService', () => {
  let service: ProductService;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockProductRepository.createQueryBuilder.mockReturnValue(createQueryBuilder);
    createQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);
    mockDataSource.transaction.mockImplementation((cb: (manager: any) => Promise<any>) => cb(mockManager));
    mockRedisService.getCache.mockResolvedValue(null);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        { provide: getRepositoryToken(ProductEntity), useValue: mockProductRepository },
        { provide: getRepositoryToken(ProductImageEntity), useValue: mockImageRepository },
        { provide: getRepositoryToken(SellerEntity), useValue: mockSellerRepository },
        { provide: DataSource, useValue: mockDataSource },
        { provide: EventEmitter2, useValue: mockEventEmitter },
        { provide: RedisService, useValue: mockRedisService },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
  });

  // ──────────── 구매자 조회 ────────────

  describe('findAll', () => {
    it('상품 목록을 페이지네이션과 함께 반환한다', async () => {
      const products = [mockProduct({ approvalStatus: ApprovalStatus.APPROVED, status: ProductStatus.PUBLISHED })];
      createQueryBuilder.getManyAndCount.mockResolvedValue([products, 1]);

      const result = await service.findAll({ page: 1, take: 20 });

      expect(result.data).toEqual(products);
      expect(result.meta.total).toBe(1);
    });

    it('기본적으로 approvalStatus=APPROVED 필터를 적용한다', async () => {
      await service.findAll({ page: 1, take: 20 });

      expect(createQueryBuilder.andWhere).toHaveBeenCalledWith(
        'product.approvalStatus = :approvalStatus',
        { approvalStatus: ApprovalStatus.APPROVED },
      );
    });
  });

  // ──────────── 상세 조회 ────────────

  describe('findOne', () => {
    it('존재하는 상품을 반환하고 viewCount를 증가시킨다', async () => {
      const product = mockProduct();
      mockProductRepository.findOne.mockResolvedValue(product);
      mockProductRepository.increment.mockResolvedValue(undefined);

      const result = await service.findOne(1);

      expect(result).toEqual(product);
      expect(mockProductRepository.increment).toHaveBeenCalledWith({ id: 1 }, 'viewCount', 1);
    });

    it('존재하지 않으면 NotFoundException을 던진다', async () => {
      mockProductRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ──────────── 셀러: 본인 상품 목록 ────────────

  describe('findMyProducts', () => {
    it('승인된 셀러의 본인 상품 목록을 반환한다', async () => {
      const seller = mockSeller({ id: 1, userId: 100 });
      mockSellerRepository.findOne.mockResolvedValue(seller);
      const products = [mockProduct({ sellerId: 1 })];
      createQueryBuilder.getManyAndCount.mockResolvedValue([products, 1]);

      const result = await service.findMyProducts(100, { page: 1, take: 20 });

      expect(result.data).toEqual(products);
      expect(createQueryBuilder.andWhere).toHaveBeenCalledWith(
        'product.sellerId = :sellerId',
        { sellerId: 1 },
      );
    });

    it('미승인 셀러는 ForbiddenException을 던진다', async () => {
      mockSellerRepository.findOne.mockResolvedValue(null);

      await expect(service.findMyProducts(100, {})).rejects.toThrow(ForbiddenException);
    });
  });

  // ──────────── 셀러: 상품 등록 ────────────

  describe('create', () => {
    it('승인된 셀러가 상품을 등록하면 PENDING 상태로 생성된다', async () => {
      const seller = mockSeller({ id: 1, userId: 100 });
      mockSellerRepository.findOne.mockResolvedValue(seller);

      const dto = { name: '신상품', description: '설명', price: 5000, brand: '브랜드' };
      const product = mockProduct({ ...dto, sellerId: 1 });
      mockManager.create.mockReturnValue(product);
      mockManager.save.mockResolvedValue(product);

      const result = await service.create(dto, 100);

      expect(result.sellerId).toBe(1);
      expect(mockManager.create).toHaveBeenCalledWith(
        ProductEntity,
        expect.objectContaining({
          status: ProductStatus.DRAFT,
          approvalStatus: ApprovalStatus.PENDING,
          sellerId: 1,
        }),
      );
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'product.created',
        expect.objectContaining({ productId: 1, sellerId: 1 }),
      );
    });

    it('미승인 셀러는 상품을 등록할 수 없다', async () => {
      mockSellerRepository.findOne.mockResolvedValue(null);
      const dto = { name: '신상품', description: '설명', price: 5000, brand: '브랜드' };

      await expect(service.create(dto, 100)).rejects.toThrow(ForbiddenException);
    });
  });

  // ──────────── 셀러: 상품 수정 ────────────

  describe('update', () => {
    it('본인 상품을 수정한다', async () => {
      const seller = mockSeller({ id: 1, userId: 100 });
      mockSellerRepository.findOne.mockResolvedValue(seller);

      const product = mockProduct({ sellerId: 1 });
      const updated = mockProduct({ name: '수정됨', sellerId: 1 });
      mockProductRepository.findOne.mockResolvedValue(product);
      mockProductRepository.save.mockResolvedValue(updated);

      const result = await service.update(1, { name: '수정됨' }, 100);

      expect(result.name).toBe('수정됨');
    });

    it('타인 상품 수정 시 ForbiddenException을 던진다', async () => {
      const seller = mockSeller({ id: 2, userId: 200 });
      mockSellerRepository.findOne.mockResolvedValue(seller);

      const product = mockProduct({ sellerId: 1 });
      mockProductRepository.findOne.mockResolvedValue(product);

      await expect(service.update(1, { name: '수정' }, 200)).rejects.toThrow(ForbiddenException);
    });

    it('존재하지 않는 상품은 NotFoundException을 던진다', async () => {
      const seller = mockSeller({ id: 1, userId: 100 });
      mockSellerRepository.findOne.mockResolvedValue(seller);
      mockProductRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, {}, 100)).rejects.toThrow(NotFoundException);
    });
  });

  // ──────────── 셀러: 상품 삭제 ────────────

  describe('remove', () => {
    it('본인 상품을 삭제한다', async () => {
      const seller = mockSeller({ id: 1, userId: 100 });
      mockSellerRepository.findOne.mockResolvedValue(seller);

      const product = mockProduct({ sellerId: 1 });
      mockProductRepository.findOne.mockResolvedValue(product);
      mockProductRepository.remove.mockResolvedValue(undefined);

      await expect(service.remove(1, 100)).resolves.toBeUndefined();
      expect(mockProductRepository.remove).toHaveBeenCalledWith(product);
    });

    it('타인 상품 삭제 시 ForbiddenException을 던진다', async () => {
      const seller = mockSeller({ id: 2, userId: 200 });
      mockSellerRepository.findOne.mockResolvedValue(seller);

      const product = mockProduct({ sellerId: 1 });
      mockProductRepository.findOne.mockResolvedValue(product);

      await expect(service.remove(1, 200)).rejects.toThrow(ForbiddenException);
    });
  });

  // ──────────── 관리자: 전체 조회 ────────────

  describe('findAllAdmin', () => {
    it('모든 상태의 상품을 조회한다', async () => {
      const products = [
        mockProduct({ approvalStatus: ApprovalStatus.PENDING }),
        mockProduct({ id: 2, approvalStatus: ApprovalStatus.APPROVED }),
      ];
      createQueryBuilder.getManyAndCount.mockResolvedValue([products, 2]);

      const result = await service.findAllAdmin({ page: 1, take: 20 });

      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
    });

    it('approvalStatus 필터를 적용할 수 있다', async () => {
      createQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAllAdmin({ page: 1, take: 20, approvalStatus: ApprovalStatus.PENDING });

      expect(createQueryBuilder.andWhere).toHaveBeenCalledWith(
        'product.approvalStatus = :approvalStatus',
        { approvalStatus: ApprovalStatus.PENDING },
      );
    });
  });

  // ──────────── 관리자: 승인 ────────────

  describe('approve', () => {
    it('대기 중인 상품을 승인한다', async () => {
      const product = mockProduct({ approvalStatus: ApprovalStatus.PENDING });
      mockManager.findOne.mockResolvedValue(product);
      mockManager.save.mockResolvedValue({
        ...product,
        approvalStatus: ApprovalStatus.APPROVED,
        approvedAt: expect.any(Date),
      });

      await service.approve(1);

      expect(mockManager.save).toHaveBeenCalledWith(
        expect.objectContaining({
          approvalStatus: ApprovalStatus.APPROVED,
        }),
      );
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'product.approved',
        expect.objectContaining({ productId: 1 }),
      );
    });

    it('이미 승인된 상품은 BadRequestException을 던진다', async () => {
      const product = mockProduct({ approvalStatus: ApprovalStatus.APPROVED });
      mockManager.findOne.mockResolvedValue(product);

      await expect(service.approve(1)).rejects.toThrow(BadRequestException);
    });

    it('존재하지 않는 상품은 NotFoundException을 던진다', async () => {
      mockManager.findOne.mockResolvedValue(null);

      await expect(service.approve(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ──────────── 관리자: 거절 ────────────

  describe('reject', () => {
    it('대기 중인 상품을 거절하고 사유를 기록한다', async () => {
      const product = mockProduct({ approvalStatus: ApprovalStatus.PENDING });
      mockManager.findOne.mockResolvedValue(product);
      mockManager.save.mockResolvedValue({
        ...product,
        approvalStatus: ApprovalStatus.REJECTED,
        rejectionReason: '상품 설명 부족',
      });

      await service.reject(1, '상품 설명 부족');

      expect(mockManager.save).toHaveBeenCalledWith(
        expect.objectContaining({
          approvalStatus: ApprovalStatus.REJECTED,
          rejectionReason: '상품 설명 부족',
        }),
      );
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'product.rejected',
        expect.objectContaining({ productId: 1, reason: '상품 설명 부족' }),
      );
    });

    it('이미 거절된 상품은 BadRequestException을 던진다', async () => {
      const product = mockProduct({ approvalStatus: ApprovalStatus.REJECTED });
      mockManager.findOne.mockResolvedValue(product);

      await expect(service.reject(1, '사유')).rejects.toThrow(BadRequestException);
    });
  });
});
