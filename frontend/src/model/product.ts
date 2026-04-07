export type ProductStatus = 'draft' | 'published' | 'sold_out' | 'hidden' | 'discontinued';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type SalesType = 'normal' | 'pre_order' | 'group_buy';

export interface ProductImage {
  id: number;
  url: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface ProductSeller {
  id: number;
  businessName: string;
  representativeName: string;
  status: string;
}

export interface ProductCategory {
  id: number;
  name: string;
  slug: string;
}

export interface ProductTag {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  brand: string;
  stockQuantity: number;
  status: ProductStatus;
  approvalStatus: ApprovalStatus;
  salesType: SalesType;
  rejectionReason: string | null;
  approvedAt: string | null;
  salesCount: number;
  viewCount: number;
  isEvent: boolean;
  /** 할인율 (0~100). null이면 할인 없음 */
  discountRate: number | null;
  rating: number | null;
  categoryId: number | null;
  sellerId: number | null;
  createdAt: string;
  updatedAt: string;
  seller: ProductSeller | null;
  category: ProductCategory | null;
  images: ProductImage[];
  tags: ProductTag[];
  specs?: Record<string, any>;
  reviewCount?: number;
  ratingSum?: number;
  wishCount?: number;
}

export interface PaginateMeta {
  total: number;
  page: number;
  lastPage: number;
  take: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedProducts {
  data: Product[];
  meta: PaginateMeta;
}
