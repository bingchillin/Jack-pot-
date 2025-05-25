import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService as NestMailerService } from '@nestjs-modules/mailer';
import { render } from '@react-email/render';
import { VerificationEmail } from './templates/verification-email';
import { ResetPasswordEmail } from './templates/reset-password-email';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);

  constructor(
    private readonly mailerService: NestMailerService,
    private readonly configService: ConfigService,
  ) { }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationUrl = `${this.configService.get('FRONTEND_URL')}/verify-email?token=${token}`;
    const emailComponent = VerificationEmail({ verificationUrl });
    const html = await render(emailComponent);

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Verify your email address',
        html,
      });
      this.logger.debug(`Verification email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${email}`, error);
      throw error;
    }
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${token}`;
    const emailComponent = ResetPasswordEmail({ resetUrl });
    const html = await render(emailComponent);

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Reset your password',
        html,
      });
      this.logger.debug(`Password reset email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${email}`, error);
      throw error;
    }
  }
} 