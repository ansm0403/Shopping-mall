import { BaseModel } from '../base.model.js';
import { Product } from '../product/product.js';

export interface Cart extends BaseModel {
  userId: number;
  items: CartItem[];
}

export interface CartItem extends BaseModel {
  cartId: number;
  productId: number;
  quantity: number;
  product?: Product;
}
