import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class ApplySellerDto {
    @IsString()
    @IsNotEmpty({ message: '상호명은 필수입니다.' })
    businessName: string;

    @IsString()
    @IsNotEmpty({ message: '사업자 등록번호는 필수입니다.' })
    @Matches(/^\d{3}-\d{2}-\d{5}$/, { message: '사업자 등록번호 형식이 올바르지 않습니다. (예: 000-00-00000)' })
    businessNumber: string;

    @IsString()
    @IsNotEmpty({ message: '대표자명은 필수입니다.' })
    representativeName: string;

    @IsString()
    @IsNotEmpty({ message: '사업장 주소는 필수입니다.' })
    businessAddress: string;

    @IsEmail({}, { message: '올바른 이메일 형식을 입력해주세요.' })
    @IsOptional()
    contactEmail?: string;

    @IsString()
    @IsOptional()
    contactPhone?: string;

    @IsString()
    @IsNotEmpty({ message: '은행명은 필수입니다.' })
    bankName: string;

    @IsString()
    @IsNotEmpty({ message: '계좌번호는 필수입니다.' })
    bankAccountNumber: string;

    @IsString()
    @IsNotEmpty({ message: '예금주명은 필수입니다.' })
    bankAccountHolder: string;
}
