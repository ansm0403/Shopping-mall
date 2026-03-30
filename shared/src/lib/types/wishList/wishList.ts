import { BaseModel } from "../base.model.js";
import { Product } from "../product/product.js";

export interface WishListItem extends BaseModel {
    userId: number;
    productId: number;
    product?: Product;
}

/** @deprecated WishList → WishListItem으로 변경됨 */
export type WishList = WishListItem;

export interface ToggleWishlistRequest {
    productId: number;
}

export interface ToggleWishlistResponse {
    action: 'added' | 'removed';
    productId: number;
}
