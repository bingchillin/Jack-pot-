import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateReturnDto {
  @ApiProperty({ 
    description: 'Reason for return', 
    example: 'Product arrived damaged',
    required: false 
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
} 