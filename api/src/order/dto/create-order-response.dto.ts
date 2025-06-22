import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '../entities/order.entity';

export class CreateOrderResponseDto {
    @ApiProperty({ example: 1, description: 'Order ID' })
    idOrder: number;

    @ApiProperty({ example: 1, description: 'Person ID who created the order' })
    personId: number;

    @ApiProperty({ example: 149.98, description: 'Total amount including shipping and tax' })
    totalAmount: number;

    @ApiProperty({ example: 'USD', description: 'Currency code' })
    currency: string;

    @ApiProperty({ 
        example: OrderStatus.PENDING, 
        enum: OrderStatus,
        description: 'Current order status' 
    })
    status: OrderStatus;

    @ApiProperty({ 
        example: 'pi_1234567890abcdef', 
        description: 'Stripe Payment Intent ID',
        required: false 
    })
    stripePaymentIntentId?: string;

    @ApiProperty({ 
        example: 'pi_1234567890abcdef_secret_1234567890abcdef', 
        description: 'Stripe client secret for frontend payment processing',
        required: false 
    })
    clientSecret?: string;

    @ApiProperty({ 
        example: true, 
        description: 'Whether this order requires payment' 
    })
    requiresPayment: boolean;

    @ApiProperty({ 
        example: 'Order created successfully. Complete payment to proceed.', 
        description: 'Human-readable message about the order status' 
    })
    message: string;

    @ApiProperty({ 
        example: 'cus_1234567890abcdef', 
        description: 'Stripe customer ID used for payment',
        required: false 
    })
    stripeCustomerId?: string;
} 