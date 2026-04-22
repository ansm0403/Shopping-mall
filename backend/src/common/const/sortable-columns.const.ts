/**
 * 페이지네이션/검색에서 허용하는 정렬 컬럼.
 * SQL 인젝션 방어용 화이트리스트이기도 하니 새 컬럼 추가 시 엔티티에 실제로 존재하는지 확인할 것.
 */
export const SORTABLE_COLUMNS = ['id', 'createdAt', 'rating', 'price', 'viewCount'] as const;

export type SortableKey = (typeof SORTABLE_COLUMNS)[number];
