import { Column } from "typeorm";
import { ProductEntity } from "../product.entity";

export class LivingProductEntity extends ProductEntity {
    @Column()
    material: string;

    @Column()
    usage: string;

    @Column()
    origin?: string;

    @Column()
    dimensions?: {
        width: number;
        height: number;
        depth: number;
    }

    @Column()
    weight?: number;

    @Column()
    color: string;

    @Column()
    capacity?: number;
}