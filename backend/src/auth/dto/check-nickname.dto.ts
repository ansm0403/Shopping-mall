import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

/**
 * 닉네임 중복 검증 DTO
 */
export class CheckNicknameDto {
  @IsString({ message: '닉네임은 문자열이어야 합니다' })
  @IsNotEmpty({ message: '닉네임은 필수 항목입니다' })
  @MinLength(2, { message: '닉네임은 최소 2자 이상이어야 합니다' })
  @MaxLength(20, { message: '닉네임은 최대 20자까지 입력 가능합니다' })
  nickName: string;
}
