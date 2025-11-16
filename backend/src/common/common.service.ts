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

  async paginate<T extends BaseModel>(
    dto: BasePaginateDto,
    repository: Repository<T>,
    path: string,
    overrideFindOptions: FindManyOptions<T>
  ) {

    const sortBy = dto.sortBy || 'createdAt';
    const sortOrder = dto.sortOrder || 'DESC';

    if(!dto.page) return this.pagePaginate(dto, repository, sortBy, sortOrder, overrideFindOptions);
    else return this.cursorPaginate(dto, repository, path, sortBy, sortOrder, overrideFindOptions);
  }

  async pagePaginate<T extends BaseModel>(
    dto:BasePaginateDto,
    repository: Repository<T>,
    sortBy: string,
    sortOrder: string,
    overrideFindOptions: FindManyOptions<T>
  ) {
    

  }

  async cursorPaginate<T extends BaseModel>(
    dto:BasePaginateDto,
    repository: Repository<T>,
    path: string,
    sortBy: string,
    sortOrder: string,
    overrideFindOptions: FindManyOptions<T>
  ) {}
}
