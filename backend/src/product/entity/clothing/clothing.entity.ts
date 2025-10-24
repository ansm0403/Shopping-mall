import { Column } from "typeorm";
import { ProductEntity } from "../product.entity";

export enum Gender {
    MEN = 'MEN',
    WOMEN = 'WOMEN',
    UNISEX = 'UNISEX',
}

export enum Season {
    SPRING = 'SPRING',
    SUMMER = 'SUMMER',
    FALL = 'FALL',
    WINTER = 'WINTER',
}

export class ClothingEntity extends ProductEntity {
    @Column()
    size: string;

    @Column()
    color: string;

    @Column()
    material: string;

    @Column()
    style: string;

    @Column({
        type: 'enum',
        enum: Gender,
    })
    gender: Gender;
    
    @Column({
        type: 'enum',
        enum: Season,
    })
    season: Season;
}