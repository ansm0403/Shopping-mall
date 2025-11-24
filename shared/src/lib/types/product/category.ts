export type Category = 'CLOTHING' | 'BEAUTY' | 'SPORTS' | 'SHOES' | 'BOOK' | 'FOOD' | 'TOYS' | 'OTHER' | 'LIVING';

export interface CategoryInfo {
  key: Category; // 실제 데이터베이스 값 ('CLOTHING', 'BEAUTY' 등)
  label: string; // 사용자에게 보여줄 한글 이름
  icon?: string; // (선택) 나중에 아이콘 추가 가능
}

// UI 렌더링: 드롭다운, 필터, 리스트 등을 map()으로 렌더링
export const CATEGORIES: CategoryInfo[] = [
  { key: 'CLOTHING', label: '의류' },
  { key: 'BEAUTY', label: '뷰티' },
  { key: 'SPORTS', label: '스포츠' },
  { key: 'SHOES', label: '신발' },
  { key: 'BOOK', label: '책' },
  { key: 'FOOD', label: '식품' },
] as const;

// 빠른 변환: 'CLOTHING' → '의류' O(1) 조회
export const CATEGORY_MAP: Record<Category, string> = {
  CLOTHING: '의류',
  BEAUTY: '뷰티',
  SPORTS: '스포츠',
  SHOES: '신발',
  BOOK: '책',
  FOOD: '식품',
  TOYS: '장난감',
  OTHER: '기타',
  LIVING: '생활용품',
} as const;