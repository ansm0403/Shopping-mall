import { Exclude } from 'class-transformer';
import { BaseModel } from '../../common/entity/base.entity';
import { UserModel } from '../../user/entity/user.entity';
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import type { ProductEntity } from '../../product/entity/product.entity';

export enum SellerStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
}

@Entity('sellers')
export class SellerEntity extends BaseModel {
    @Column({ name: 'user_id' })
    userId: number;

    @OneToOne(() => UserModel)
    @JoinColumn({ name: 'user_id' })
    user: UserModel;

    @Column()
    businessName: string;

    @Column({ unique: true })
    businessNumber: string;

    @Column()
    representativeName: string;

    @Column()
    businessAddress: string;

    @Column({ nullable: true })
    contactEmail: string;

    @Column({ nullable: true })
    contactPhone: string;

    @Exclude()
    @Column()
    bankName: string;

    @Exclude()
    @Column()
    bankAccountNumber: string;

    @Exclude()
    @Column()
    bankAccountHolder: string;

    @Column({ type: 'enum', enum: SellerStatus, default: SellerStatus.PENDING })
    status: SellerStatus;

    @Column({ nullable: true, type: 'text' })
    rejectionReason: string | null;

    @Column({ nullable: true })
    approvedAt: Date | null;

    @OneToMany('ProductEntity', 'seller')
    products: ProductEntity[];
}
