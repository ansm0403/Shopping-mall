export type Category = 'CLOTHING' | 'BEAUTY' | 'SHOES' | 'BOOK' | 'FOOD' | 'OTHER' | 'LIVING';

// API 응답에서 category 필드로 반환되는 간략 카테고리 정보
export interface CategorySummary {
  id: number;
  name: string;
  slug: string;
}

export interface SubcategoryInfo {
  key: string;
  label: string;
}

export interface CategoryInfo {
  key: Category;
  label: string;
  icon?: string;
  subcategories?: SubcategoryInfo[];
}

// UI 렌더링: 드롭다운, 필터, 리스트 등을 map()으로 렌더링
export const CATEGORIES: CategoryInfo[] = [
  {
    key: 'CLOTHING',
    label: '의류',
    subcategories: [
      { key: 'SPRING', label: '봄' },
      { key: 'SUMMER', label: '여름' },
      { key: 'FALL', label: '가을' },
      { key: 'WINTER', label: '겨울' },
    ]
  },
  {
    key: 'BEAUTY',
    label: '뷰티',
    subcategories: [
      { key: 'OILY', label: '지성' },
      { key: 'DRY', label: '건성' },
      { key: 'COMBINATION', label: '복합성' },
      { key: 'SENSITIVE', label: '민감성' },
      { key: 'ALL', label: '모든 피부' },
    ]
  },
  {
    key: 'SHOES',
    label: '신발',
    subcategories: [
      { key: 'SNEAKERS', label: '스니커즈' },
      { key: 'DRESS', label: '구두' },
      { key: 'BOOTS', label: '부츠' },
      { key: 'SANDALS', label: '샌들' },
    ]
  },
  {
    key: 'BOOK',
    label: '책',
    subcategories: [
      { key: 'NOVEL', label: '소설' },
      { key: 'ESSAY', label: '에세이' },
      { key: 'SELF_HELP', label: '자기계발' },
      { key: 'COMIC', label: '만화' },
    ]
  },
  {
    key: 'FOOD',
    label: '식품',
    subcategories: [
      { key: 'SNACK', label: '과자' },
      { key: 'BEVERAGE', label: '음료' },
      { key: 'FRESH', label: '신선식품' },
      { key: 'INSTANT', label: '간편식' },
    ]
  },
  {
    key: 'LIVING',
    label: '생활용품',
  },
  {
    key: 'OTHER',
    label: '기타',
  },
] as const;

// 빠른 변환: 'CLOTHING' → '의류' O(1) 조회
export const CATEGORY_MAP: Record<Category, string> = {
  CLOTHING: '의류',
  BEAUTY: '뷰티',
  SHOES: '신발',
  BOOK: '책',
  FOOD: '식품',
  OTHER: '기타',
  LIVING: '생활용품',
} as const;
