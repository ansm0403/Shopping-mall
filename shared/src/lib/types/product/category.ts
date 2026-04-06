export type Category =
  | 'CLOTHING' | 'BEAUTY' | 'SHOES' | 'BOOK' | 'FOOD' | 'OTHER' | 'LIVING'
  | 'clothing' | 'clothing-spring' | 'clothing-summer' | 'clothing-fall' | 'clothing-winter'
  | 'beauty' | 'beauty-oily' | 'beauty-dry' | 'beauty-combination' | 'beauty-sensitive' | 'beauty-all'
  | 'shoes' | 'shoes-sneakers' | 'shoes-dress' | 'shoes-boots' | 'shoes-sandals'
  | 'book' | 'book-novel' | 'book-essay' | 'book-self-help' | 'book-comic'
  | 'food' | 'food-snack' | 'food-beverage' | 'food-fresh' | 'food-instant'
  | 'living';

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
  clothing: '의류',
  'clothing-spring': '봄',
  'clothing-summer': '여름',
  'clothing-fall': '가을',
  'clothing-winter': '겨울',
  beauty: '뷰티',
  'beauty-oily': '지성',
  'beauty-dry': '건성',
  'beauty-combination': '복합성',
  'beauty-sensitive': '민감성',
  'beauty-all': '모든 피부',
  shoes: '신발',
  'shoes-sneakers': '스니커즈',
  'shoes-dress': '구두',
  'shoes-boots': '부츠',
  'shoes-sandals': '샌들',
  book: '책',
  'book-novel': '소설',
  'book-essay': '에세이',
  'book-self-help': '자기계발',
  'book-comic': '만화',
  food: '식품',
  'food-snack': '과자',
  'food-beverage': '음료',
  'food-fresh': '신선식품',
  'food-instant': '간편식',
  living: '생활용품',
} as const;
