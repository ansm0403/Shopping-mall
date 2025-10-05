import { BaseModel } from "../base.model.js";
import { Product } from "../product/product.js";

export interface WishList extends BaseModel {
    userId: number;
    products: Product[];
}