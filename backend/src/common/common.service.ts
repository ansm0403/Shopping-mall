import { BadRequestException, Injectable } from '@nestjs/common';
import { BasePaginateDto } from './dto/paginate.dto';
import {
  FindManyOptions,
  FindOptionsOrder,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { BaseModel } from './entity/base.entity';
import {
  FILTER_MAPPER,
  isValidFilterOperator,
} from './const/filter-mapper.const';
import { ConfigService } from '@nestjs/config';
import { find } from 'rxjs';
import { ENV_HOST_KEY, ENV_PROTOCOL_KEY } from './const/env-keys.const';

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
    // sortBy 기본값 설정
    const sortBy = dto.sortBy || 'createdAt';
    const sortOrder = dto.sortOrder || 'DESC';

    if (dto.page) {
      return this.pagePaginate(dto, repository, sortBy, sortOrder, overrideFindOptions);
    } else {
      return this.cursorPaginate(dto, repository, path, sortBy, sortOrder, overrideFindOptions);
    }
  }

  /**
   * 페이지 기반 페이지네이션
   */
  private async pagePaginate<T extends BaseModel>(
    dto: BasePaginateDto,
    repository: Repository<T>,
    sortBy: string,
    sortOrder: 'ASC' | 'DESC',
    overrideFindOptions: FindManyOptions<T>
  ) {
    const where = this.buildWhereClause<T>(dto.filter);
    const order = this.buildOrderClause<T>(sortBy, sortOrder);

    const [data, total] = await repository.findAndCount({
      where,
      order,
      take: dto.take,
      skip: (dto.page - 1) * dto.take,
      ...overrideFindOptions,
    });

    const lastPage = Math.ceil(total / dto.take);

    return {
      data,
      meta: {
        total,
        page: dto.page,
        lastPage,
        take: dto.take,
        hasNextPage: dto.page < lastPage,
        hasPreviousPage: dto.page > 1,
      },
    };
  }

  /**
   * 커서 기반 페이지네이션 (무한 스크롤)
   */
  private async cursorPaginate<T extends BaseModel>(
    dto: BasePaginateDto,
    repository: Repository<T>,
    path: string,
    sortBy: string,
    sortOrder: 'ASC' | 'DESC',
    overrideFindOptions: FindManyOptions<T>
  ) {
    // 커서 디코딩
    let cursorWhere: FindOptionsWhere<T> = {};
    if (dto.cursor) {
      cursorWhere = this.decodeCursor<T>(dto.cursor, sortBy, sortOrder);
    }

    // 필터 조건 빌드
    const filterWhere = this.buildWhereClause<T>(dto.filter);

    // 커서 조건과 필터 조건 병합
    const where = this.mergeWhereConditions<T>(cursorWhere, filterWhere, sortBy, sortOrder);

    const order = this.buildOrderClause<T>(sortBy, sortOrder);

    // take + 1로 조회하여 다음 페이지 존재 여부 확인
    const data = await repository.find({
      where,
      order,
      take: dto.take + 1,
      ...overrideFindOptions,
    });

    const hasNext = data.length > dto.take;
    const items = hasNext ? data.slice(0, dto.take) : data;

    // 다음 커서 생성
    let nextCursor: string | null = null;
    let nextUrl: string | null = null;

    if (hasNext && items.length > 0) {
      const lastItem = items[items.length - 1];
      nextCursor = this.encodeCursor(lastItem, sortBy);
      nextUrl = this.buildNextUrl(dto, path, nextCursor, sortBy, sortOrder);
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
   * 필터 DTO를 TypeORM Where 조건으로 변환
   */
  private buildWhereClause<T>(filter?: PaginateFilterDto): FindOptionsWhere<T> {
    if (!filter) return {} as FindOptionsWhere<T>;

    const where: any = {};

    // rating 필터
    if (filter.rating) {
      where.rating = this.buildNumberFilter(filter.rating);
    }

    // status 필터
    if (filter.status) {
      where.status = this.buildStringFilter(filter.status);
    }

    // category 필터
    if (filter.category) {
      where.category = this.buildStringFilter(filter.category);
    }

    // price 필터
    if (filter.price) {
      where.price = this.buildNumberFilter(filter.price);
    }

    return where as FindOptionsWhere<T>;
  }

  /**
   * NumberFilterDto를 TypeORM 조건으로 변환
   */
  private buildNumberFilter(filter: NumberFilterDto) {
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
  private buildOrderClause<T>(
    sortBy: string,
    sortOrder: 'ASC' | 'DESC'
  ): FindOptionsOrder<T> {
    return {
      [sortBy]: sortOrder,
      id: sortOrder, // 타이브레이커: 동일한 값일 때 id로 정렬
    } as FindOptionsOrder<T>;
  }

  /**
   * 커서 인코딩: 마지막 아이템의 sortBy 값과 id를 base64로 인코딩
   */
  private encodeCursor<T>(item: T, sortBy: string): string {
    const cursorData = {
      sortValue: item[sortBy],
      id: item['id'],
    };
    return Buffer.from(JSON.stringify(cursorData)).toString('base64');
  }

  /**
   * 커서 디코딩: base64 커서를 TypeORM Where 조건으로 변환
   */
  private decodeCursor<T>(
    cursor: string,
    sortBy: string,
    sortOrder: 'ASC' | 'DESC'
  ): FindOptionsWhere<T> {
    try {
      const decoded = JSON.parse(
        Buffer.from(cursor, 'base64').toString('utf-8')
      );

      // 커서 기반 Where 조건은 mergeWhereConditions에서 처리
      return {
        _cursorData: decoded, // 임시 저장
      } as any;
    } catch (error) {
      throw new BadRequestException('Invalid cursor format');
    }
  }

  /**
   * 커서 조건과 필터 조건을 병합
   * 커서 페이지네이션: (sortBy > value) OR (sortBy = value AND id > lastId)
   */
  private mergeWhereConditions<T>(
    cursorWhere: FindOptionsWhere<T>,
    filterWhere: FindOptionsWhere<T>,
    sortBy: string,
    sortOrder: 'ASC' | 'DESC'
  ): FindOptionsWhere<T>[] | FindOptionsWhere<T> {
    const cursorData = (cursorWhere as any)?._cursorData;

    // 커서가 없으면 필터만 반환
    if (!cursorData) {
      return filterWhere;
    }

    const { sortValue, id } = cursorData;
    const operator = sortOrder === 'DESC' ? LessThan : MoreThan;
    const equalOperator = sortOrder === 'DESC' ? LessThan : MoreThan;

    // 커서 조건: (sortBy < sortValue) OR (sortBy = sortValue AND id < id)
    return [
      {
        ...filterWhere,
        [sortBy]: operator(sortValue),
      },
      {
        ...filterWhere,
        [sortBy]: Equal(sortValue),
        id: equalOperator(id),
      },
    ] as FindOptionsWhere<T>[];
  }

  /**
   * 다음 페이지 URL 생성
   */
  private buildNextUrl(
    dto: BasePaginateDto,
    path: string,
    nextCursor: string,
    sortBy: string,
    sortOrder: 'ASC' | 'DESC'
  ): string {
    const protocol = this.configService.get<string>(ENV_PROTOCOL_KEY);
    const host = this.configService.get<string>(ENV_HOST_KEY);
    const url = new URL(`${protocol}://${host}/v1/${path}`);

    // 기본 파라미터
    url.searchParams.append('take', dto.take.toString());
    url.searchParams.append('sortBy', sortBy);
    url.searchParams.append('sortOrder', sortOrder);
    url.searchParams.append('cursor', nextCursor);

    // 필터 파라미터 추가
    if (dto.filter) {
      this.appendFilterParams(url, dto.filter);
    }

    return url.toString();
  }

  /**
   * URL에 필터 파라미터 추가
   */
  private appendFilterParams(url: URL, filter: PaginateFilterDto) {
    // rating 필터
    if (filter.rating) {
      Object.entries(filter.rating).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(`filter[rating][${key}]`, value.toString());
        }
      });
    }

    // status 필터
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

    // category 필터
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

    // price 필터
    if (filter.price) {
      Object.entries(filter.price).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(`filter[price][${key}]`, value.toString());
        }
      });
    }
  }
}
