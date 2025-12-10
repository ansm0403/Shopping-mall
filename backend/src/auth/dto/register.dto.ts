import { IsEmail, IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';
import type { RegisterRequest } from '@shopping-mall/shared';

/**
 * 회원가입 DTO
 * shared의 RegisterRequest 인터페이스를 구현하며,
 * class-validator를 통한 런타임 검증을 제공
 */
export class RegisterDto implements RegisterRequest {
  @IsEmail({}, { message: '유효한 이메일 주소를 입력해주세요' })
  @IsNotEmpty({ message: '이메일은 필수 항목입니다' })
  email: string;

  @IsString({ message: '비밀번호는 문자열이어야 합니다' })
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: '비밀번호는 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다',
  })
  @IsNotEmpty({ message: '비밀번호는 필수 항목입니다' })
  password: string;

  @IsString({ message: '닉네임은 문자열이어야 합니다' })
  @IsNotEmpty({ message: '닉네임은 필수 항목입니다' })
  nickName: string;

  @IsString({ message: '전화번호는 문자열이어야 합니다' })
  @Matches(/^01[0-9]{8,9}$/, {
    message: '전화번호는 01012345678 형식으로 입력해주세요 (- 제외)',
  })
  @IsNotEmpty({ message: '전화번호는 필수 항목입니다' })
  phoneNumber: string;

  @IsString({ message: '주소는 문자열이어야 합니다' })
  @IsNotEmpty({ message: '주소는 필수 항목입니다' })
  address: string;
}