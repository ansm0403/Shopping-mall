import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ProductSeedService } from '../common/seeds/product.seed';
import { ProductEntity, ProductStatus } from './entity/product.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

const mockProduct = (overrides: Partial<ProductEntity> = {}): ProductEntity =>
  ({
    id: 1,
    name: '테스트 상품',
    description: '설명',
    price: 10000,
    brand: '브랜드',
    stockQuantity: 10,
    isEvent: false,
    status: ProductStatus.PUBLISHED,
    sellerId: 1,
    categoryId: null,
    images: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as ProductEntity);

const mockProductService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  addImage: jest.fn(),
};

const mockSeedService = {
  seedProducts: jest.fn(),
};

describe('ProductController', () => {
  let controller: ProductController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        { provide: ProductService, useValue: mockProductService },
        { provide: ProductSeedService, useValue: mockSeedService },
      ],
    })
      .overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard).useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ProductController>(ProductController);
  });

  describe('findAll', () => {
    it('상품 목록을 반환한다', async () => {
      const response = { data: [mockProduct()], meta: { total: 1, page: 1, lastPage: 1, take: 20, hasNextPage: false } };
      mockProductService.findAll.mockResolvedValue(response);

      const result = await controller.findAll({ page: 1, take: 20 });

      expect(result).toEqual(response);
    });
  });

  describe('findOne', () => {
    it('특정 상품을 반환한다', async () => {
      const product = mockProduct();
      mockProductService.findOne.mockResolvedValue(product);

      const result = await controller.findOne(1);

      expect(result).toEqual(product);
    });

    it('없는 상품은 NotFoundException을 던진다', async () => {
      mockProductService.findOne.mockRejectedValue(new NotFoundException());

      await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('상품을 생성한다', async () => {
      const dto = { name: '신상품', description: '설명', price: 5000, brand: '브랜드' };
      const product = mockProduct({ ...dto });
      mockProductService.create.mockResolvedValue(product);

      const req = { user: { sellerId: 1 } };
      const result = await controller.create(dto, req);

      expect(result).toEqual(product);
      expect(mockProductService.create).toHaveBeenCalledWith(dto, 1);
    });
  });

  describe('update', () => {
    it('상품을 수정한다', async () => {
      const updated = mockProduct({ name: '수정됨' });
      mockProductService.update.mockResolvedValue(updated);

      const req = { user: { sellerId: 1 } };
      const result = await controller.update(1, { name: '수정됨' }, req);

      expect(result).toEqual(updated);
      expect(mockProductService.update).toHaveBeenCalledWith(1, { name: '수정됨' }, 1);
    });
  });

  describe('remove', () => {
    it('상품을 삭제한다', async () => {
      mockProductService.remove.mockResolvedValue(undefined);

      const req = { user: { sellerId: 1 } };
      await expect(controller.remove(1, req)).resolves.toBeUndefined();
    });
  });
});
