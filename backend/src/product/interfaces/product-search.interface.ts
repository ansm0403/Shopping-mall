import { PaginateFilterDto } from '../../common/dto/paginate.dto';
import { PageResult, CursorResult, PaginateResult } from '../../common/interfaces/paginate-result.interface';

export const PRODUCT_SEARCH_SERVICE = 'PRODUCT_SEARCH_SERVICE';

export interface ProductSearchQuery {
  keyword: string;
  tags?: string[];
  categoryId?: number;
  sellerId?: number;
  page?: number;
  take: number;
  sortBy: string;
  sortOrder: 'ASC' | 'DESC';
  cursor?: string;
  filter?: PaginateFilterDto;
}

// 기존 이름을 그대로 유지해 product-search.service.ts 의 import 가 깨지지 않도록 re-export
export type PageSearchResult = PageResult;
export type CursorSearchResult = CursorResult;
export type SearchResult = PaginateResult;

export interface IProductSearchService {
  search(query: ProductSearchQuery): Promise<SearchResult>;
}
