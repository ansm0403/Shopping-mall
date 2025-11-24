import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from './email.service';
import { EmailTemplateService } from './email-template.service';
import { SmtpEmailProvider } from './providers/smtp-email.provider';

@Module({
  imports: [ConfigModule],
  providers: [
    EmailTemplateService,
    SmtpEmailProvider,
    {
      provide: 'EMAIL_PROVIDER',
      useExisting: SmtpEmailProvider,
    },
    EmailService,
  ],
  exports: [EmailService],
})
export class EmailModule {}

