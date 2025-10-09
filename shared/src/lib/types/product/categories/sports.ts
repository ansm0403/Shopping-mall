import { Product } from "../product.js";

export interface Sports extends Product {
    sportType: 'BASKETBALL' | 'SOCCER' | 'TENNIS' | 'RUNNING' | 'GYM' | 'OTHER';
    size: string;
    color: string;
    material: string;
}