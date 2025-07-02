import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Return, ReturnStatus } from './entities/return.entity';
import { Order, OrderStatus, ShippingStatus } from './entities/order.entity';
import { CreateReturnDto } from './dto/create-return.dto';
import { ReturnDto } from './dto/return.dto';
import { StripeService } from '../stripe/stripe.service';
import { MailerService } from '../mailer/mailer.service';

@Injectable()
export class ReturnService {
  constructor(
    @InjectRepository(Return)
    private returnRepository: Repository<Return>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    private stripeService: StripeService,
    private mailerService: MailerService,
  ) {}

  async createReturn(orderId: number, createReturnDto: CreateReturnDto): Promise<ReturnDto> {
    // Check if order exists and is eligible for return
    const order = await this.orderRepository.findOne({
      where: { idOrder: orderId },
      relations: ['person', 'orderItems', 'orderItems.product'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    // Check eligibility
    this.checkReturnEligibility(order);

    // Check if return already exists
    const existingReturn = await this.returnRepository.findOne({
      where: { idOrder: orderId },
    });

    if (existingReturn) {
      throw new BadRequestException('Return request already exists for this order');
    }

    // Create return
    const returnEntity = this.returnRepository.create({
      idOrder: orderId,
      reason: createReturnDto.reason,
      status: ReturnStatus.REQUESTED,
    });

    const savedReturn = await this.returnRepository.save(returnEntity);

    return this.mapToDto(savedReturn);
  }

  async markAsReceived(returnId: number): Promise<ReturnDto> {
    const returnEntity = await this.returnRepository.findOne({
      where: { idReturn: returnId },
      relations: ['order', 'order.person', 'order.orderItems', 'order.orderItems.product'],
    });

    if (!returnEntity) {
      throw new NotFoundException(`Return with ID ${returnId} not found`);
    }

    if (returnEntity.status !== ReturnStatus.REQUESTED) {
      throw new BadRequestException('Return is not in REQUESTED status');
    }

    // Update return status
    returnEntity.status = ReturnStatus.RECEIVED;
    returnEntity.receivedAt = new Date();

    // Process refund
    const order = returnEntity.order;
    if (order.stripePaymentIntentId) {
      try {
        const refund = await this.stripeService.createRefund(
          order.stripePaymentIntentId,
          order.totalAmount // Full refund
        );

        // Update order status
        await this.orderRepository.update(order.idOrder, {
          status: OrderStatus.REFUNDED,
          refundedAt: new Date(),
          refundAmount: order.totalAmount,
        });

        returnEntity.refundedAt = new Date();

        // Restock inventory
        for (const orderItem of order.orderItems) {
          await this.orderRepository.manager
            .createQueryBuilder()
            .update('products')
            .set({ 
              stockQuantity: () => `stock_quantity + ${orderItem.quantity}`,
            })
            .where('id_product = :id', { id: orderItem.idProduct })
            .execute();
        }

      } catch (error) {
        console.error('Error processing refund:', error);
        // Continue without refund for now, can be processed manually
      }
    }

    const updatedReturn = await this.returnRepository.save(returnEntity);

    // TODO: Send email notification when return processed
    // Email notification will be implemented later

    return this.mapToDto(updatedReturn);
  }

  async getReturnByOrderId(orderId: number): Promise<ReturnDto | null> {
    const returnEntity = await this.returnRepository.findOne({
      where: { idOrder: orderId },
    });

    return returnEntity ? this.mapToDto(returnEntity) : null;
  }

  async getAllReturns(): Promise<ReturnDto[]> {
    const returns = await this.returnRepository.find({
      relations: ['order'],
      order: { createdAt: 'DESC' },
    });

    return returns.map(returnEntity => this.mapToDto(returnEntity));
  }

  private checkReturnEligibility(order: Order): void {
    // Check if order is delivered
    if (order.shippingStatus !== ShippingStatus.DELIVERED || !order.deliveredAt) {
      throw new BadRequestException('Order must be delivered to request a return');
    }

    // Check 14-day window
    const now = new Date();
    const deliveryDate = new Date(order.deliveredAt);
    const daysDifference = (now.getTime() - deliveryDate.getTime()) / (1000 * 3600 * 24);

    if (daysDifference > 14) {
      throw new BadRequestException('Return period has expired. Returns must be requested within 14 days of delivery');
    }

    // Check order status
    if (order.status !== OrderStatus.PAID) {
      throw new BadRequestException('Only paid orders can be returned');
    }
  }

  private mapToDto(returnEntity: Return): ReturnDto {
    return {
      idReturn: returnEntity.idReturn,
      idOrder: returnEntity.idOrder,
      status: returnEntity.status,
      reason: returnEntity.reason,
      createdAt: returnEntity.createdAt.toISOString(),
      receivedAt: returnEntity.receivedAt?.toISOString(),
      refundedAt: returnEntity.refundedAt?.toISOString(),
    };
  }
} 