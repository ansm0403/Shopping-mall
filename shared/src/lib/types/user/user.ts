import { BaseModel } from "../base.model.js";
import { Review } from "../review/review.js";
import { WishList } from "../wishList/wishList.js";

export interface User extends BaseModel {
    email: string;
    password: string;
    name: string;
    phoneNumber: string;
    address: string;
    role: 'user' | 'admin';
    wishList?: WishList;
}

export type UserWithReviews = User & {
    reviews?: Review[];
}