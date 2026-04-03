import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, SelectQueryBuilder, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { ProductEntity, ApprovalStatus, ProductStatus } from './entity/product.entity';
import {
  IProductSearchService,
  ProductSearchQuery,
  SearchResult,
  PageSearchResult,
  CursorSearchResult,
} from './interfaces/product-search.interface';

type SortableKey = 'id' | 'createdAt' | 'rating' | 'price' | 'viewCount';

const SORTABLE_COLUMNS: SortableKey[] = ['id', 'createdAt', 'rating', 'price', 'viewCount'];

@Injectable()
export class TypeOrmProductSearchService implements IProductSearchService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    private readonly configService: ConfigService,
  ) {}

  async search(query: ProductSearchQuery): Promise<SearchResult> {
    // EC1: sortBy 검증 — 허용되지 않은 컬럼이면 SQL 에러 대신 명확한 400 반환
    const sortBy = this.validateSortBy(query.sortBy);

    // EC2: 빈 키워드 방어 — trim 후 빈 문자열이면 ILIKE '%%'로 전체 반환되는 것을 방지
    if (!query.keyword || query.keyword.trim().length === 0) {
      throw new BadRequestException('검색어(keyword)를 입력해주세요.');
    }

    if (query.page) {
      return this.searchWithPage(query, sortBy);
    }
    return this.searchWithCursor(query, sortBy);
  }

  // ─────────────────────────────────────────────────────
  // 페이지 기반 검색
  // ─────────────────────────────────────────────────────
  private async searchWithPage(query: ProductSearchQuery, sortBy: SortableKey): Promise<PageSearchResult> {
    const page = query.page ?? 1;
    const take = query.take;

    const qb = this.buildBaseQuery(query);

    const total = await this.countDistinct(qb.clone());

    // EC3: M:M JOIN 중복 방어 — 서브쿼리로 ID 먼저 뽑고 본 쿼리에서 relation 로드
    const idQb = qb.clone()
      .select('DISTINCT product.id', 'id')
      .orderBy(this.toColumn(sortBy), query.sortOrder)
      .addOrderBy('product.id', query.sortOrder)
      .offset((page - 1) * take)
      .limit(take);

    const idRows = await idQb.getRawMany() as { id: number }[];

    if (idRows.length === 0) {
      return { data: [], meta: { total, page, lastPage: 0, take, hasNextPage: false, hasPreviousPage: page > 1 } };
    }

    const ids = idRows.map((r) => r.id);
    const data = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.tags', 'tag')
      .leftJoinAndSelect('product.images', 'images')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.seller', 'seller')
      .whereInIds(ids)
      .orderBy(this.toColumn(sortBy), query.sortOrder)
      .addOrderBy('product.id', query.sortOrder)
      .getMany();

    const lastPage = Math.ceil(total / take);

    return {
      data,
      meta: {
        total,
        page,
        lastPage,
        take,
        hasNextPage: page < lastPage,
        hasPreviousPage: page > 1,
      },
    };
  }

  // ─────────────────────────────────────────────────────
  // 커서 기반 검색
  // ─────────────────────────────────────────────────────
  private async searchWithCursor(query: ProductSearchQuery, sortBy: SortableKey): Promise<CursorSearchResult> {
    const take = query.take;

    const qb = this.buildBaseQuery(query);

    // EC4: 커서 디코딩 실패 방어
    if (query.cursor) {
      this.applyCursor(qb, query.cursor, sortBy, query.sortOrder);
    }

    // EC3: M:M JOIN 중복 방어 — 서브쿼리로 ID 먼저 뽑기
    const idQb = qb.clone()
      .select('DISTINCT product.id', 'id')
      .addSelect(`product.${sortBy}`, 'sortVal')
      .orderBy(this.toColumn(sortBy), query.sortOrder)
      .addOrderBy('product.id', query.sortOrder)
      .limit(take + 1);

    const idRows = await idQb.getRawMany() as { id: number }[];
    const hasNext = idRows.length > take;
    const pagedIds = hasNext ? idRows.slice(0, take) : idRows;

    if (pagedIds.length === 0) {
      return { data: [], meta: { count: 0, hasNext: false, nextCursor: null }, next: null };
    }

    const ids = pagedIds.map((r) => r.id);
    const items = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.tags', 'tag')
      .leftJoinAndSelect('product.images', 'images')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.seller', 'seller')
      .whereInIds(ids)
      .orderBy(this.toColumn(sortBy), query.sortOrder)
      .addOrderBy('product.id', query.sortOrder)
      .getMany();

    let nextCursor: string | null = null;
    let nextUrl: string | null = null;

    if (hasNext && items.length > 0) {
      const last = items[items.length - 1];
      nextCursor = this.encodeCursor(last, sortBy);
      nextUrl = this.buildNextUrl(query, nextCursor, sortBy);
    }

    return {
      data: items,
      meta: {
        count: items.length,
        hasNext,
        nextCursor,
      },
      next: nextUrl,
    };
  }

  // ─────────────────────────────────────────────────────
  // 공통 QueryBuilder 조립
  // ─────────────────────────────────────────────────────
  private buildBaseQuery(query: ProductSearchQuery): SelectQueryBuilder<ProductEntity> {
    const qb = this.productRepository
      .createQueryBuilder('product')
      .leftJoin('product.tags', 'tag')
      .leftJoin('product.images', 'images')
      .leftJoin('product.category', 'category')
      .leftJoin('product.seller', 'seller')
      // 구매자 노출 조건
      .where('product.approvalStatus = :approved', { approved: ApprovalStatus.APPROVED })
      .andWhere('product.status = :published', { published: ProductStatus.PUBLISHED });

    // 1. 키워드: 제품명 OR 태그명 ILIKE
    qb.andWhere(
      new Brackets((sub) => {
        sub
          .where('product.name ILIKE :keyword', { keyword: `%${query.keyword}%` })
          .orWhere('tag.name ILIKE :keyword', { keyword: `%${query.keyword}%` });
      }),
    );

    // 2. 특정 태그 필터 (tags=블루투스,여름 → 해당 태그를 모두 가진 상품)
    if (query.tags && query.tags.length > 0) {
      query.tags.forEach((tagName, idx) => {
        const alias = `filteredTag${idx}`;
        const param = `tagName${idx}`;
        qb.andWhere(
          `EXISTS (
            SELECT 1 FROM product_tags pt${idx}
            JOIN tags ${alias} ON ${alias}.id = pt${idx}.tag_id
            WHERE pt${idx}.product_id = product.id
              AND ${alias}.name = :${param}
          )`,
          { [param]: tagName },
        );
      });
    }

    // 3. categoryId 필터
    if (query.categoryId) {
      qb.andWhere('product.categoryId = :categoryId', { categoryId: query.categoryId });
    }

    // 4. sellerId 필터
    if (query.sellerId) {
      qb.andWhere('product.sellerId = :sellerId', { sellerId: query.sellerId });
    }

    // 5. 범용 filter (price, rating 등)
    if (query.filter) {
      this.applyFilter(qb, query.filter);
    }

    return qb;
  }

  // ─────────────────────────────────────────────────────
  // 필터 적용
  // ─────────────────────────────────────────────────────
  private applyFilter(qb: SelectQueryBuilder<ProductEntity>, filter: ProductSearchQuery['filter']): void {
    if (!filter) return;

    if (filter.price) {
      const p = filter.price;
      if (p.equals !== undefined) qb.andWhere('product.price = :priceEq', { priceEq: p.equals });
      else if (p.gte !== undefined && p.lte !== undefined)
        qb.andWhere('product.price BETWEEN :priceMin AND :priceMax', { priceMin: p.gte, priceMax: p.lte });
      else if (p.gte !== undefined) qb.andWhere('product.price >= :priceGte', { priceGte: p.gte });
      else if (p.gt !== undefined) qb.andWhere('product.price > :priceGt', { priceGt: p.gt });
      if (p.lte !== undefined && p.gte === undefined)
        qb.andWhere('product.price <= :priceLte', { priceLte: p.lte });
      else if (p.lt !== undefined) qb.andWhere('product.price < :priceLt', { priceLt: p.lt });
    }

    if (filter.rating) {
      const r = filter.rating;
      if (r.equals !== undefined) qb.andWhere('product.rating = :ratingEq', { ratingEq: r.equals });
      else if (r.gte !== undefined && r.lte !== undefined)
        qb.andWhere('product.rating BETWEEN :ratingMin AND :ratingMax', { ratingMin: r.gte, ratingMax: r.lte });
      else if (r.gte !== undefined) qb.andWhere('product.rating >= :ratingGte', { ratingGte: r.gte });
      else if (r.gt !== undefined) qb.andWhere('product.rating > :ratingGt', { ratingGt: r.gt });
      if (r.lte !== undefined && r.gte === undefined)
        qb.andWhere('product.rating <= :ratingLte', { ratingLte: r.lte });
      else if (r.lt !== undefined) qb.andWhere('product.rating < :ratingLt', { ratingLt: r.lt });
    }
  }

  // ─────────────────────────────────────────────────────
  // EC4: 커서 디코딩 실패 방어
  // ─────────────────────────────────────────────────────
  private applyCursor(
    qb: SelectQueryBuilder<ProductEntity>,
    cursor: string,
    sortBy: SortableKey,
    sortOrder: 'ASC' | 'DESC',
  ): void {
    let decoded: { sortValue: unknown; id: unknown };
    try {
      decoded = JSON.parse(Buffer.from(cursor, 'base64').toString('utf-8'));
    } catch {
      throw new BadRequestException('유효하지 않은 커서 형식입니다.');
    }

    if (decoded.sortValue === undefined || decoded.id === undefined) {
      throw new BadRequestException('커서에 필수 값(sortValue, id)이 없습니다.');
    }

    const op = sortOrder === 'DESC' ? '<' : '>';

    qb.andWhere(
      new Brackets((sub) => {
        sub
          .where(`${this.toColumn(sortBy)} ${op} :cursorSort`, { cursorSort: decoded.sortValue })
          .orWhere(
            new Brackets((sub2) => {
              sub2
                .where(`${this.toColumn(sortBy)} = :cursorSort`, { cursorSort: decoded.sortValue })
                .andWhere(`product.id ${op} :cursorId`, { cursorId: decoded.id });
            }),
          );
      }),
    );
  }

  // ─────────────────────────────────────────────────────
  // DISTINCT COUNT (M:M JOIN 중복 방어)
  // ─────────────────────────────────────────────────────
  private async countDistinct(qb: SelectQueryBuilder<ProductEntity>): Promise<number> {
    const result = await qb
      .select('COUNT(DISTINCT product.id)', 'cnt')
      .getRawOne();
    return parseInt(result?.cnt ?? '0', 10);
  }

  // ─────────────────────────────────────────────────────
  // EC1: sortBy 검증
  // ─────────────────────────────────────────────────────
  private validateSortBy(sortBy: string): SortableKey {
    if (!SORTABLE_COLUMNS.includes(sortBy as SortableKey)) {
      throw new BadRequestException(
        `sortBy는 ${SORTABLE_COLUMNS.join(', ')} 중 하나여야 합니다.`,
      );
    }
    return sortBy as SortableKey;
  }

  // ─────────────────────────────────────────────────────
  // 헬퍼
  // ─────────────────────────────────────────────────────

  private toColumn(sortBy: SortableKey): string {
    return `product.${sortBy}`;
  }

  private encodeCursor(item: ProductEntity, sortBy: SortableKey): string {
    return Buffer.from(
      JSON.stringify({ sortValue: item[sortBy], id: item.id }),
    ).toString('base64');
  }

  private buildNextUrl(query: ProductSearchQuery, nextCursor: string, sortBy: SortableKey): string {
    const protocol = this.configService.get<string>('PROTOCOL');
    const host = this.configService.get<string>('HOST');
    const url = new URL(`${protocol}://${host}/v1/products`);

    url.searchParams.set('keyword', query.keyword);
    url.searchParams.set('take', query.take.toString());
    url.searchParams.set('sortBy', sortBy);
    url.searchParams.set('sortOrder', query.sortOrder);
    url.searchParams.set('cursor', nextCursor);

    if (query.tags && query.tags.length > 0) {
      url.searchParams.set('tags', query.tags.join(','));
    }
    if (query.categoryId) {
      url.searchParams.set('categoryId', String(query.categoryId));
    }

    return url.toString();
  }
}
