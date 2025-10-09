import { BaseModel } from '../base.model.js';
import { Review } from '../review/review.js';
import { ProductType } from './product-type.js';

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
}

export interface ProductWithReviews extends Product {
  reviews?: Review[];
};
