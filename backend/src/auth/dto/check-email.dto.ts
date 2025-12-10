import { IsEmail, IsNotEmpty } from 'class-validator';

/**
 * 이메일 중복 검증 DTO
 */
export class CheckEmailDto {
  @IsEmail({}, { message: '유효한 이메일 주소를 입력해주세요' })
  @IsNotEmpty({ message: '이메일은 필수 항목입니다' })
  email: string;
}
