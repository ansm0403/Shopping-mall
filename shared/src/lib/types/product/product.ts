import { BaseModel } from '../base.model.js';
import { Review } from '../review/review.js';
import { CategorySummary } from './category.js';

export const ProductStatus = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  SOLD_OUT: 'sold_out',
  HIDDEN: 'hidden',
  DISCONTINUED: 'discontinued',
} as const;

export type ProductStatus = typeof ProductStatus[keyof typeof ProductStatus];

export interface ProductImage {
  id: number;
  url: string;
  displayOrder?: number;
  isPrimary?: boolean;
}

export interface Product extends BaseModel {
  category: CategorySummary | null;
  name: string;
  description: string;
  price: number;
  images: ProductImage[];
  brand: string;
  isEvent: boolean;
  discountRate?: number;
  rating?: number;
  status: ProductStatus;
  stockQuantity: number;
  salesCount: number;
  viewCount: number;
}

export interface ProductWithReviews extends Product {
  reviews?: Review[];
};
