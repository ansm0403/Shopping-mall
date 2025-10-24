import { BaseModel } from "../../common/entity/base.entity";
import { Column, Entity, ManyToOne, JoinColumn } from "typeorm";
import { UserEntity } from "../../user/entity/user.entity";
import { ProductEntity } from "../../product/entity/product.entity";

@Entity('reviews')
export class ReviewEntity extends BaseModel {
    @ManyToOne(() => ProductEntity, (product) => product.reviews)
    @JoinColumn()
    product: ProductEntity;

    @ManyToOne(() => UserEntity, (user) => user.reviews)
    @JoinColumn()
    user: UserEntity;

    @Column()
    rating: number;

    @Column()
    comment: string;
}