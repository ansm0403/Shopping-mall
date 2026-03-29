import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProductController, AdminProductController } from './product.controller';
import { ProductService } from './product.service';
import { ProductSeedService } from '../common/seeds/product.seed';
import { ProductEntity, ProductStatus, ApprovalStatus, SalesType } from './entity/product.entity';
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
    status: ProductStatus.DRAFT,
    approvalStatus: ApprovalStatus.PENDING,
    salesType: SalesType.NORMAL,
    rejectionReason: null,
    approvedAt: null,
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
  findMyProducts: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  addImage: jest.fn(),
  findAllAdmin: jest.fn(),
  approve: jest.fn(),
  reject: jest.fn(),
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

  describe('findMyProducts', () => {
    it('셀러 본인 상품 목록을 반환한다', async () => {
      const response = { data: [mockProduct()], meta: { total: 1, page: 1, lastPage: 1, take: 20, hasNextPage: false } };
      mockProductService.findMyProducts.mockResolvedValue(response);

      const req = { user: { sub: 100 } };
      const result = await controller.findMyProducts({ page: 1, take: 20 }, req);

      expect(result).toEqual(response);
      expect(mockProductService.findMyProducts).toHaveBeenCalledWith(100, { page: 1, take: 20 });
    });
  });

  describe('create', () => {
    it('상품을 생성한다 (userId 전달)', async () => {
      const dto = { name: '신상품', description: '설명', price: 5000, brand: '브랜드' };
      const product = mockProduct({ ...dto });
      mockProductService.create.mockResolvedValue(product);

      const req = { user: { sub: 100 } };
      const result = await controller.create(dto, req);

      expect(result).toEqual(product);
      expect(mockProductService.create).toHaveBeenCalledWith(dto, 100);
    });
  });

  describe('update', () => {
    it('상품을 수정한다 (userId 전달)', async () => {
      const updated = mockProduct({ name: '수정됨' });
      mockProductService.update.mockResolvedValue(updated);

      const req = { user: { sub: 100 } };
      const result = await controller.update(1, { name: '수정됨' }, req);

      expect(result).toEqual(updated);
      expect(mockProductService.update).toHaveBeenCalledWith(1, { name: '수정됨' }, 100);
    });
  });

  describe('remove', () => {
    it('상품을 삭제한다 (userId 전달)', async () => {
      mockProductService.remove.mockResolvedValue(undefined);

      const req = { user: { sub: 100 } };
      await expect(controller.remove(1, req)).resolves.toBeUndefined();
      expect(mockProductService.remove).toHaveBeenCalledWith(1, 100);
    });
  });
});

describe('AdminProductController', () => {
  let controller: AdminProductController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminProductController],
      providers: [
        { provide: ProductService, useValue: mockProductService },
      ],
    })
      .overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard).useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AdminProductController>(AdminProductController);
  });

  describe('findAll', () => {
    it('관리자용 전체 상품 목록을 반환한다', async () => {
      const response = { data: [mockProduct()], meta: { total: 1, page: 1, lastPage: 1, take: 20, hasNextPage: false } };
      mockProductService.findAllAdmin.mockResolvedValue(response);

      const result = await controller.findAll({ page: 1, take: 20 });

      expect(result).toEqual(response);
      expect(mockProductService.findAllAdmin).toHaveBeenCalledWith({ page: 1, take: 20 });
    });
  });

  describe('approve', () => {
    it('상품을 승인한다', async () => {
      const product = mockProduct({ approvalStatus: ApprovalStatus.APPROVED });
      mockProductService.approve.mockResolvedValue(product);

      const result = await controller.approve(1);

      expect(result).toEqual(product);
      expect(mockProductService.approve).toHaveBeenCalledWith(1);
    });
  });

  describe('reject', () => {
    it('상품을 거절한다', async () => {
      const product = mockProduct({ approvalStatus: ApprovalStatus.REJECTED, rejectionReason: '사유' });
      mockProductService.reject.mockResolvedValue(product);

      const result = await controller.reject(1, { reason: '사유' });

      expect(result).toEqual(product);
      expect(mockProductService.reject).toHaveBeenCalledWith(1, '사유');
    });
  });
});
