import { IsString } from 'class-validator';

export class AnswerInquiryDto {
  @IsString()
  answer: string;
}
