import { Product } from "../product.js";

export interface Book extends Product {
    author: string;
    publisher: string;
    publicationDate: string;
    pages: number;
    genre: string;
}