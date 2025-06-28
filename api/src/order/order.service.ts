import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../product/entities/product.entity';
import { Person } from '../person/entities/person.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CreateOrderResponseDto } from './dto/create-order-response.dto';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import { PaymentStatusResponseDto } from './dto/payment-status-response.dto';
import { PersonService } from '../person/person.service';
import { StripeService } from '../stripe/stripe.service';
import { 
  PaymentProcessingError, 
  InsufficientStockError, 
  PaymentAlreadyProcessedError,
  PaymentIntentNotFoundError 
} from './exceptions/payment.exceptions';
import Stripe from 'stripe';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Person)
    private readonly personRepository: Repository<Person>,
    private readonly dataSource: DataSource,
    @Inject(forwardRef(() => PersonService))
    private readonly personService: PersonService,
    @Inject(forwardRef(() => StripeService))
    private readonly stripeService: StripeService,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<CreateOrderResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Verify person exists
      const person = await this.personRepository.findOne({
        where: { idPerson: createOrderDto.personId },
      });
      if (!person) {
        throw new NotFoundException(`Person with ID ${createOrderDto.personId} not found`);
      }

      // Ensure person has a Stripe customer ID (create one if they don't)
      let stripeCustomerId = person.stripeCustomerId;
      if (!stripeCustomerId) {
        this.logger.log(`Person ${createOrderDto.personId} doesn't have a Stripe customer ID. Creating one...`);
        try {
          stripeCustomerId = await this.personService.ensureStripeCustomer(createOrderDto.personId);
          this.logger.log(`✅ Ensured Stripe customer ${stripeCustomerId} for person ${createOrderDto.personId}`);
        } catch (error) {
          this.logger.error(`❌ Failed to ensure Stripe customer for person ${createOrderDto.personId}:`, error);
          throw new PaymentProcessingError(`Failed to prepare payment for this order: ${error.message}`);
        }
      }

      // Calculate totals and verify stock
      let totalAmount = 0;
      const orderItems: Partial<OrderItem>[] = [];

      for (const item of createOrderDto.items) {
        const product = await this.productRepository.findOne({
          where: { idProduct: item.productId, isActive: true },
        });
        
        if (!product) {
          throw new NotFoundException(`Product with ID ${item.productId} not found`);
        }
        
        if (product.stockQuantity < item.quantity) {
          throw new InsufficientStockError(product.name, item.quantity, product.stockQuantity);
        }

        // Ensure product has Stripe product/price IDs
        if (!product.stripeProductId || !product.stripePriceId) {
          this.logger.log(`Creating Stripe product for ${product.name}...`);
          try {
            const { stripeProduct, stripePrice } = await this.stripeService.createProduct(product);
            
            // Update product with Stripe IDs
            await this.productRepository.update(product.idProduct, {
              stripeProductId: stripeProduct.id,
              stripePriceId: stripePrice.id,
            });
            
            this.logger.log(`✅ Created Stripe product ${stripeProduct.id} for ${product.name}`);
          } catch (error) {
            this.logger.error(`❌ Failed to create Stripe product for ${product.name}:`, error);
            // Continue with order creation even if Stripe product creation fails
          }
        }

        const itemTotal = product.price * item.quantity;
        totalAmount += itemTotal;

        orderItems.push({
          idProduct: item.productId,
          quantity: item.quantity,
          unitPrice: product.price,
          totalPrice: itemTotal,
        });
      }

      // Add shipping and tax
      const shippingCost = createOrderDto.shippingCost || 0;
      const taxAmount = createOrderDto.taxAmount || 0;
      totalAmount += shippingCost + taxAmount;

      // Create a temporary order object for payment intent creation
      const tempOrder = {
        idOrder: 0, // Will be updated after creation
        totalAmount,
        idPerson: createOrderDto.personId,
        currency: 'EUR', // Default currency
      } as Order;

      // Create Stripe Payment Intent
      const paymentIntent = await this.stripeService.createPaymentIntent(tempOrder, stripeCustomerId);

      // Create order
      const order = this.orderRepository.create({
        idPerson: createOrderDto.personId,
        amount: totalAmount - shippingCost - taxAmount,
        shippingCost,
        taxAmount,
        totalAmount,
        shippingAddress: createOrderDto.shippingAddress,
        billingAddress: createOrderDto.billingAddress,
        notes: createOrderDto.notes,
        status: OrderStatus.PAYMENT_PROCESSING,
        stripePaymentIntentId: paymentIntent.id,
      });

      const savedOrder = await queryRunner.manager.save(Order, order);

      // Update payment intent metadata with actual order ID
      await this.stripeService.updatePaymentIntent(paymentIntent.id, {
        metadata: {
          orderId: savedOrder.idOrder.toString(),
          personId: createOrderDto.personId.toString(),
        },
      });

      // Create order items and reserve stock
      for (const item of orderItems) {
        const orderItem = this.orderItemRepository.create({
          ...item,
          idOrder: savedOrder.idOrder,
        });
        await queryRunner.manager.save(OrderItem, orderItem);

        // Reserve stock (reduce available, increase reserved)
        await queryRunner.manager
          .createQueryBuilder()
          .update(Product)
          .set({ 
            stockQuantity: () => `stock_quantity - ${item.quantity}`,
            reservedQuantity: () => `reserved_quantity + ${item.quantity}`
          })
          .where('id_product = :id', { id: item.idProduct })
          .execute();
      }

      await queryRunner.commitTransaction();
      
      const orderWithRelations = await this.findOne(savedOrder.idOrder);

      // Return complete order response with payment info
      return {
        idOrder: orderWithRelations.idOrder,
        personId: orderWithRelations.idPerson,
        totalAmount: orderWithRelations.totalAmount,
        currency: orderWithRelations.currency,
        status: orderWithRelations.status,
        stripePaymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        requiresPayment: true,
        message: 'Order created successfully. Complete payment to proceed.',
        stripeCustomerId: stripeCustomerId,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<Order[]> {
    return await this.orderRepository.find({
      relations: ['person', 'orderItems', 'orderItems.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { idOrder: id },
      relations: ['person', 'orderItems', 'orderItems.product'],
    });
    
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    
    return order;
  }

  async findByPerson(personId: number, page: number = 1, limit: number = 10): Promise<{ orders: Order[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    
    const [orders, total] = await this.orderRepository.findAndCount({
      where: { idPerson: personId },
      relations: ['orderItems', 'orderItems.product'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      orders,
      total,
      page,
      limit,
    };
  }

  async findByStripePaymentIntent(stripePaymentIntentId: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { stripePaymentIntentId },
      relations: ['person', 'orderItems', 'orderItems.product'],
    });
    
    if (!order) {
      throw new NotFoundException(`Order with payment intent ${stripePaymentIntentId} not found`);
    }
    
    return order;
  }

  async findByPaymentIntent(paymentIntentId: string): Promise<Order> {
    return this.findByStripePaymentIntent(paymentIntentId);
  }

  async findBySession(sessionId: string): Promise<Order> {
    // First, retrieve the session from Stripe to get the payment intent ID
    const session = await this.stripeService.retrieveSession(sessionId);
    
    if (!session.payment_intent) {
      throw new NotFoundException(`No payment intent found for session ${sessionId}`);
    }
    
    // Then find the order by payment intent ID
    return this.findByStripePaymentIntent(session.payment_intent as string);
  }

  async createFromSession(sessionId: string): Promise<Order> {
    // Retrieve the session from Stripe
    const session = await this.stripeService.retrieveSession(sessionId);
    
    if (!session.payment_intent) {
      throw new BadRequestException(`No payment intent found for session ${sessionId}`);
    }

    // Check if order already exists
    try {
      const existingOrder = await this.findByStripePaymentIntent(session.payment_intent as string);
      return existingOrder; // Return existing order if found
    } catch (error) {
      // Order doesn't exist, create it
      this.logger.log(`Creating order from session ${sessionId} with payment intent ${session.payment_intent}`);
      
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Extract order data from session metadata
        const personId = parseInt(session.metadata.personId);
        const items = JSON.parse(session.metadata.items || '[]');
        
        if (!personId || !items.length) {
          throw new BadRequestException('Missing personId or items in session metadata');
        }

        // Verify person exists
        const person = await this.personRepository.findOne({
          where: { idPerson: personId },
        });
        if (!person) {
          throw new BadRequestException(`Person with ID ${personId} not found`);
        }

        // Calculate totals and verify stock
        let totalAmount = 0;
        const orderItems: Partial<OrderItem>[] = [];

        for (const item of items) {
          const product = await this.productRepository.findOne({
            where: { idProduct: item.productId, isActive: true },
          });
          
          if (!product) {
            throw new BadRequestException(`Product with ID ${item.productId} not found`);
          }
          
          // For paid orders, check if there's enough total stock (available + reserved)
          // since reserved stock will be converted to sold stock
          const totalAvailableStock = product.stockQuantity + product.reservedQuantity;
          if (totalAvailableStock < item.quantity) {
            throw new BadRequestException(`Insufficient stock for ${product.name}. Available: ${totalAvailableStock}, Requested: ${item.quantity}`);
          }

          const itemTotal = product.price * item.quantity;
          totalAmount += itemTotal;

          orderItems.push({
            idProduct: item.productId,
            quantity: item.quantity,
            unitPrice: product.price,
            totalPrice: itemTotal,
          });
        }

        // Create order with PAID status
        const newOrder = this.orderRepository.create({
          idPerson: personId,
          amount: totalAmount,
          shippingCost: 0, // Add shipping logic if needed
          taxAmount: 0, // Add tax logic if needed
          totalAmount,
          status: OrderStatus.PAID,
          stripePaymentIntentId: session.payment_intent as string,
          paidAt: new Date(),
          paymentMethod: 'card', // Default payment method
        });

        const savedOrder = await queryRunner.manager.save(Order, newOrder);

        // Create order items and reduce stock
        for (const item of orderItems) {
          const orderItem = this.orderItemRepository.create({
            ...item,
            idOrder: savedOrder.idOrder,
          });
          await queryRunner.manager.save(OrderItem, orderItem);

          // For paid orders, reduce reserved quantity since the stock was already reserved
          // during the initial order creation
          await queryRunner.manager
            .createQueryBuilder()
            .update(Product)
            .set({ 
              reservedQuantity: () => `reserved_quantity - ${item.quantity}`,
            })
            .where('id_product = :id', { id: item.idProduct })
            .execute();
        }

        await queryRunner.commitTransaction();
        
        this.logger.log(`Order ${savedOrder.idOrder} created from session ${sessionId}`);
        return savedOrder;
      } catch (error) {
        await queryRunner.rollbackTransaction();
        this.logger.error(`Failed to create order from session ${sessionId}:`, error);
        throw error;
      } finally {
        await queryRunner.release();
      }
    }
  }

  async update(id: number, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(id);
    Object.assign(order, updateOrderDto);
    return await this.orderRepository.save(order);
  }

  async updateStatus(id: number, status: OrderStatus): Promise<Order> {
    const order = await this.findOne(id);
    order.status = status;
    return await this.orderRepository.save(order);
  }

  async remove(id: number): Promise<void> {
    const order = await this.findOne(id);
    await this.orderRepository.remove(order);
  }

  async confirmPayment(confirmPaymentDto: ConfirmPaymentDto): Promise<PaymentStatusResponseDto> {
    const { paymentIntentId, paymentMethodId } = confirmPaymentDto;
    
    try {
      // Find the order by payment intent ID
      const order = await this.findByStripePaymentIntent(paymentIntentId);
      
      // Check if payment is already processed
      if (order.status === OrderStatus.PAID) {
        throw new PaymentAlreadyProcessedError('This order has already been paid');
      }
      
      if (order.status === OrderStatus.CANCELLED) {
        throw new BadRequestException('Cannot process payment for cancelled order');
      }

      // Update order status to processing
      await this.updateStatus(order.idOrder, OrderStatus.PAYMENT_PROCESSING);

      // Confirm the payment intent with Stripe
      const paymentIntent = await this.stripeService.confirmPaymentIntent(paymentIntentId);
      
      // Update order based on payment result
      if (paymentIntent.status === 'succeeded') {
        await this.orderRepository.update(order.idOrder, {
          status: OrderStatus.PAID,
          paidAt: new Date(),
          paymentMethod: paymentIntent.payment_method_types?.[0] || 'card',
          stripePaymentMethodId: paymentMethodId,
        });

        // Convert reserved stock to sold stock
        for (const orderItem of order.orderItems) {
          await this.productRepository
            .createQueryBuilder()
            .update(Product)
            .set({ 
              reservedQuantity: () => `reserved_quantity - ${orderItem.quantity}`,
            })
            .where('id_product = :id', { id: orderItem.idProduct })
            .execute();
        }

        return {
          orderId: order.idOrder,
          orderStatus: OrderStatus.PAID,
          stripePaymentIntentId: paymentIntentId,
          stripePaymentStatus: 'succeeded',
          paymentMethod: paymentIntent.payment_method_types?.[0] || 'card',
          paidAt: new Date(),
          totalAmount: order.totalAmount,
          currency: order.currency,
          isPaid: true,
          message: 'Payment successful! Your order has been confirmed.',
        };
      } else if (paymentIntent.status === 'requires_action') {
        return {
          orderId: order.idOrder,
          orderStatus: OrderStatus.PAYMENT_PROCESSING,
          stripePaymentIntentId: paymentIntentId,
          stripePaymentStatus: 'requires_action',
          totalAmount: order.totalAmount,
          currency: order.currency,
          isPaid: false,
          message: 'Additional authentication required.',
        };
      } else {
        // Payment failed
        await this.updateStatus(order.idOrder, OrderStatus.PAYMENT_FAILED);
        
        // Release reserved stock back to available stock
        await this.releaseReservedStock(order.idOrder);

        return {
          orderId: order.idOrder,
          orderStatus: OrderStatus.PAYMENT_FAILED,
          stripePaymentIntentId: paymentIntentId,
          stripePaymentStatus: paymentIntent.status,
          totalAmount: order.totalAmount,
          currency: order.currency,
          isPaid: false,
          message: 'Payment failed. Please try again with a different payment method.',
        };
      }
    } catch (error) {
      this.logger.error(`Payment confirmation failed for ${paymentIntentId}:`, error);
      
      if (error instanceof PaymentAlreadyProcessedError || 
          error instanceof BadRequestException) {
        throw error;
      }
      
      throw new PaymentProcessingError(`Payment confirmation failed: ${error.message}`);
    }
  }

  async getPaymentStatus(paymentIntentId: string): Promise<PaymentStatusResponseDto> {
    try {
      const order = await this.findByStripePaymentIntent(paymentIntentId);
      const paymentIntent = await this.stripeService.retrievePaymentIntent(paymentIntentId);

      return {
        orderId: order.idOrder,
        orderStatus: order.status,
        stripePaymentIntentId: paymentIntentId,
        stripePaymentStatus: paymentIntent.status,
        paymentMethod: order.paymentMethod,
        paidAt: order.paidAt,
        totalAmount: order.totalAmount,
        currency: order.currency,
        isPaid: order.status === OrderStatus.PAID,
        message: this.getStatusMessage(order.status),
      };
    } catch (error) {
      this.logger.error(`Failed to get payment status for ${paymentIntentId}:`, error);
      throw new PaymentIntentNotFoundError(paymentIntentId);
    }
  }

  async cancelOrder(orderId: number): Promise<Order> {
    const order = await this.findOne(orderId);
    
    if (order.status === OrderStatus.PAID) {
      throw new BadRequestException('Cannot cancel a paid order. Please request a refund instead.');
    }
    
    if (order.status === OrderStatus.SHIPPED || order.status === OrderStatus.DELIVERED) {
      throw new BadRequestException('Cannot cancel a shipped or delivered order.');
    }

    // Cancel the payment intent if it exists
    if (order.stripePaymentIntentId) {
      try {
        await this.stripeService.cancelPaymentIntent(order.stripePaymentIntentId);
      } catch (error) {
        this.logger.warn(`Failed to cancel payment intent ${order.stripePaymentIntentId}:`, error);
        // Continue with order cancellation even if Stripe cancellation fails
      }
    }

    // Release reserved stock
    await this.releaseReservedStock(orderId);

    // Update order status
    return await this.updateStatus(orderId, OrderStatus.CANCELLED);
  }

  private async releaseReservedStock(orderId: number): Promise<void> {
    const order = await this.findOne(orderId);
    
    for (const orderItem of order.orderItems) {
      await this.productRepository
        .createQueryBuilder()
        .update(Product)
        .set({ 
          stockQuantity: () => `stock_quantity + ${orderItem.quantity}`,
          reservedQuantity: () => `reserved_quantity - ${orderItem.quantity}`,
        })
        .where('id_product = :id', { id: orderItem.idProduct })
        .execute();
    }
  }

  private getStatusMessage(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.PENDING:
        return 'Order is pending payment.';
      case OrderStatus.PAYMENT_PROCESSING:
        return 'Payment is being processed.';
      case OrderStatus.PAID:
        return 'Payment successful! Your order has been confirmed.';
      case OrderStatus.PAYMENT_FAILED:
        return 'Payment failed. Please try again.';
      case OrderStatus.SHIPPED:
        return 'Your order has been shipped.';
      case OrderStatus.DELIVERED:
        return 'Your order has been delivered.';
      case OrderStatus.CANCELLED:
        return 'Order has been cancelled.';
      case OrderStatus.REFUNDED:
        return 'Order has been refunded.';
      default:
        return 'Order status unknown.';
    }
  }

  async handleWebhook(rawBody: Buffer, signature: string): Promise<{ received: boolean }> {
    try {
      this.logger.log('=== WEBHOOK RECEIVED ===');
      this.logger.log('Webhook signature:', signature);
      
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      if (!webhookSecret) {
        this.logger.error('STRIPE_WEBHOOK_SECRET not configured');
        throw new Error('STRIPE_WEBHOOK_SECRET not configured');
      }

      this.logger.log('Webhook secret configured:', webhookSecret ? 'Yes' : 'No');

      const event = await this.stripeService.constructWebhookEvent(
        rawBody,
        signature,
        webhookSecret
      );
      
      this.logger.log(`Received webhook event: ${event.type}`);

      switch (event.type) {
        case 'payment_intent.succeeded':
          this.logger.log('Processing payment_intent.succeeded event');
          await this.handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
          break;
        case 'payment_intent.payment_failed':
          this.logger.log('Processing payment_intent.payment_failed event');
          await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
          break;
        case 'charge.succeeded':
          this.logger.log('Processing charge.succeeded event');
          // Charge succeeded is handled by payment_intent.succeeded, so we can ignore it
          break;
        case 'checkout.session.completed':
          this.logger.log('Processing checkout.session.completed event');
          // Checkout session completed - we can use this to create orders too
          await this.handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
          break;
        case 'payment_intent.created':
          this.logger.log('Processing payment_intent.created event');
          // Payment intent created - we don't need to do anything here
          break;
        default:
          this.logger.log(`Unhandled event type: ${event.type}`);
      }

      this.logger.log('=== WEBHOOK PROCESSED SUCCESSFULLY ===');
      return { received: true };
    } catch (error) {
      this.logger.error('=== WEBHOOK ERROR ===');
      this.logger.error('Webhook error:', error);
      this.logger.error('Error stack:', error.stack);
      throw new BadRequestException('Webhook signature verification failed');
    }
  }

  private async handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    this.logger.log(`=== PAYMENT SUCCEEDED ===`);
    this.logger.log(`Payment succeeded for payment intent: ${paymentIntent.id}`);
    this.logger.log(`Payment intent metadata:`, JSON.stringify(paymentIntent.metadata, null, 2));
    
    // Check if order already exists for this payment intent
    let order = await this.findByStripePaymentIntent(paymentIntent.id).catch(() => null);
    
    if (order) {
      this.logger.log(`Order already exists for payment intent ${paymentIntent.id}:`, order.idOrder);
      return;
    }
    
    // Create the order now that payment has succeeded
    this.logger.log(`Creating order for successful payment intent: ${paymentIntent.id}`);
    
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Extract order data from payment intent metadata
      const personId = parseInt(paymentIntent.metadata.personId);
      const items = JSON.parse(paymentIntent.metadata.items || '[]');
      
      this.logger.log(`Extracted personId: ${personId}, items:`, items);
      
      if (!personId || !items.length) {
        throw new Error('Missing personId or items in payment intent metadata');
      }

      // Verify person exists
      const person = await this.personRepository.findOne({
        where: { idPerson: personId },
      });
      if (!person) {
        throw new Error(`Person with ID ${personId} not found`);
      }
      this.logger.log(`Person found: ${person.firstname} ${person.surname}`);

      // Calculate totals and verify stock
      let totalAmount = 0;
      const orderItems: Partial<OrderItem>[] = [];

      for (const item of items) {
        const product = await this.productRepository.findOne({
          where: { idProduct: item.productId, isActive: true },
        });
        
        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found`);
        }
        
        if (product.stockQuantity < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}`);
        }

        const itemTotal = product.price * item.quantity;
        totalAmount += itemTotal;

        orderItems.push({
          idProduct: item.productId,
          quantity: item.quantity,
          unitPrice: product.price,
          totalPrice: itemTotal,
        });
        
        this.logger.log(`Added item: ${product.name} x${item.quantity} = $${itemTotal}`);
      }

      this.logger.log(`Total amount: $${totalAmount}`);

      // Create the order
      const newOrder = this.orderRepository.create({
        idPerson: personId,
        status: OrderStatus.PAID,
        totalAmount: totalAmount,
        currency: 'usd',
        paymentMethod: 'stripe',
        stripePaymentIntentId: paymentIntent.id,
        paidAt: new Date(),
        orderItems: orderItems,
      });

      const savedOrder = await queryRunner.manager.save(Order, newOrder);
      this.logger.log(`Order created successfully: ${savedOrder.idOrder}`);

      // Save order items
      for (const item of orderItems) {
        await queryRunner.manager.save(OrderItem, {
          ...item,
          idOrder: savedOrder.idOrder,
        });
      }

      // Update product stock
      for (const item of orderItems) {
        await this.productRepository
          .createQueryBuilder()
          .update(Product)
          .set({ 
            stockQuantity: () => `stock_quantity - ${item.quantity}`,
          })
          .where('id_product = :id', { id: item.idProduct })
          .execute();
      }

      await queryRunner.commitTransaction();
      this.logger.log(`=== ORDER CREATION COMPLETED ===`);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to create order for payment intent ${paymentIntent.id}:`, error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    this.logger.log(`Payment failed for payment intent: ${paymentIntent.id}`);
    
    // Find the order by payment intent ID
    const order = await this.findByStripePaymentIntent(paymentIntent.id);
    if (!order) {
      this.logger.error(`Order not found for payment intent: ${paymentIntent.id}`);
      return;
    }

    // Update order status to PAYMENT_FAILED
    await this.updateStatus(order.idOrder, OrderStatus.PAYMENT_FAILED);
    
    // Release reserved stock back to available
    await this.releaseReservedStock(order.idOrder);
    
    this.logger.log(`Order ${order.idOrder} marked as payment failed`);
  }

  private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
    this.logger.log(`=== CHECKOUT SESSION COMPLETED ===`);
    this.logger.log(`Checkout session completed: ${session.id}`);
    this.logger.log(`Session metadata:`, JSON.stringify(session.metadata, null, 2));
    
    if (session.payment_intent && typeof session.payment_intent === 'string') {
      // Retrieve the payment intent to get full details
      const paymentIntent = await this.stripeService.retrievePaymentIntent(session.payment_intent);
      await this.handlePaymentSucceeded(paymentIntent);
    } else if (session.payment_intent && typeof session.payment_intent === 'object') {
      await this.handlePaymentSucceeded(session.payment_intent as Stripe.PaymentIntent);
    } else {
      this.logger.warn(`No payment intent found in checkout session ${session.id}`);
    }
  }

  async createPaymentIntent(createOrderDto: CreateOrderDto): Promise<{ clientSecret: string; paymentIntentId: string; totalAmount: number }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Verify person exists
      const person = await this.personRepository.findOne({
        where: { idPerson: createOrderDto.personId },
      });
      if (!person) {
        throw new NotFoundException(`Person with ID ${createOrderDto.personId} not found`);
      }

      // Ensure person has a Stripe customer ID
      let stripeCustomerId = person.stripeCustomerId;
      if (!stripeCustomerId) {
        stripeCustomerId = await this.personService.ensureStripeCustomer(createOrderDto.personId);
      }

      // Calculate totals and verify stock
      let totalAmount = 0;
      const orderItems: Partial<OrderItem>[] = [];

      for (const item of createOrderDto.items) {
        const product = await this.productRepository.findOne({
          where: { idProduct: item.productId, isActive: true },
        });
        
        if (!product) {
          throw new NotFoundException(`Product with ID ${item.productId} not found`);
        }
        
        if (product.stockQuantity < item.quantity) {
          throw new InsufficientStockError(product.name, item.quantity, product.stockQuantity);
        }

        // Ensure product has Stripe product/price IDs
        if (!product.stripeProductId || !product.stripePriceId) {
          const { stripeProduct, stripePrice } = await this.stripeService.createProduct(product);
          
          await this.productRepository.update(product.idProduct, {
            stripeProductId: stripeProduct.id,
            stripePriceId: stripePrice.id,
          });
        }

        const itemTotal = product.price * item.quantity;
        totalAmount += itemTotal;

        orderItems.push({
          idProduct: item.productId,
          quantity: item.quantity,
          unitPrice: product.price,
          totalPrice: itemTotal,
        });
      }

      // Add shipping and tax
      const shippingCost = createOrderDto.shippingCost || 0;
      const taxAmount = createOrderDto.taxAmount || 0;
      totalAmount += shippingCost + taxAmount;

      // Create order with PENDING status (not PAID yet)
      const order = this.orderRepository.create({
        idPerson: createOrderDto.personId,
        amount: totalAmount - shippingCost - taxAmount,
        shippingCost,
        taxAmount,
        totalAmount,
        shippingAddress: createOrderDto.shippingAddress,
        billingAddress: createOrderDto.billingAddress,
        notes: createOrderDto.notes,
        status: OrderStatus.PENDING,
      });

      const savedOrder = await queryRunner.manager.save(Order, order);

      // Create Stripe Payment Intent
      const paymentIntent = await this.stripeService.createPaymentIntent(savedOrder, stripeCustomerId);

      // Update order with payment intent ID
      await queryRunner.manager.update(Order, savedOrder.idOrder, {
        stripePaymentIntentId: paymentIntent.id,
      });

      // Create order items and reserve stock
      for (const item of orderItems) {
        const orderItem = this.orderItemRepository.create({
          ...item,
          idOrder: savedOrder.idOrder,
        });
        await queryRunner.manager.save(OrderItem, orderItem);

        // Reserve stock
        await queryRunner.manager
          .createQueryBuilder()
          .update(Product)
          .set({ 
            stockQuantity: () => `stock_quantity - ${item.quantity}`,
            reservedQuantity: () => `reserved_quantity + ${item.quantity}`
          })
          .where('id_product = :id', { id: item.idProduct })
          .execute();
      }

      await queryRunner.commitTransaction();

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        totalAmount,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
} 