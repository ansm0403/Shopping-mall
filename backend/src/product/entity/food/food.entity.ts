import { Column } from "typeorm";
import { ProductEntity } from "../product.entity";

export class FoodEntity extends ProductEntity {
    @Column()
    origin: string;

    @Column()
    nutrition: {
        calories: number;
        protein: number;
        fat: number;
        carbohydrate: number;
    }
}