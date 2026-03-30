import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InquiryEntity, InquiryStatus } from './entity/inquiry.entity';
import { ProductEntity } from '../product/entity/product.entity';
import { SellerEntity } from '../seller/entity/seller.entity';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { AnswerInquiryDto } from './dto/answer-inquiry.dto';
import { BasePaginateDto } from '../common/dto/paginate.dto';

@Injectable()
export class InquiryService {
  constructor(
    @InjectRepository(InquiryEntity)
    private readonly inquiryRepository: Repository<InquiryEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(SellerEntity)
    private readonly sellerRepository: Repository<SellerEntity>,
  ) {}

  // ── Buyer ──

  async create(userId: number, dto: CreateInquiryDto) {
    const product = await this.productRepository.findOne({
      where: { id: dto.productId },
    });

    if (!product) {
      throw new NotFoundException('상품을 찾을 수 없습니다.');
    }

    if (!product.sellerId) {
      throw new BadRequestException('셀러 정보가 없는 상품입니다.');
    }

    const inquiry = this.inquiryRepository.create({
      userId,
      productId: dto.productId,
      sellerId: product.sellerId,
      title: dto.title,
      content: dto.content,
      isSecret: dto.isSecret ?? false,
    });

    const saved = await this.inquiryRepository.save(inquiry);
    return this.findOneWithUser(saved.id);
  }

  async getByProduct(productId: number, userId: number | null, query: BasePaginateDto) {
    const page = query.page ?? 1;
    const take = query.take ?? 20;

    const [inquiries, total] = await this.inquiryRepository.findAndCount({
      where: { productId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * take,
      take,
    });

    // 비밀 문의: 본인 것만 content/answer 노출, 나머지는 마스킹
    const data = inquiries.map((inquiry) => {
      if (inquiry.isSecret && inquiry.userId !== userId) {
        return {
          ...inquiry,
          title: '비밀 문의입니다.',
          content: '',
          answer: null,
          user: { id: inquiry.user.id, nickName: '***' },
        };
      }
      return inquiry;
    });

    return {
      data,
      meta: { total, page, take, totalPages: Math.ceil(total / take) },
    };
  }

  async getMyInquiries(userId: number, query: BasePaginateDto) {
    const page = query.page ?? 1;
    const take = query.take ?? 20;

    const [data, total] = await this.inquiryRepository.findAndCount({
      where: { userId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * take,
      take,
    });

    return {
      data,
      meta: { total, page, take, totalPages: Math.ceil(total / take) },
    };
  }

  async delete(userId: number, inquiryId: number) {
    const inquiry = await this.inquiryRepository.findOne({
      where: { id: inquiryId },
    });

    if (!inquiry) {
      throw new NotFoundException('문의를 찾을 수 없습니다.');
    }

    if (inquiry.userId !== userId) {
      throw new ForbiddenException('본인의 문의만 삭제할 수 있습니다.');
    }

    if (inquiry.status === InquiryStatus.ANSWERED) {
      throw new BadRequestException('답변이 완료된 문의는 삭제할 수 없습니다.');
    }

    await this.inquiryRepository.remove(inquiry);
    return { message: '문의가 삭제되었습니다.' };
  }

  // ── Seller ──

  async getSellerInquiries(userId: number, query: BasePaginateDto) {
    const seller = await this.sellerRepository.findOne({ where: { userId } });
    if (!seller) {
      throw new NotFoundException('셀러 정보를 찾을 수 없습니다.');
    }

    const page = query.page ?? 1;
    const take = query.take ?? 20;

    const [data, total] = await this.inquiryRepository.findAndCount({
      where: { sellerId: seller.id },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * take,
      take,
    });

    return {
      data,
      meta: { total, page, take, totalPages: Math.ceil(total / take) },
    };
  }

  async answer(userId: number, inquiryId: number, dto: AnswerInquiryDto) {
    const seller = await this.sellerRepository.findOne({ where: { userId } });
    if (!seller) {
      throw new NotFoundException('셀러 정보를 찾을 수 없습니다.');
    }

    const inquiry = await this.inquiryRepository.findOne({
      where: { id: inquiryId },
    });

    if (!inquiry) {
      throw new NotFoundException('문의를 찾을 수 없습니다.');
    }

    if (inquiry.sellerId !== seller.id) {
      throw new ForbiddenException('본인 상품에 대한 문의만 답변할 수 있습니다.');
    }

    if (inquiry.status === InquiryStatus.ANSWERED) {
      throw new BadRequestException('이미 답변이 완료된 문의입니다.');
    }

    inquiry.answer = dto.answer;
    inquiry.answeredAt = new Date();
    inquiry.status = InquiryStatus.ANSWERED;
    await this.inquiryRepository.save(inquiry);

    return this.findOneWithUser(inquiry.id);
  }

  private async findOneWithUser(inquiryId: number) {
    return this.inquiryRepository.findOne({
      where: { id: inquiryId },
      relations: ['user'],
    });
  }
}
