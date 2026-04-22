/** CommonService.paginate() 페이지 기반 반환 타입 */
export interface PageResult {
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

/** CommonService.paginate() 커서 기반 반환 타입 */
export interface CursorResult {
  data: unknown[];
  meta: {
    count: number;
    hasNext: boolean;
    nextCursor: string | null;
  };
  next: string | null;
}

export type PaginateResult = PageResult | CursorResult;
