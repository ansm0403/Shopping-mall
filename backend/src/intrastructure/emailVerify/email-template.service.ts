import { Injectable } from '@nestjs/common';

export interface EmailTemplate {
  html: string;
  text: string;
}

@Injectable()
export class EmailTemplateService {
  generateVerificationEmail(verificationUrl: string): EmailTemplate {
    return {
      html: this.getVerificationEmailHtml(verificationUrl),
      text: this.getVerificationEmailText(verificationUrl),
    };
  }

  generatePasswordResetEmail(resetUrl: string): EmailTemplate {
    return {
      html: this.getPasswordResetEmailHtml(resetUrl),
      text: this.getPasswordResetEmailText(resetUrl),
    };
  }

  private getVerificationEmailHtml(verificationUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 40px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #2563eb;
            margin: 0;
            font-size: 28px;
          }
          .content {
            margin-bottom: 30px;
          }
          .button {
            display: inline-block;
            padding: 14px 28px;
            background-color: #2563eb;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            text-align: center;
            margin: 20px 0;
          }
          .button:hover {
            background-color: #1d4ed8;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 14px;
            color: #6b7280;
          }
          .token-info {
            background-color: #f3f4f6;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
            font-size: 14px;
            color: #4b5563;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>이메일 인증</h1>
          </div>
          <div class="content">
            <p>안녕하세요,</p>
            <p>회원가입을 환영합니다! 아래 버튼을 클릭하여 이메일 인증을 완료해주세요.</p>
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">이메일 인증하기</a>
            </div>
            <div class="token-info">
              <strong>주의사항:</strong>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>이 링크는 1시간 동안 유효합니다.</li>
                <li>버튼이 작동하지 않으면 아래 링크를 복사하여 브라우저에 붙여넣으세요.</li>
              </ul>
              <div style="word-break: break-all; margin-top: 10px;">
                <a href="${verificationUrl}" style="color: #2563eb;">${verificationUrl}</a>
              </div>
            </div>
            <p>본인이 요청하지 않은 이메일이라면 무시하셔도 됩니다.</p>
          </div>
          <div class="footer">
            <p>이 이메일은 자동으로 발송되었습니다. 답장하지 말아주세요.</p>
            <p>&copy; ${new Date().getFullYear()} Shopping Mall. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getVerificationEmailText(verificationUrl: string): string {
    return `
이메일 인증을 완료해주세요.

아래 링크를 클릭하여 인증을 완료하세요:
${verificationUrl}

이 링크는 1시간 동안 유효합니다.

본인이 요청하지 않은 이메일이라면 무시하셔도 됩니다.

© ${new Date().getFullYear()} Shopping Mall. All rights reserved.
    `.trim();
  }

  private getPasswordResetEmailHtml(resetUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 40px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #dc2626;
            margin: 0;
            font-size: 28px;
          }
          .content {
            margin-bottom: 30px;
          }
          .button {
            display: inline-block;
            padding: 14px 28px;
            background-color: #dc2626;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            text-align: center;
            margin: 20px 0;
          }
          .button:hover {
            background-color: #b91c1c;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 14px;
            color: #6b7280;
          }
          .warning {
            background-color: #fef2f2;
            border-left: 4px solid #dc2626;
            padding: 15px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>비밀번호 재설정</h1>
          </div>
          <div class="content">
            <p>안녕하세요,</p>
            <p>비밀번호 재설정 요청을 받았습니다. 아래 버튼을 클릭하여 새 비밀번호를 설정하세요.</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">비밀번호 재설정</a>
            </div>
            <div class="warning">
              <strong>보안 알림:</strong>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>이 링크는 1시간 동안만 유효합니다.</li>
                <li>본인이 요청하지 않았다면 즉시 계정 보안을 확인하세요.</li>
              </ul>
              <div style="word-break: break-all; margin-top: 10px; font-size: 12px;">
                링크: <a href="${resetUrl}" style="color: #dc2626;">${resetUrl}</a>
              </div>
            </div>
            <p>본인이 요청하지 않은 경우, 이 이메일을 무시하고 비밀번호를 변경하는 것을 권장합니다.</p>
          </div>
          <div class="footer">
            <p>이 이메일은 자동으로 발송되었습니다. 답장하지 말아주세요.</p>
            <p>&copy; ${new Date().getFullYear()} Shopping Mall. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getPasswordResetEmailText(resetUrl: string): string {
    return `
비밀번호 재설정

비밀번호 재설정 요청을 받았습니다.

아래 링크를 클릭하여 새 비밀번호를 설정하세요:
${resetUrl}

이 링크는 1시간 동안 유효합니다.

본인이 요청하지 않은 경우, 이 이메일을 무시하고 비밀번호를 변경하는 것을 권장합니다.

© ${new Date().getFullYear()} Shopping Mall. All rights reserved.
    `.trim();
  }
}
