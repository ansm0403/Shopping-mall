import { BaseModel } from "../base.model.js";

export interface Review extends BaseModel {
    productId: number;
    userId: number;
    orderId: number;
    rating: number; // 1 to 5
    comment: string;
    imageUrls: string[];
}

export interface CreateReviewRequest {
    orderId: number;
    productId: number;
    rating: number;
    comment: string;
    imageUrls?: string[];
}

export interface UpdateReviewRequest {
    rating?: number;
    comment?: string;
    imageUrls?: string[];
}

export interface ReviewResponse extends Review {
    user: {
        id: number;
        nickName: string;
    };
}
