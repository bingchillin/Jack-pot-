import { IsEnum, IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ShippingStatus } from '../entities/order.entity';

export class UpdateShippingStatusDto {
  @ApiProperty({ 
    enum: ShippingStatus, 
    description: 'New shipping status',
    example: ShippingStatus.SHIPPED
  })
  @IsEnum(ShippingStatus)
  shippingStatus: ShippingStatus;

  @ApiPropertyOptional({ description: 'Tracking number from carrier' })
  @IsOptional()
  @IsString()
  trackingNumber?: string;

  @ApiPropertyOptional({ description: 'Carrier name (e.g., Colissimo, DHL, etc.)' })
  @IsOptional()
  @IsString()
  carrier?: string;

  @ApiPropertyOptional({ description: 'Tracking URL' })
  @IsOptional()
  @IsString()
  trackingUrl?: string;

  @ApiPropertyOptional({ description: 'Estimated delivery date' })
  @IsOptional()
  @IsDateString()
  estimatedDeliveryDate?: string;
} 