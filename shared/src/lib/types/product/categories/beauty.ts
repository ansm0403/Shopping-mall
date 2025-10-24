import { Product } from "../product.js";

export const SkinType = {
    OILY: 'OILY',
    DRY: 'DRY',
    COMBINATION: 'COMBINATION',
    SENSITIVE: 'SENSITIVE',
    ALL: 'ALL'
} as const;

export type SkinType = typeof SkinType[keyof typeof SkinType];

export interface Beauty extends Product {
    volume: number;
    skinType: SkinType;
    madeIn: string;  
}