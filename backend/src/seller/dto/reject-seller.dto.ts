import { IsNotEmpty, IsString } from 'class-validator';

export class RejectSellerDto {
    @IsString()
    @IsNotEmpty({ message: '거절 사유는 필수입니다.' })
    reason: string;
}
