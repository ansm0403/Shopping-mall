import { Column } from "typeorm";
import { ProductEntity } from "../product.entity";

export enum SkinType {
    OILY = 'OILY',
    DRY = 'DRY',
    COMBINATION = 'COMBINATION',
    SENSITIVE = 'SENSITIVE',
    ALL = 'ALL'
}

export class BeautyEntity extends ProductEntity {
    @Column()
    volume: number;

    @Column({
        type: 'enum',
        enum: SkinType,
        default: SkinType.ALL
    })
    skinType: SkinType;

    @Column()
    madeIn: string;
}