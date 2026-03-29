import { BaseModel } from "../../common/entity/base.entity";
import { Column, Entity, ManyToOne, JoinColumn } from "typeorm";
import type { UserModel } from "../../user/entity/user.entity";
import type { ProductEntity } from "../../product/entity/product.entity";

@Entity('reviews')
export class ReviewEntity extends BaseModel {
    @ManyToOne(() => ProductEntity, (product) => product.reviews)
    @JoinColumn()
    product: ProductEntity;

    @ManyToOne(() => UserModel, (user) => user.reviews)
    @JoinColumn()
    user: UserModel;

    @Column()
    rating: number;

    @Column()
    comment: string;
}