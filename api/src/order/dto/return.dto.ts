import { ApiProperty } from '@nestjs/swagger';
import { ReturnStatus } from '../entities/return.entity';

export class ReturnDto {
  @ApiProperty({ example: 1, description: 'Return ID' })
  idReturn: number;

  @ApiProperty({ example: 1, description: 'Order ID' })
  idOrder: number;

  @ApiProperty({ 
    example: ReturnStatus.REQUESTED, 
    enum: ReturnStatus,
    description: 'Return status' 
  })
  status: ReturnStatus;

  @ApiProperty({ 
    example: 'Product arrived damaged', 
    description: 'Reason for return',
    required: false
  })
  reason?: string;

  @ApiProperty({ 
    example: '2024-01-15T10:00:00Z', 
    description: 'Return request date' 
  })
  createdAt: string;

  @ApiProperty({ 
    example: '2024-01-20T14:30:00Z', 
    description: 'Date when return was received',
    required: false
  })
  receivedAt?: string;

  @ApiProperty({ 
    example: '2024-01-20T15:00:00Z', 
    description: 'Date when refund was processed',
    required: false
  })
  refundedAt?: string;
} 