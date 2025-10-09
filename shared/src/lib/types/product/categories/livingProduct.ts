
import { Product } from '../product.js';

export interface LivingProduct extends Product {
  material: string;
  usage: string;
  origin?: string;
  dimensions?: { width: number; height: number; depth: number };
  weight?: number;
  color: string;
  capacity?: number;
}
