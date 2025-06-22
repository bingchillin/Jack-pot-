import { Controller, Post, Body } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';

interface ContactFormDto {
  name: string;
  email: string;
  subject: string;
  message: string;
}

@ApiTags('Mailer')
@Controller('mailer')
export class MailerController {
  constructor(private readonly mailerService: MailerService) {}

  @Post('test')
  @ApiOperation({ summary: 'Test email configuration' })
  async testEmail(@Body('email') email: string) {
    try {
      await this.mailerService.sendVerificationEmail(email, '454654');
      return { message: 'Test email sent successfully' };
    } catch (error) {
      throw error;
    }
  }

  @Post('contact')
  @ApiOperation({ summary: 'Send contact form email' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Contact name' },
        email: { type: 'string', description: 'Contact email' },
        subject: { type: 'string', description: 'Email subject' },
        message: { type: 'string', description: 'Email message' },
      },
      required: ['name', 'email', 'subject', 'message'],
    },
  })
  async sendContactForm(@Body() contactForm: ContactFormDto) {
    try {
      await this.mailerService.sendContactFormEmail(
        contactForm.name,
        contactForm.email,
        contactForm.subject,
        contactForm.message,
      );
      return { 
        success: true,
        message: 'Contact form submitted successfully' 
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to send contact form',
        error: error.message,
      };
    }
  }
} 