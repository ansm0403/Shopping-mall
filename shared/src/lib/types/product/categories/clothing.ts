import { Product } from "../product.js";

export interface Clothing extends Product {
    size: string;
    color: string;
    material: string;
    style: string;
    gender: 'MEN' | 'WOMEN' | 'UNISEX';
    season: 'SPRING' | 'SUMMER' | 'FALL' | 'WINTER';
}