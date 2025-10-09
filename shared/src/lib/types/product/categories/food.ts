import { Product } from "../product.js";

export interface Food extends Product {
    origin: string;
    nutrition: {
        calories: number;
        protein: number;
        fat: number;
        carbohydrate: number;
    }
}