import { Product } from "../product.js";

export interface Shoes extends Product {
    size: string;
    color: string;
    material: string;
}