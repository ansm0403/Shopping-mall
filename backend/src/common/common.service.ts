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

  paginate<T extends BaseModel>(
    query: BasePaginateDto,
    repository: Repository<T>,
    overrideFindOptions: FindManyOptions<T> = {},
    path: string
  ) {
    if (!query.page) {
      return this.scrollPaginate(query, repository, path, overrideFindOptions);
    } else {
      return this.pagePaginate(query, repository);
    }
  }

  private async pagePaginate<T extends BaseModel>(
    query: BasePaginateDto,
    repository: Repository<T>
  ) {
    const findOptions = this.composeOptions<T>(query);

    return repository.find({
      ...findOptions,
    });
  }

  private async scrollPaginate<T extends BaseModel>(
    query: BasePaginateDto,
    repository: Repository<T>,
    path: string,
    overrideFindOptions?: FindManyOptions<T>
  ) {
    const findOptions = this.composeOptions<T>(query);

    const datas = await repository.find({
      ...findOptions,
    });

    const lastItem =
      datas.length > 0 && datas.length === query.take
        ? datas[datas.length - 1]
        : null;

    const protocol = this.configService.get<string>(ENV_PROTOCOL_KEY);
    const host = this.configService.get<string>(ENV_HOST_KEY);

    const nextUrl = lastItem && new URL(`${protocol}://${host}/v1/${path}`);

    if (nextUrl) {
      /**
       * dto 의 키 값들을 돌면서
       * 키값에 해당되는 value 가 존재하면
       * param 에 그대로 붙여넣는다.
       *
       * 단, where__id_more_than 값만 lastItem 의 id 값
       */
      for (const key of Object.keys(query)) {
        if (query[key]) {
          if (
            key !== 'where__id__more_than' &&
            key !== 'where__id__less_than'
          ) {
            nextUrl.searchParams.append(key, query[key]);
          }
        }
      }

      let key: string | null = null;

      if (query.order__createdAt === 'ASC') {
        key = 'where__id__more_than';
      } else {
        key = 'where__id__less_than';
      }
      nextUrl.searchParams.append(key, lastItem.id.toString());
    }

    console.log('result: ', lastItem);

    return {
      data: datas,
      cursor: {
        after: lastItem?.id ?? null,
      },
      count: datas.length,
      next: nextUrl?.toString() ?? null,
    };
  }

  private composeOptions<T extends BaseModel>(
    query: BasePaginateDto
  ): FindManyOptions<T> {
    const findOptions: FindManyOptions<T> = {
      where: {} as FindOptionsWhere<T>,
      order: {} as FindOptionsOrder<T>,
      take: query.take || 20,
    };

    // where__id__more_than = 4
    // find({ where : {id : MoreThan(4) })

    // 기본 필드 제외 (page, take, order__createdAt은 별도 처리)
    const excludeKeys = ['page', 'take'];

    for (const [key, value] of Object.entries(query)) {
      if (key in excludeKeys || value === undefined || value == null) continue;

      if (key.startsWith('where__')) {
        findOptions.where = {
          ...findOptions.where,
          ...this.parseOptionFilter('where', key, value),
        };
      }
      if (key.startsWith('order__')) {
        findOptions.order = {
          ...findOptions.order,
          ...this.parseOptionFilter('order', key, value),
        };
      }
    }

    if (!findOptions.order || Object.keys(findOptions.order).length === 0) {
      findOptions.order = {
        createdAt: 'DESC',
      } as FindOptionsOrder<T>;
    }

    console.log('반환하는 옵션: ', findOptions);
    return {
      ...findOptions,
      skip: query.page ? query.take * (query.page - 1) : undefined,
    };
  }

  private parseOptionFilter<T extends BaseModel>(
    option: 'where',
    key: string,
    value: string | number
  ): FindOptionsWhere<T>;
  private parseOptionFilter<T extends BaseModel>(
    option: 'order',
    key: string,
    value: string | number
  ): FindOptionsOrder<T>;

  private parseOptionFilter<T extends BaseModel>(
    option: 'where' | 'order',
    key: string,
    value: string | number
  ): FindOptionsWhere<T> | FindOptionsOrder<T> {
    const split = key.split('__');

    if (split.length > 3 || split.length < 2) {
      throw new BadRequestException('잘못된 쿼리가 전달되었습니다.');
    }

    const findOptions: FindOptionsWhere<T> | FindOptionsOrder<T> = {};

    /**
     * 길이가 2인 경우는 where__id = 3 과 같은 형태
     *
     * findOptionsWhere로 풀어보면 아래와 같다.
     *
     * {
     *   where: {
     *      id : 3,
     *   }
     * }
     */
    if (split.length === 2) {
      const [_, field] = split;

      (findOptions as Record<string, any>)[field] = value;
    }
    if (split.length === 3) {
      const [_, field, operator] = split;

      if (!isValidFilterOperator(operator)) {
        throw new BadRequestException(`잘못된 연산자입니다: ${operator}`);
      }

      /**
       * 기본적으로 where__id__more_than = 1 은
       * id 1보다 큰 애들만 가져오는 것이니 값이 1 하나만 필요하다.
       * 하지만 예를 들어 where__id__between = 3, 4 의 경우는 Between 이라는 typeorm 유틸리티가 매개변수로 2개를 요구한다.
       * 그래서 3,4 처럼 콤마를 기준으로 split 해서 값을 가져올 것이다.
       */
      const values = String(value).split(',');

      /**
         * LIKE '%abc%'	'abc'를 포함	WHERE name LIKE '%abc%'
            LIKE 'abc%'	'abc'로 시작	WHERE name LIKE 'abc%'
            LIKE '%abc'	'abc'로 끝남	WHERE name LIKE '%abc'
            ILIKE '%abc%'	'abc' 포함 (대소문자 무시)	WHERE name ILIKE '%abc%'
         */
      switch (operator) {
        /**
         * 그룹 1: 특수 포맷 (i_like)
         */
        case 'i_like':
          (findOptions as Record<string, any>)[field] = FILTER_MAPPER[operator](
            `%${value}%` // 'values' 배열이 아닌 원본 'value' 사용
          );
          break;

        /**
         * 그룹 2: 2개의 인자 (between)
         */
        case 'between':
          if (values.length !== 2) {
            throw new BadRequestException(
              `between 연산자는 2개의 값이 필요합니다. (예: 1,10)`
            );
          }
          (findOptions as Record<string, any>)[field] = FILTER_MAPPER[operator](
            values[0],
            values[1]
          );
          break;

        /**
         * 그룹 3: 배열 인자 (in, array_*)
         */
        case 'in':
        case 'any': // 'any'는 종종 'in'과 유사하게 배열을 받습니다.
        case 'array_contains':
        case 'array_contained_by':
        case 'array_overlap':
          (findOptions as Record<string, any>)[field] =
            FILTER_MAPPER[operator](values);
          break;

        /**
         * 그룹 4: 인자 없음 (is_null)
         */
        case 'is_null':
          (findOptions as Record<string, any>)[field] =
            FILTER_MAPPER[operator]();
          break;

        /**
         * 그룹 5: 단일 값 인자 (기본)
         */
        case 'not':
        case 'less_than':
        case 'less_than_or_equal':
        case 'more_than':
        case 'more_than_or_equal':
        case 'equal':
        case 'like':
          (findOptions as Record<string, any>)[field] = FILTER_MAPPER[operator](
            values[0]
          );
          break;

        /**
         * (안전장치) isValidFilterOperator가 모든 케이스를 포함한다면
         * 이 코드는 실행되어서는 안 됩니다.
         */
        default:
          throw new BadRequestException(
            `처리되지 않은 유효한 연산자입니다: ${operator}`
          );
      }
    }
    return findOptions;
  }
}
