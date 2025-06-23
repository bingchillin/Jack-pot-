import { Controller, Post, Req, Res, Headers, HttpStatus, Logger, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiExcludeEndpoint } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { WebhookService } from './webhook.service';

@ApiTags('stripe-webhooks')
@Controller('stripe')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(private readonly webhookService: WebhookService) {}

  @Post('webhook')
  @ApiExcludeEndpoint() // Exclude from Swagger as this is for Stripe only
  @ApiOperation({ summary: 'Handle Stripe webhook events' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid webhook signature or payload' })
  async handleWebhook(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('stripe-signature') signature: string,
  ): Promise<void> {
    if (!signature) {
      this.logger.error('Missing Stripe signature header');
      res.status(HttpStatus.BAD_REQUEST).json({
        error: 'Missing Stripe signature header',
      });
      return;
    }

    try {
      // Get raw body as buffer
      const payload = req.body;

      if (!Buffer.isBuffer(payload)) {
        throw new BadRequestException('Expected raw buffer payload');
      }

      // Verify webhook signature and construct event
      const event = await this.webhookService.verifyWebhookSignature(payload, signature);

      this.logger.log(`📨 Received webhook: ${event.type} (${event.id})`);

      // Process the webhook event
      await this.webhookService.handleWebhookEvent(event);

      // Send success response to Stripe
      res.status(HttpStatus.OK).json({
        received: true,
        eventId: event.id,
        eventType: event.type,
      });

    } catch (error) {
      this.logger.error(`❌ Webhook processing failed:`, error);

      if (error instanceof BadRequestException) {
        res.status(HttpStatus.BAD_REQUEST).json({
          error: error.message,
        });
      } else {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          error: 'Internal server error processing webhook',
        });
      }
    }
  }

  @Post('webhook/test')
  @ApiOperation({ summary: 'Test webhook endpoint (development only)' })
  @ApiResponse({ status: 200, description: 'Test webhook received' })
  async testWebhook(@Req() req: Request, @Res() res: Response): Promise<void> {
    this.logger.log('🧪 Test webhook received:', req.body);
    
    res.status(HttpStatus.OK).json({
      message: 'Test webhook received successfully',
      body: req.body,
      headers: req.headers,
    });
  }
} 