import { Product } from "../product.js";

export interface Beauty extends Product {
    volume: number;
    skinType: 'OILY' | 'DRY' | 'COMBINATION' | 'SENSITIVE' | 'ALL'
    madeIn: string;  
}