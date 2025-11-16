import { BaseModel } from '../base.model.js';
import { Review } from '../review/review.js';
import { ProductType } from './product-type.js';

export const ProductStatus = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  SOLD_OUT: 'sold_out',
  HIDDEN: 'hidden',
  DISCONTINUED: 'discontinued',
} as const;

export type ProductStatus = typeof ProductStatus[keyof typeof ProductStatus];

export interface Product extends BaseModel {
  category: ProductType;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  brand: string;
  isEvent: boolean;
  discountRate?: number;
  rating: number;
  status: ProductStatus;
  stockQuantity: number;
  salesCount: number;
  viewCount: number;
}

export interface ProductWithReviews extends Product {
  reviews?: Review[];
};
