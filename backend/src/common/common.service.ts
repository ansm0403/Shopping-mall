import { Injectable } from '@nestjs/common';
import { BasePaginateDto } from './dto/paginate.dto';
import { FindManyOptions, Repository } from 'typeorm';
import { BaseModel } from './entity/base.entity';
import { FILTER_MAPPER } from './const/filter-mapper.const';

@Injectable()
export class CommonService {
    paginate<T extends BaseModel>(
        query: BasePaginateDto,
        repository: Repository<T>,
        overrideFindOptions: FindManyOptions<T> = {},
        path: string
    ){
        if(!query.page) {
            return this.scrollPaginate(query, repository, overrideFindOptions);
        } else {
            return this.pagePaginate(query, repository);
        }
    }

    scrollPaginate<T extends BaseModel>(
        query: BasePaginateDto,
        repository: Repository<T>,
        overrideFindOptions?: FindManyOptions<T>
    ) {
        // TODO: 스크롤 페이지네이션 구현
        return Promise.resolve([]);
    }

    pagePaginate<T extends BaseModel>(
        query: BasePaginateDto,
        repository: Repository<T>
    ) {
        const findOptions = this.composeOptions<T>(query);

        return repository.find(findOptions);
    }

    composeOptions<T extends BaseModel>(query: BasePaginateDto): FindManyOptions<T> {
        const findOptions: FindManyOptions<T> = {
            where: {} as any,
            order: {},
            take: query.take || 20,
        };

        // 기본 필드 제외 (page, take, order__createdAt은 별도 처리)
        const excludeKeys = ['page', 'take'];
        const allowedPrefixes = ['where__', 'order__'];
        
        for (const [key, value] of Object.entries(query)) {
            if (excludeKeys.includes(key) || value === undefined || value === null) {
                continue;
            }

            // 허용된 형식이 아닌 키는 무시 (또는 에러 던지기)
            if (!allowedPrefixes.some(prefix => key.startsWith(prefix)) && !excludeKeys.includes(key)) {
                // 알 수 없는 키는 무시 (또는 에러를 던지려면 아래 주석 해제)
                // throw new BadRequestException(`Unknown query parameter: ${key}. Only 'where__' and 'order__' prefixes are allowed.`);
                continue;
            }

            // where__필드명__필터타입 형식 파싱
            if (key.startsWith('where__')) {
                const whereParts = key.replace('where__', '').split('__');
                
                if (whereParts.length >= 2) {
                    const fieldName = whereParts[0];
                    const filterType = whereParts.slice(1).join('__'); // more_than, less_than_or_equal 등
                    
                    const FilterClass = FILTER_MAPPER[filterType as keyof typeof FILTER_MAPPER];
                    
                    if (FilterClass) {
                        // where 객체에 필터 적용
                        if (!findOptions.where) {
                            findOptions.where = {} as any;
                        }
                        
                        // Between은 배열을 받아야 함 [min, max]
                        if (filterType === 'between' && Array.isArray(value) && value.length === 2) {
                            (findOptions.where as any)[fieldName] = (FilterClass as any)(value[0], value[1]);
                        } else {
                            // 대부분의 필터는 단일 값을 받음
                            (findOptions.where as any)[fieldName] = (FilterClass as any)(value);
                        }
                    } else {
                        // FILTER_MAPPER에 없는 경우 직접 값 할당 (Equal과 동일)
                        if (!findOptions.where) {
                            findOptions.where = {} as any;
                        }
                        (findOptions.where as any)[fieldName] = value;
                    }
                }
            }
            // order__필드명 형식 파싱
            else if (key.startsWith('order__')) {
                const fieldName = key.replace('order__', '');
                const orderValue = value as 'ASC' | 'DESC';
                
                if (orderValue === 'ASC' || orderValue === 'DESC') {
                    (findOptions.order as any)[fieldName] = orderValue;
                }
            }
        }

        return findOptions;
    }
}
