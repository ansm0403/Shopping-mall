import { WishListEntity } from "../../wish-list/entity/wishList.entity";
import { BaseModel } from "../../common/entity/base.entity";
import { Column, Entity, OneToMany, OneToOne } from "typeorm";
import { ReviewEntity } from "../../review/entity/review.entity";

export enum Role {
    USER = 'user',
    ADMIN = 'admin',
}

@Entity('users')
export class UserModel extends BaseModel {
    @Column()
    email: string;

    @Column()
    password: string;

    @Column()
    name: string;

    @Column()
    phoneNumber: string;
    
    @Column()
    address: string;

    @Column({
        type: 'enum',
        enum: Role, 
        default: Role.USER
    })
    role: Role;

    @OneToOne(() => WishListEntity, (wishList) => wishList.user)
    wishList: WishListEntity;

    @OneToMany(() => ReviewEntity, (review) => review.user)
    reviews: ReviewEntity[];
}