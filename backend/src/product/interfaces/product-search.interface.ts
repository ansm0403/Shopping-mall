import { PaginateFilterDto } from '../../common/dto/paginate.dto';

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

/** 페이지 기반 반환 타입 — CommonService.paginate() 페이지 기반과 동일 */
export interface PageSearchResult {
  data: unknown[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
    take: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/** 커서 기반 반환 타입 — CommonService.paginate() 커서 기반과 동일 */
export interface CursorSearchResult {
  data: unknown[];
  meta: {
    count: number;
    hasNext: boolean;
    nextCursor: string | null;
  };
  next: string | null;
}

export type SearchResult = PageSearchResult | CursorSearchResult;

export interface IProductSearchService {
  search(query: ProductSearchQuery): Promise<SearchResult>;
}
