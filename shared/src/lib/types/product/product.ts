import { BaseModel } from '../base.model.js';

export type Product =
  | (BaseModel & {
      category: string;
      name: string;
      description: string;
      price: number;
      imageUrl: string;
      isEvent: true;
      discountRate: number; // 필수
    })
  | (BaseModel & {
      category: string;
      name: string;
      description: string;
      price: number;
      imageUrl: string;
      isEvent: false;
      discountRate?: number; // 선택적
    });
