import { Column } from "typeorm";
import { ProductEntity } from "../product.entity";

export class ShoesEntity extends ProductEntity {
    @Column()
    size: string;

    @Column()
    color: string;

    @Column()
    material: string;
}