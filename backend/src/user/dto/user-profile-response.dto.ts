import { Exclude, Expose, Type } from 'class-transformer';
import { BaseModel } from '../../common/entity/base.entity';

class RoleDto {
  @Expose()
  name: string;
}

export class UserProfileResponseDto extends BaseModel {
  @Expose()
  email: string;

  @Exclude()
  password: string;

  @Expose()
  nickName: string;

  @Expose()
  phoneNumber: string;

  @Expose()
  address: string;

  @Expose()
  isEmailVerified: boolean;

  @Expose()
  @Type(() => RoleDto)
  roles: RoleDto[];
}
