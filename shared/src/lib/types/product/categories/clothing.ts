import { Product } from "../product.js";

export const Gender = {
    MEN: 'MEN',
    WOMEN: 'WOMEN',
    UNISEX: 'UNISEX',
} as const;

export type Gender = typeof Gender[keyof typeof Gender];

export const Season = {
    SPRING: 'SPRING',
    SUMMER: 'SUMMER',
    FALL: 'FALL',
    WINTER: 'WINTER',
} as const;

export type Season = typeof Season[keyof typeof Season];

export interface Clothing extends Product {
    size: string;
    color: string;
    material: string;
    style: string;
    gender: Gender;
    season: Season;
}