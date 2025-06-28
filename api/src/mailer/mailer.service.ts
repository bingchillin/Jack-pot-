import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService as NestMailerService } from '@nestjs-modules/mailer';
import { render } from '@react-email/render';
import { VerificationEmail } from './templates/verification-email';
import { ResetPasswordEmail } from './templates/reset-password-email';
import { ContactFormEmail } from './templates/contact-form-email';
import { OrderConfirmationEmail } from './templates/order-confirmation-email';
import { PdfService } from './pdf.service';
import { Order } from '../order/entities/order.entity';
import { Person } from '../person/entities/person.entity';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);

  constructor(
    private readonly mailerService: NestMailerService,
    private readonly configService: ConfigService,
    private readonly pdfService: PdfService,
  ) { }

  async sendVerificationEmail(email: string, verificationCode: string): Promise<void> {
    try {
      const html = await render(VerificationEmail({ verificationCode }));
      
      await this.mailerService.sendMail({
        to: email,
        subject: 'Verify your email address for Jack Pot',
        html,
      });

      this.logger.log(`Verification email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${email}:`, error);
      throw error;
    }
  }

  async sendResetPasswordEmail(email: string, resetCode: string): Promise<void> {
    try {
      const html = await render(ResetPasswordEmail({ resetCode }));
      
      await this.mailerService.sendMail({
        to: email,
        subject: 'Reset your password for Jack Pot',
        html,
      });

      this.logger.log(`Reset password email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send reset password email to ${email}:`, error);
      throw error;
    }
  }

  async sendContactFormEmail(name: string, email: string, subject: string, message: string): Promise<void> {
    try {
      const html = await render(ContactFormEmail({ name, email, subject, message }));
      
      await this.mailerService.sendMail({
        to: this.configService.get('ADMIN_EMAIL') || 'admin@jackpot.com',
        subject: `New contact form submission from ${name}`,
        html,
      });

      this.logger.log(`Contact form email sent for ${name} (${email})`);
    } catch (error) {
      this.logger.error(`Failed to send contact form email for ${name}:`, error);
      throw error;
    }
  }

  async sendOrderConfirmationEmail(order: Order, person: Person, locale: string = 'en'): Promise<void> {
    try {
      this.logger.log(`=== SENDING ORDER CONFIRMATION EMAIL ===`);
      this.logger.log(`Order ID: ${order.idOrder}`);
      this.logger.log(`Person email: ${person.email}`);
      this.logger.log(`Locale: ${locale}`);

      // Check mailer configuration
      this.logger.log(`Mailer configuration:`);
      this.logger.log(`- MAIL_HOST: ${this.configService.get('MAIL_HOST')}`);
      this.logger.log(`- MAIL_PORT: ${this.configService.get('MAIL_PORT')}`);
      this.logger.log(`- MAIL_USER: ${this.configService.get('MAIL_USER') ? 'SET' : 'NOT SET'}`);
      this.logger.log(`- MAIL_PASSWORD: ${this.configService.get('MAIL_PASSWORD') ? 'SET' : 'NOT SET'}`);
      this.logger.log(`- MAIL_FROM: ${this.configService.get('MAIL_FROM')}`);

      // Generate PDF receipt
      this.logger.log(`Generating PDF receipt...`);
      const pdfBuffer = await this.pdfService.generateOrderReceipt(order, person, order.locale || locale);
      this.logger.log(`PDF generated, size: ${pdfBuffer.length} bytes`);

      // Helper function to safely format amounts
      const formatAmount = (amount: any): string => {
        if (amount === null || amount === undefined) return '0.00 €';
        const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        return `${numAmount.toFixed(2)} €`;
      };

      // Prepare order items for email
      const orderItems = order.orderItems?.map(item => ({
        productName: item.product?.name || `Product ${item.idProduct}`,
        quantity: item.quantity,
        unitPrice: formatAmount(item.unitPrice),
        totalPrice: formatAmount(item.totalPrice),
      })) || [];

      this.logger.log(`Order items prepared: ${orderItems.length} items`);

      // Get localized text for subject
      const getLocalizedSubject = (locale: string) => {
        const translations = {
          en: 'Order Confirmation - Jack Pot',
          fr: 'Confirmation de commande - Jack Pot',
          es: 'Confirmación de pedido - Jack Pot',
        };
        return translations[locale as keyof typeof translations] || translations.en;
      };

      this.logger.log(`Rendering email template...`);
      const html = await render(OrderConfirmationEmail({
        orderNumber: order.idOrder.toString(),
        customerName: `${person.firstname} ${person.surname}`,
        customerEmail: person.email,
        orderDate: new Date(order.createdAt).toLocaleDateString(order.locale || locale),
        totalAmount: formatAmount(order.totalAmount),
        orderItems,
        shippingAddress: order.shippingAddress,
        locale: order.locale || locale,
      }));
      this.logger.log(`Email template rendered, HTML length: ${html.length}`);

      this.logger.log(`Sending email via mailer service...`);
      await this.mailerService.sendMail({
        to: person.email,
        subject: getLocalizedSubject(order.locale || locale),
        html,
        attachments: [
          {
            filename: `order-${order.idOrder}-receipt.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf',
          },
        ],
      });

      this.logger.log(`Order confirmation email sent successfully for order ${order.idOrder}`);
    } catch (error) {
      this.logger.error(`Failed to send order confirmation email for order ${order.idOrder}:`, error);
      this.logger.error(`Error details:`, error.message);
      this.logger.error(`Error stack:`, error.stack);
      throw error;
    }
  }
} 