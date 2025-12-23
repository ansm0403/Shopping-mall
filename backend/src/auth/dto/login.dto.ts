import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import type { LoginRequest } from '@shopping-mall/shared';

/**
 * 로그인 DTO
 * shared의 LoginRequest 인터페이스를 구현하며,
 * class-validator를 통한 런타임 검증을 제공
 */
export class LoginDto implements LoginRequest {
  @IsEmail({}, { message: '유효한 이메일 주소를 입력해주세요' })
  @IsNotEmpty({ message: '이메일은 필수 항목입니다' })
  email: string;

  @IsString({ message: '비밀번호는 문자열이어야 합니다' })
  @IsNotEmpty({ message: '비밀번호는 필수 항목입니다' })
  password: string;

  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;
}
