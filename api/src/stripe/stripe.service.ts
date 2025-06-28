import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import Stripe from 'stripe';
import { Person } from '../person/entities/person.entity';
import { Product } from '../product/entities/product.entity';
import { Order } from '../order/entities/order.entity';

@Injectable()
export class StripeService implements OnModuleInit {
  private stripe: Stripe | null = null;
  private readonly logger = new Logger(StripeService.name);

  onModuleInit() {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    
    if (!stripeSecretKey) {
      this.logger.warn('STRIPE_SECRET_KEY not found in environment variables. Stripe functionality will be disabled.');
      this.logger.warn('Please add STRIPE_SECRET_KEY to your .env file');
      return;
    }

    if (!stripeSecretKey.startsWith('sk_test_') && !stripeSecretKey.startsWith('sk_live_')) {
      this.logger.error('Invalid STRIPE_SECRET_KEY format. Key should start with sk_test_ or sk_live_');
      return;
    }

    try {
      this.stripe = new Stripe(stripeSecretKey, {
        apiVersion: '2025-05-28.basil',
        typescript: true,
      });
      this.logger.log('Stripe service initialized successfully');
      this.logger.log(`Using Stripe key: ${stripeSecretKey.substring(0, 7)}...${stripeSecretKey.substring(stripeSecretKey.length - 4)}`);
    } catch (error) {
      this.logger.error('Failed to initialize Stripe service:', error);
    }
  }

  private checkStripeInitialized(): void {
    if (!this.stripe) {
      throw new Error('Stripe service not initialized. Please check your STRIPE_SECRET_KEY configuration.');
    }
  }

  async createCustomer(person: Person): Promise<Stripe.Customer> {
    this.checkStripeInitialized();
    
    try {
      this.logger.log(`Attempting to create Stripe customer for person ${person.idPerson} (${person.email})`);
      
      const customer = await this.stripe!.customers.create({
        email: person.email,
        name: `${person.firstname} ${person.surname}`,
        phone: person.numberPhone,
        metadata: {
          personId: person.idPerson.toString(),
        },
      });

      this.logger.log(`✅ Created Stripe customer ${customer.id} for person ${person.idPerson}`);
      return customer;
    } catch (error) {
      this.logger.error(`❌ Failed to create Stripe customer for person ${person.idPerson}:`, error);
      this.logger.error(`Error details:`, {
        message: error.message,
        type: error.type,
        code: error.code,
        statusCode: error.statusCode
      });
      throw error;
    }
  }

  async createProduct(product: Product): Promise<{ stripeProduct: Stripe.Product; stripePrice: Stripe.Price }> {
    this.checkStripeInitialized();
    
    try {
      // Create Stripe product
      const stripeProduct = await this.stripe!.products.create({
        name: product.name,
        description: product.description,
        images: product.imageUrl ? [product.imageUrl] : undefined,
        metadata: {
          productId: product.idProduct.toString(),
          sku: product.sku,
        },
      });

      // Create Stripe price
      const stripePrice = await this.stripe!.prices.create({
        product: stripeProduct.id,
        unit_amount: Math.round(product.price * 100), // Convert to cents
        currency: product.currency.toLowerCase(),
        metadata: {
          productId: product.idProduct.toString(),
        },
      });

      this.logger.log(`Created Stripe product ${stripeProduct.id} and price ${stripePrice.id} for product ${product.idProduct}`);
      
      return { stripeProduct, stripePrice };
    } catch (error) {
      this.logger.error(`Failed to create Stripe product for product ${product.idProduct}:`, error);
      throw error;
    }
  }

  async createPaymentIntent(order: Order, customerId: string): Promise<Stripe.PaymentIntent> {
    this.checkStripeInitialized();
    
    try {
      const paymentIntent = await this.stripe!.paymentIntents.create({
        amount: Math.round(order.totalAmount * 100), // Convert to cents
        currency: order.currency.toLowerCase(),
        customer: customerId,
        metadata: {
          orderId: order.idOrder.toString(),
          personId: order.idPerson.toString(),
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      this.logger.log(`Created payment intent ${paymentIntent.id} for order ${order.idOrder}`);
      return paymentIntent;
    } catch (error) {
      this.logger.error(`Failed to create payment intent for order ${order.idOrder}:`, error);
      throw error;
    }
  }

  async retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    this.checkStripeInitialized();
    
    try {
      return await this.stripe!.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      this.logger.error(`Failed to retrieve payment intent ${paymentIntentId}:`, error);
      throw error;
    }
  }

  async retrieveSession(sessionId: string): Promise<Stripe.Checkout.Session> {
    this.checkStripeInitialized();
    
    try {
      return await this.stripe!.checkout.sessions.retrieve(sessionId);
    } catch (error) {
      this.logger.error(`Failed to retrieve session ${sessionId}:`, error);
      throw error;
    }
  }

  async createRefund(paymentIntentId: string, amount?: number): Promise<Stripe.Refund> {
    this.checkStripeInitialized();
    
    try {
      const refundData: Stripe.RefundCreateParams = {
        payment_intent: paymentIntentId,
      };

      if (amount) {
        refundData.amount = Math.round(amount * 100); // Convert to cents
      }

      const refund = await this.stripe!.refunds.create(refundData);
      this.logger.log(`Created refund ${refund.id} for payment intent ${paymentIntentId}`);
      return refund;
    } catch (error) {
      this.logger.error(`Failed to create refund for payment intent ${paymentIntentId}:`, error);
      throw error;
    }
  }

  async constructWebhookEvent(payload: Buffer, signature: string, secret: string): Promise<Stripe.Event> {
    this.checkStripeInitialized();
    
    try {
      return this.stripe!.webhooks.constructEvent(payload, signature, secret);
    } catch (error) {
      this.logger.error('Webhook signature verification failed:', error);
      throw error;
    }
  }

  async getCustomer(customerId: string): Promise<Stripe.Customer> {
    this.checkStripeInitialized();
    
    try {
      return await this.stripe!.customers.retrieve(customerId) as Stripe.Customer;
    } catch (error) {
      this.logger.error(`Failed to retrieve customer ${customerId}:`, error);
      throw error;
    }
  }

  async updateCustomer(customerId: string, data: Stripe.CustomerUpdateParams): Promise<Stripe.Customer> {
    this.checkStripeInitialized();
    
    try {
      return await this.stripe!.customers.update(customerId, data);
    } catch (error) {
      this.logger.error(`Failed to update customer ${customerId}:`, error);
      throw error;
    }
  }

  isInitialized(): boolean {
    return this.stripe !== null;
  }

  async confirmPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    this.checkStripeInitialized();
    
    try {
      const paymentIntent = await this.stripe!.paymentIntents.confirm(paymentIntentId);
      this.logger.log(`Confirmed payment intent ${paymentIntentId}`);
      return paymentIntent;
    } catch (error) {
      this.logger.error(`Failed to confirm payment intent ${paymentIntentId}:`, error);
      throw error;
    }
  }

  async cancelPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    this.checkStripeInitialized();
    
    try {
      const paymentIntent = await this.stripe!.paymentIntents.cancel(paymentIntentId);
      this.logger.log(`Cancelled payment intent ${paymentIntentId}`);
      return paymentIntent;
    } catch (error) {
      this.logger.error(`Failed to cancel payment intent ${paymentIntentId}:`, error);
      throw error;
    }
  }

  async updatePaymentIntent(paymentIntentId: string, params: Stripe.PaymentIntentUpdateParams): Promise<Stripe.PaymentIntent> {
    this.checkStripeInitialized();
    
    try {
      const paymentIntent = await this.stripe!.paymentIntents.update(paymentIntentId, params);
      this.logger.log(`Updated payment intent ${paymentIntentId}`);
      return paymentIntent;
    } catch (error) {
      this.logger.error(`Failed to update payment intent ${paymentIntentId}:`, error);
      throw error;
    }
  }

  async getPaymentMethod(paymentMethodId: string): Promise<Stripe.PaymentMethod> {
    this.checkStripeInitialized();
    
    try {
      return await this.stripe!.paymentMethods.retrieve(paymentMethodId);
    } catch (error) {
      this.logger.error(`Failed to retrieve payment method ${paymentMethodId}:`, error);
      throw error;
    }
  }

  /**
   * Maps Stripe error codes to our custom error types
   */
  handleStripeError(error: any): Error {
    switch (error.code) {
      case 'card_declined':
      case 'insufficient_funds':
        return new Error('Payment declined: insufficient funds');
      case 'expired_card':
      case 'incorrect_cvc':
      case 'processing_error':
        return new Error('Payment method error: ' + error.message);
      case 'amount_too_large':
      case 'amount_too_small':
        return new Error('Invalid payment amount');
      default:
        return new Error('Payment processing failed: ' + error.message);
    }
  }

  getStripeStatus(): { initialized: boolean; hasKey: boolean; keyType?: string } {
    const hasKey = !!process.env.STRIPE_SECRET_KEY;
    const keyType = process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_') ? 'test' : 
                   process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_') ? 'live' : undefined;
    
    return {
      initialized: this.stripe !== null,
      hasKey,
      keyType
    };
  }

  async createRefundForOrder(order: any, amount?: number): Promise<Stripe.Refund> {
    this.checkStripeInitialized();
    
    if (!order.stripePaymentIntentId) {
      throw new Error('Order does not have a payment intent ID');
    }

    try {
      const refundData: Stripe.RefundCreateParams = {
        payment_intent: order.stripePaymentIntentId,
        metadata: {
          orderId: order.idOrder.toString(),
          personId: order.idPerson.toString(),
        },
      };

      // If amount is specified, use it; otherwise refund the full amount
      if (amount) {
        refundData.amount = Math.round(amount * 100); // Convert to cents
      }

      const refund = await this.stripe!.refunds.create(refundData);
      this.logger.log(`Created refund ${refund.id} for order ${order.idOrder}, amount: ${amount || 'full'}`);
      return refund;
    } catch (error) {
      this.logger.error(`Failed to create refund for order ${order.idOrder}:`, error);
      throw error;
    }
  }
} 