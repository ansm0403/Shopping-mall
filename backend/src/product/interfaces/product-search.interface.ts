import { PaginateFilterDto } from '../../common/dto/paginate.dto';
import { PageResult, CursorResult, PaginateResult } from '../../common/interfaces/paginate-result.interface';

export const PRODUCT_SEARCH_SERVICE = 'PRODUCT_SEARCH_SERVICE';

export interface ProductSearchQuery {
  keyword: string;
  tags?: string[];
  categoryId?: number;
  // 하위 카테고리까지 확장된 id 리스트. 있으면 이 쪽이 필터에 우선 사용된다.
  // (categoryId는 URL 보존/응답용으로 유지)
  categoryIds?: number[];
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
