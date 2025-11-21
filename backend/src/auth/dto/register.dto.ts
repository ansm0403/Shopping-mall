import { PickType } from '@nestjs/mapped-types';
import { UserModel } from "../../user/entity/user.entity";
import { IsEmail } from "class-validator";

export class RegisterDto extends PickType(UserModel, [
    'email',
    'password',
    'phoneNumber',
    'name',
    'address'
]){}