import { BadRequestException, Injectable } from '@nestjs/common';
import { BasePaginateDto, NumberFilterDto, PaginateFilterDto, StringFilterDto } from './dto/paginate.dto';
import {
  Brackets,
  FindManyOptions,
  FindOptionsOrder,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { BaseModel } from './entity/base.entity';
import { ConfigService } from '@nestjs/config';

type SortableKey = 'id' | 'createdAt' | 'rating' | 'price' | 'viewCount';
type SortKey<T extends BaseModel> = Extract<SortableKey, keyof T>;

@Injectable()
export class CommonService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * 범용 페이지네이션 함수
   * page가 있으면 페이지 기반, 없으면 커서 기반(무한 스크롤)
   */
  async paginate<T extends BaseModel>(
    dto: BasePaginateDto,
    repository: Repository<T>,
    path: string,
    overrideFindOptions: FindManyOptions<T> = {}
  ) {
    // dto.filter = this.normalizeFilter(dto.filter);
    const sortBy = (dto.sortBy ?? 'createdAt') as SortKey<T>;
    const sortOrder = dto.sortOrder || 'DESC';

    if (dto.page) {
      return this.pagePaginate(
        dto,
        repository,
        sortBy,
        sortOrder,
        overrideFindOptions
      );
    } else {
      return this.cursorPaginate(
        dto,
        repository,
        path,
        sortBy,
        sortOrder,
        overrideFindOptions
      );
    }
  }

  /**
   * 페이지 기반 페이지네이션
   */
  private async pagePaginate<T extends BaseModel>(
    dto: BasePaginateDto,
    repository: Repository<T>,
    sortBy: SortKey<T>,
    sortOrder: 'ASC' | 'DESC',
    overrideFindOptions: FindManyOptions<T>
  ) {
    const page = dto.page ?? 1;
    const where = this.buildWhereClause<T>(dto.filter);
    const order = this.buildOrderClause<T>(sortBy, sortOrder);

    const [data, total] = await repository.findAndCount({
      where,
      order,
      take: dto.take,
      skip: ((page ?? 1)- 1) * dto.take,
      ...overrideFindOptions,
    });

    const lastPage = Math.ceil(total / dto.take);

    return {
      data,
      meta: {
        total,
        page,
        lastPage,
        take: dto.take,
        hasNextPage: page < lastPage,
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * 커서 기반 페이지네이션 (무한 스크롤)
   * QueryBuilder를 사용하여 필터와 커서 조건을 정확히 결합
   */
  private async cursorPaginate<T extends BaseModel>(
    dto: BasePaginateDto,
    repository: Repository<T>,
    path: string,
    sortBy: SortKey<T>,
    sortOrder: 'ASC' | 'DESC',
    overrideFindOptions: FindManyOptions<T>
  ) {
    const qb = repository.createQueryBuilder('entity');

    // 1. 필터 조건 추가
    this.applyFilters(qb, dto.filter);

    // 2. 커서 조건 추가
    if (dto.cursor) {
      this.applyCursorCondition<T>(qb, dto.cursor, sortBy, sortOrder);
    }

    // 3. 정렬 조건 추가
    qb
      .orderBy(`entity.${String(sortBy)}`, sortOrder)
      .addOrderBy('entity.id', sortOrder);

    // 4. relations 추가 (overrideFindOptions에서)
    if (overrideFindOptions.relations) {
      const relations = Array.isArray(overrideFindOptions.relations)
        ? overrideFindOptions.relations
        : Object.keys(overrideFindOptions.relations);
      
      relations.forEach((relation) => {
        if (typeof relation === 'string') {
          qb.leftJoinAndSelect(`entity.${relation}`, relation);
        }
      });
    }

    // 5. take + 1로 조회 (다음 페이지 존재 여부 확인)
    qb.take(dto.take + 1);

    const data = await qb.getMany();

    const hasNext = data.length > dto.take;
    const items = hasNext ? data.slice(0, dto.take) : data;

    // 6. 다음 커서 생성
    let nextCursor: string | null = null;
    let nextUrl: string | null = null;

    if (hasNext && items.length > 0) {
      const lastItem = items[items.length - 1];
      nextCursor = this.encodeCursor(lastItem, sortBy);
      nextUrl = this.buildNextUrl<T>(dto, path, nextCursor, sortBy, sortOrder);
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

  /**
   * QueryBuilder에 필터 조건 적용
   */
  private applyFilters<T extends BaseModel>(
    qb: any,
    filter?: PaginateFilterDto
  ): void {
    if (!filter) return;

    // rating 필터
    if (filter.rating) {
      if (filter.rating.equals !== undefined) {
        qb.andWhere('entity.rating = :ratingEquals', {
          ratingEquals: filter.rating.equals,
        });
      }
      if (filter.rating.gte !== undefined && filter.rating.lte !== undefined) {
        qb.andWhere('entity.rating BETWEEN :ratingMin AND :ratingMax', {
          ratingMin: filter.rating.gte,
          ratingMax: filter.rating.lte,
        });
      } else if (filter.rating.gte !== undefined) {
        qb.andWhere('entity.rating >= :ratingGte', {
          ratingGte: filter.rating.gte,
        });
      } else if (filter.rating.gt !== undefined) {
        qb.andWhere('entity.rating > :ratingGt', {
          ratingGt: filter.rating.gt,
        });
      }
      if (filter.rating.lte !== undefined && filter.rating.gte === undefined) {
        qb.andWhere('entity.rating <= :ratingLte', {
          ratingLte: filter.rating.lte,
        });
      } else if (filter.rating.lt !== undefined) {
        qb.andWhere('entity.rating < :ratingLt', {
          ratingLt: filter.rating.lt,
        });
      }
    }

    // status 필터
    if (filter.status) {
      if (filter.status.equals !== undefined) {
        qb.andWhere('entity.status = :statusEquals', {
          statusEquals: filter.status.equals,
        });
      }
      if (filter.status.contains !== undefined) {
        qb.andWhere('entity.status LIKE :statusContains', {
          statusContains: `%${filter.status.contains}%`,
        });
      }
      if (filter.status.in !== undefined && filter.status.in.length > 0) {
        qb.andWhere('entity.status IN (:...statusIn)', {
          statusIn: filter.status.in,
        });
      }
    }

    // category 필터
    if (filter.category) {
      if (filter.category.equals !== undefined) {
        qb.andWhere('entity.category = :categoryEquals', {
          categoryEquals: filter.category.equals,
        });
      }
      if (filter.category.contains !== undefined) {
        qb.andWhere('entity.category LIKE :categoryContains', {
          categoryContains: `%${filter.category.contains}%`,
        });
      }
      if (filter.category.in !== undefined && filter.category.in.length > 0) {
        qb.andWhere('entity.category IN (:...categoryIn)', {
          categoryIn: filter.category.in,
        });
      }
    }

    // price 필터
    if (filter.price) {
      if (filter.price.equals !== undefined) {
        qb.andWhere('entity.price = :priceEquals', {
          priceEquals: filter.price.equals,
        });
      }
      if (filter.price.gte !== undefined && filter.price.lte !== undefined) {
        qb.andWhere('entity.price BETWEEN :priceMin AND :priceMax', {
          priceMin: filter.price.gte,
          priceMax: filter.price.lte,
        });
      } else if (filter.price.gte !== undefined) {
        qb.andWhere('entity.price >= :priceGte', {
          priceGte: filter.price.gte,
        });
      } else if (filter.price.gt !== undefined) {
        qb.andWhere('entity.price > :priceGt', {
          priceGt: filter.price.gt,
        });
      }
      if (filter.price.lte !== undefined && filter.price.gte === undefined) {
        qb.andWhere('entity.price <= :priceLte', {
          priceLte: filter.price.lte,
        });
      } else if (filter.price.lt !== undefined) {
        qb.andWhere('entity.price < :priceLt', {
          priceLt: filter.price.lt,
        });
      }
    }
  }

  /**
   * QueryBuilder에 커서 조건 적용
   * (sortBy < value) OR (sortBy = value AND id < lastId)
   */
  private applyCursorCondition<T extends BaseModel>(
    qb: any,
    cursor: string,
    sortBy: SortKey<T>,
    sortOrder: 'ASC' | 'DESC'
  ): void {
    try {
      const decoded = JSON.parse(
        Buffer.from(cursor, 'base64').toString('utf-8')
      );
      const { sortValue, id } = decoded;

      const sortOperator = sortOrder === 'DESC' ? '<' : '>';
      const idOperator = sortOrder === 'DESC' ? '<' : '>';

      qb.andWhere(
        new Brackets((qb) => {
          qb.where(`entity.${String(sortBy)} ${sortOperator} :cursorSortValue`, {
            cursorSortValue: sortValue,
          }).orWhere(
            new Brackets((qb) => {
              qb.where(`entity.${String(sortBy)} = :cursorSortValue`, {
                cursorSortValue: sortValue,
              }).andWhere(`entity.id ${idOperator} :cursorId`, {
                cursorId: id,
              });
            })
          );
        })
      );
    } catch (error) {
      throw new BadRequestException('Invalid cursor format');
    }
  }

  /**
   * 필터 DTO를 TypeORM Where 조건으로 변환 (페이지 기반용)
   */
  private buildWhereClause<T>(
    filter?: PaginateFilterDto
  ): FindOptionsWhere<T> {
    if (!filter) return {} as FindOptionsWhere<T>;

    const where: any = {};

    if (filter.rating) {
      where.rating = this.buildNumberFilter(filter.rating);
    }

    if (filter.status) {
      where.status = this.buildStringFilter(filter.status);
    }

    if (filter.category) {
      where.category = this.buildStringFilter(filter.category);
    }

    if (filter.price) {
      where.price = this.buildNumberFilter(filter.price);
    }

    return where as FindOptionsWhere<T>;
  }

  /**
   * NumberFilterDto를 TypeORM 조건으로 변환
   */
  private buildNumberFilter(filter: NumberFilterDto) {
    const { Equal, MoreThan, MoreThanOrEqual, LessThan, LessThanOrEqual, Between } = require('typeorm');
    
    if (filter.equals !== undefined) {
      return Equal(filter.equals);
    }
    if (filter.gte !== undefined && filter.lte !== undefined) {
      return Between(filter.gte, filter.lte);
    }
    if (filter.gte !== undefined) {
      return MoreThanOrEqual(filter.gte);
    }
    if (filter.gt !== undefined) {
      return MoreThan(filter.gt);
    }
    if (filter.lte !== undefined) {
      return LessThanOrEqual(filter.lte);
    }
    if (filter.lt !== undefined) {
      return LessThan(filter.lt);
    }
    return undefined;
  }

  /**
   * StringFilterDto를 TypeORM 조건으로 변환
   */
  private buildStringFilter(filter: StringFilterDto) {
    const { Equal, Like, In } = require('typeorm');
    
    if (filter.equals !== undefined) {
      return Equal(filter.equals);
    }
    if (filter.contains !== undefined) {
      return Like(`%${filter.contains}%`);
    }
    if (filter.in !== undefined && filter.in.length > 0) {
      return In(filter.in);
    }
    return undefined;
  }

  /**
   * 정렬 조건 생성
   */
  private buildOrderClause<T extends BaseModel>(
    sortBy: SortKey<T>,
    sortOrder: 'ASC' | 'DESC'
  ): FindOptionsOrder<T> {
    return {
      [sortBy]: sortOrder,
      id: sortOrder,
    } as FindOptionsOrder<T>;
  }

  /**
   * 커서 인코딩: 마지막 아이템의 sortBy 값과 id를 base64로 인코딩
   */
  private encodeCursor<T extends BaseModel, K extends keyof T>(item: T, sortBy: K): string {
    const cursorData = {
      sortValue: item[sortBy],
      id: item['id'],
    };
    return Buffer.from(JSON.stringify(cursorData)).toString('base64');
  }

  /**
   * 다음 페이지 URL 생성
   */
  private buildNextUrl<T extends BaseModel>(
    dto: BasePaginateDto,
    path: string,
    nextCursor: string,
    sortBy: SortKey<T>,
    sortOrder: 'ASC' | 'DESC'
  ): string {
    const protocol = this.configService.get<string>('PROTOCOL');
    const host = this.configService.get<string>('HOST');
    const url = new URL(`${protocol}://${host}/v1/${path}`);

    url.searchParams.append('take', dto.take.toString());
    url.searchParams.append('sortBy', String(sortBy));
    url.searchParams.append('sortOrder', sortOrder);
    url.searchParams.append('cursor', nextCursor);

    if (dto.filter) {
      this.appendFilterParams(url, dto.filter);
    }

    return url.toString();
  }

  /**
   * URL에 필터 파라미터 추가
   */
  private appendFilterParams(url: URL, filter: PaginateFilterDto): void {
    if (filter.rating) {
      Object.entries(filter.rating).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(`filter[rating][${key}]`, value.toString());
        }
      });
    }

    if (filter.status) {
      Object.entries(filter.status).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach((v) =>
              url.searchParams.append(`filter[status][${key}][]`, v)
            );
          } else {
            url.searchParams.append(`filter[status][${key}]`, value);
          }
        }
      });
    }

    if (filter.category) {
      Object.entries(filter.category).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach((v) =>
              url.searchParams.append(`filter[category][${key}][]`, v)
            );
          } else {
            url.searchParams.append(`filter[category][${key}]`, value);
          }
        }
      });
    }

    if (filter.price) {
      Object.entries(filter.price).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(`filter[price][${key}]`, value.toString());
        }
      });
    }
  }

  /**
   * 사용자 입력 필터를 엔티티 스키마에 맞도록 정규화
   * - enum 컬럼 등 대소문자가 고정된 필드는 여기서 맞춰준다.
   */
  // private normalizeFilter(filter?: PaginateFilterDto): PaginateFilterDto | undefined {
  //   if (!filter) {
  //     return filter;
  //   }

  //   const normalizedFilter: PaginateFilterDto = { ...filter };

  //   if (filter.category) {
  //     normalizedFilter.category = { ...filter.category };

  //     if (typeof filter.category.equals === 'string') {
  //       normalizedFilter.category.equals = filter.category.equals.toUpperCase();
  //     }

  //     if (typeof filter.category.contains === 'string') {
  //       normalizedFilter.category.contains = filter.category.contains.toUpperCase();
  //     }

  //     if (Array.isArray(filter.category.in)) {
  //       normalizedFilter.category.in = filter.category.in.map((value) =>
  //         typeof value === 'string' ? value.toUpperCase() : value
  //       );
  //     }
  //   }

  //   return normalizedFilter;
  // }
}
