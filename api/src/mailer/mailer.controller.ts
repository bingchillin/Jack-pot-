import { Controller, Post, Body } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Mailer')
@Controller('mailer')
export class MailerController {
  constructor(private readonly mailerService: MailerService) {}

  @Post('test')
  @ApiOperation({ summary: 'Test email configuration' })
  async testEmail(@Body('email') email: string) {
    try {
      await this.mailerService.sendVerificationEmail(email, 'test-token');
      return { message: 'Test email sent successfully' };
    } catch (error) {
      throw error;
    }
  }
} 