import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { OrderService } from '../order/order.service';
import { Order, OrderStatus } from '../order/entities/order.entity';
import { StripeService } from './stripe.service';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    private readonly orderService: OrderService,
    private readonly stripeService: StripeService,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async handleWebhookEvent(event: Stripe.Event): Promise<void> {
    this.logger.log(`Processing webhook event: ${event.type} (${event.id})`);

    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
          break;

        case 'payment_intent.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
          break;

        case 'payment_intent.canceled':
          await this.handlePaymentCanceled(event.data.object as Stripe.PaymentIntent);
          break;

        case 'payment_intent.requires_action':
          await this.handlePaymentRequiresAction(event.data.object as Stripe.PaymentIntent);
          break;

        case 'customer.created':
          await this.handleCustomerCreated(event.data.object as Stripe.Customer);
          break;

        case 'payment_method.attached':
          await this.handlePaymentMethodAttached(event.data.object as Stripe.PaymentMethod);
          break;

        default:
          this.logger.log(`Unhandled webhook event type: ${event.type}`);
      }

      this.logger.log(`✅ Successfully processed webhook event: ${event.type} (${event.id})`);
    } catch (error) {
      this.logger.error(`❌ Failed to process webhook event ${event.type} (${event.id}):`, error);
      throw error;
    }
  }

  private async handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const { id: paymentIntentId, metadata, payment_method } = paymentIntent;

    try {
      // Find the order by payment intent ID
      const order = await this.orderService.findByStripePaymentIntent(paymentIntentId);

      if (order.status === OrderStatus.PAID) {
        this.logger.log(`Order ${order.idOrder} is already marked as paid. Skipping.`);
        return;
      }

      // Update order status to paid
      await this.orderRepository.update(order.idOrder, {
        status: OrderStatus.PAID,
        paidAt: new Date(),
        paymentMethod: typeof payment_method === 'string' ? payment_method : paymentIntent.payment_method_types?.[0] || 'card',
        stripePaymentMethodId: typeof payment_method === 'string' ? payment_method : undefined,
      });

      // Convert reserved stock to sold stock
      for (const orderItem of order.orderItems) {
        await this.orderRepository.manager
          .createQueryBuilder()
          .update('products')
          .set({ 
            reservedQuantity: () => `reserved_quantity - ${orderItem.quantity}`,
          })
          .where('id_product = :id', { id: orderItem.idProduct })
          .execute();
      }

      this.logger.log(`✅ Order ${order.idOrder} marked as PAID and stock updated`);
    } catch (error) {
      this.logger.error(`Failed to handle payment succeeded for ${paymentIntentId}:`, error);
      throw error;
    }
  }

  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const { id: paymentIntentId, last_payment_error } = paymentIntent;

    try {
      const order = await this.orderService.findByStripePaymentIntent(paymentIntentId);

      if (order.status === OrderStatus.PAYMENT_FAILED) {
        this.logger.log(`Order ${order.idOrder} is already marked as payment failed. Skipping.`);
        return;
      }

      // Update order status to payment failed
      await this.orderService.updateStatus(order.idOrder, OrderStatus.PAYMENT_FAILED);

      // Release reserved stock back to available stock
      await this.releaseReservedStock(order);

      this.logger.log(`❌ Order ${order.idOrder} marked as PAYMENT_FAILED and stock released`);
      this.logger.log(`Payment error: ${last_payment_error?.message || 'Unknown error'}`);
    } catch (error) {
      this.logger.error(`Failed to handle payment failed for ${paymentIntentId}:`, error);
      throw error;
    }
  }

  private async handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const { id: paymentIntentId } = paymentIntent;

    try {
      const order = await this.orderService.findByStripePaymentIntent(paymentIntentId);

      if (order.status === OrderStatus.CANCELLED) {
        this.logger.log(`Order ${order.idOrder} is already marked as cancelled. Skipping.`);
        return;
      }

      // Update order status to cancelled
      await this.orderService.updateStatus(order.idOrder, OrderStatus.CANCELLED);

      // Release reserved stock
      await this.releaseReservedStock(order);

      this.logger.log(`🚫 Order ${order.idOrder} marked as CANCELLED and stock released`);
    } catch (error) {
      this.logger.error(`Failed to handle payment canceled for ${paymentIntentId}:`, error);
      throw error;
    }
  }

  private async handlePaymentRequiresAction(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const { id: paymentIntentId } = paymentIntent;

    try {
      const order = await this.orderService.findByStripePaymentIntent(paymentIntentId);

      // Update order status to processing if not already
      if (order.status !== OrderStatus.PAYMENT_PROCESSING) {
        await this.orderService.updateStatus(order.idOrder, OrderStatus.PAYMENT_PROCESSING);
        this.logger.log(`🔄 Order ${order.idOrder} marked as PAYMENT_PROCESSING (requires action)`);
      }
    } catch (error) {
      this.logger.error(`Failed to handle payment requires action for ${paymentIntentId}:`, error);
      throw error;
    }
  }

  private async handleCustomerCreated(customer: Stripe.Customer): Promise<void> {
    const { id: customerId, email, metadata } = customer;
    
    this.logger.log(`👤 New Stripe customer created: ${customerId} (${email})`);
    
    if (metadata?.personId) {
      this.logger.log(`Customer ${customerId} linked to person ${metadata.personId}`);
    }
  }

  private async handlePaymentMethodAttached(paymentMethod: Stripe.PaymentMethod): Promise<void> {
    const { id: paymentMethodId, customer, type } = paymentMethod;
    
    this.logger.log(`💳 Payment method ${paymentMethodId} (${type}) attached to customer ${customer}`);
  }

  private async releaseReservedStock(order: Order): Promise<void> {
    for (const orderItem of order.orderItems) {
      await this.orderRepository.manager
        .createQueryBuilder()
        .update('products')
        .set({ 
          stockQuantity: () => `stock_quantity + ${orderItem.quantity}`,
          reservedQuantity: () => `reserved_quantity - ${orderItem.quantity}`,
        })
        .where('id_product = :id', { id: orderItem.idProduct })
        .execute();
    }
    
    this.logger.log(`📦 Released reserved stock for order ${order.idOrder}`);
  }

  // Verify webhook signature to ensure it's from Stripe
  async verifyWebhookSignature(payload: Buffer, signature: string): Promise<Stripe.Event> {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      throw new BadRequestException('Stripe webhook secret not configured');
    }

    try {
      return await this.stripeService.constructWebhookEvent(payload, signature, webhookSecret);
    } catch (error) {
      this.logger.error('Webhook signature verification failed:', error);
      throw new BadRequestException('Invalid webhook signature');
    }
  }

  // Check if this webhook event has already been processed (idempotency)
  private async isEventProcessed(eventId: string): Promise<boolean> {
    // In a production app, you'd store processed event IDs in a database table
    // For now, we'll rely on Stripe's built-in idempotency
    return false;
  }
} 