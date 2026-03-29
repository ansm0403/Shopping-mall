import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductEntity, ProductStatus } from './entity/product.entity';
import { ProductImageEntity } from './entity/product-image.entity';

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
    status: ProductStatus.PUBLISHED,
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

describe('ProductService', () => {
  let service: ProductService;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockProductRepository.createQueryBuilder.mockReturnValue(createQueryBuilder);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        { provide: getRepositoryToken(ProductEntity), useValue: mockProductRepository },
        { provide: getRepositoryToken(ProductImageEntity), useValue: mockImageRepository },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
  });

  describe('findAll', () => {
    it('상품 목록을 페이지네이션과 함께 반환한다', async () => {
      const products = [mockProduct()];
      createQueryBuilder.getManyAndCount.mockResolvedValue([products, 1]);

      const result = await service.findAll({ page: 1, take: 20 });

      expect(result.data).toEqual(products);
      expect(result.meta.total).toBe(1);
    });
  });

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

  describe('create', () => {
    it('판매자 ID로 상품을 생성한다', async () => {
      const dto = { name: '신상품', description: '설명', price: 5000, brand: '브랜드' };
      const product = mockProduct({ ...dto, sellerId: 2 });
      mockProductRepository.create.mockReturnValue(product);
      mockProductRepository.save.mockResolvedValue(product);

      const result = await service.create(dto, 2);

      expect(result.sellerId).toBe(2);
      expect(mockProductRepository.save).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('본인 상품을 수정한다', async () => {
      const product = mockProduct({ sellerId: 1 });
      const updated = mockProduct({ name: '수정됨', sellerId: 1 });
      mockProductRepository.findOne.mockResolvedValue(product);
      mockProductRepository.save.mockResolvedValue(updated);

      const result = await service.update(1, { name: '수정됨' }, 1);

      expect(result.name).toBe('수정됨');
    });

    it('타인 상품 수정 시 ForbiddenException을 던진다', async () => {
      const product = mockProduct({ sellerId: 1 });
      mockProductRepository.findOne.mockResolvedValue(product);

      await expect(service.update(1, { name: '수정' }, 2)).rejects.toThrow(ForbiddenException);
    });

    it('존재하지 않는 상품은 NotFoundException을 던진다', async () => {
      mockProductRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, {}, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('본인 상품을 삭제한다', async () => {
      const product = mockProduct({ sellerId: 1 });
      mockProductRepository.findOne.mockResolvedValue(product);
      mockProductRepository.remove.mockResolvedValue(undefined);

      await expect(service.remove(1, 1)).resolves.toBeUndefined();
      expect(mockProductRepository.remove).toHaveBeenCalledWith(product);
    });

    it('타인 상품 삭제 시 ForbiddenException을 던진다', async () => {
      const product = mockProduct({ sellerId: 1 });
      mockProductRepository.findOne.mockResolvedValue(product);

      await expect(service.remove(1, 2)).rejects.toThrow(ForbiddenException);
    });
  });
});
