import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../product/entities/product.entity';
import { Person } from '../person/entities/person.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PersonService } from '../person/person.service';

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
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
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
          throw new BadRequestException(`Failed to prepare payment for this order: ${error.message}`);
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
          throw new BadRequestException(`Insufficient stock for product ${product.name}`);
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
        status: OrderStatus.PENDING,
      });

      const savedOrder = await queryRunner.manager.save(Order, order);

      // Create order items and update stock
      for (const item of orderItems) {
        const orderItem = this.orderItemRepository.create({
          ...item,
          idOrder: savedOrder.idOrder,
        });
        await queryRunner.manager.save(OrderItem, orderItem);

        // Update product stock
        await queryRunner.manager
          .createQueryBuilder()
          .update(Product)
          .set({ stockQuantity: () => `stock_quantity - ${item.quantity}` })
          .where('id_product = :id', { id: item.idProduct })
          .execute();
      }

      await queryRunner.commitTransaction();
      
      return await this.findOne(savedOrder.idOrder);
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
} 