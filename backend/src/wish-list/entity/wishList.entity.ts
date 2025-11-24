import { ProductEntity } from "../../product/entity/product.entity";
import { BaseModel } from "../../common/entity/base.entity";
import { Entity, OneToOne, OneToMany, JoinColumn } from "typeorm";
import { UserModel } from "../../user/entity/user.entity";

@Entity('wishLists')
export class WishListEntity extends BaseModel {
    @OneToMany(() => ProductEntity, (product) => product.wishList)
    products: ProductEntity[];

    @OneToOne(() => UserModel, (user) => user.wishList)
    @JoinColumn()
    user: UserModel;
}