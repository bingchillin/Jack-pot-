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

  async findByPerson(personId: number): Promise<Order[]> {
    return await this.orderRepository.find({
      where: { idPerson: personId },
      relations: ['orderItems', 'orderItems.product'],
      order: { createdAt: 'DESC' },
    });
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
} 