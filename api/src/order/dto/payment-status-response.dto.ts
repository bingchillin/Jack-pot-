import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '../entities/order.entity';

export class PaymentStatusResponseDto {
    @ApiProperty({ example: 1, description: 'Order ID' })
    orderId: number;

    @ApiProperty({ 
        example: OrderStatus.PAID, 
        enum: OrderStatus,
        description: 'Current order status' 
    })
    orderStatus: OrderStatus;

    @ApiProperty({ 
        example: 'pi_1234567890abcdef', 
        description: 'Stripe Payment Intent ID',
        required: false 
    })
    stripePaymentIntentId?: string;

    @ApiProperty({ 
        example: 'succeeded', 
        description: 'Stripe payment intent status',
        required: false 
    })
    stripePaymentStatus?: string;

    @ApiProperty({ 
        example: 'card', 
        description: 'Payment method used',
        required: false 
    })
    paymentMethod?: string;

    @ApiProperty({ 
        example: '2024-01-15T10:30:00Z', 
        description: 'When payment was completed',
        required: false 
    })
    paidAt?: Date;

    @ApiProperty({ 
        example: 149.98, 
        description: 'Total amount paid' 
    })
    totalAmount: number;

    @ApiProperty({ 
        example: 'USD', 
        description: 'Currency code' 
    })
    currency: string;

    @ApiProperty({ 
        example: true, 
        description: 'Whether payment is complete' 
    })
    isPaid: boolean;

    @ApiProperty({ 
        example: 'Payment completed successfully', 
        description: 'Human-readable status message' 
    })
    message: string;
} 