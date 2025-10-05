import { BaseModel } from "../base.model.js";

export interface Review extends BaseModel {
    productId: number;
    userId: number;
    rating: number; // 1 to 5
    comment: string;
}