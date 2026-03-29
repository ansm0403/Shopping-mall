import { BaseModel } from '../../common/entity/base.entity';
import { Column, Entity } from 'typeorm';

export enum Role {
    BUYER = 'buyer',
    SELLER = 'seller',
    ADMIN = 'admin',
}

@Entity('roles')
export class RoleEntity extends BaseModel {
    @Column({ type: 'enum', enum: Role, unique: true })
    name: Role;
}
