import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class ConfirmPaymentDto {
    @ApiProperty({ 
        example: 'pi_1234567890abcdef', 
        description: 'Stripe Payment Intent ID to confirm' 
    })
    @IsString()
    @IsNotEmpty()
    paymentIntentId: string;

    @ApiProperty({ 
        example: 'pm_1234567890abcdef', 
        description: 'Stripe Payment Method ID used',
        required: false 
    })
    @IsString()
    @IsOptional()
    paymentMethodId?: string;
} 