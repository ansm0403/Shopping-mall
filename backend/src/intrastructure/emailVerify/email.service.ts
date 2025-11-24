import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { IEmailProvider } from './interfaces/email.interface';
import { EmailSendResult } from './interfaces/email.interface';
import { EmailTemplateService } from './email-template.service';

@Injectable()
export class EmailService {
  constructor(
    @Inject('EMAIL_PROVIDER')
    private readonly emailProvider: IEmailProvider,
    private readonly configService: ConfigService,
    private readonly emailTemplateService: EmailTemplateService,
  ) {}

  async sendVerificationEmail(
    email: string,
    token: string,
  ): Promise<EmailSendResult> {
    const frontendUrl =
      this.configService.get('FRONTEND_URL') || 'http://localhost:4000';
    const verificationUrl = `${frontendUrl}/v1/auth/verify-email?token=${token}`;

    const template =
      this.emailTemplateService.generateVerificationEmail(verificationUrl);

    return this.emailProvider.send({
      to: email,
      subject: '이메일 인증을 완료해주세요',
      html: template.html,
      text: template.text,
    });
  }

  async sendPasswordResetEmail(
    email: string,
    token: string,
  ): Promise<EmailSendResult> {
    const frontendUrl =
      this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/auth/reset-password?token=${token}`;

    const template =
      this.emailTemplateService.generatePasswordResetEmail(resetUrl);

    return this.emailProvider.send({
      to: email,
      subject: '비밀번호 재설정',
      html: template.html,
      text: template.text,
    });
  }
}
