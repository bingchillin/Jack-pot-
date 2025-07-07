import { IsString, IsNumber, IsOptional, IsEnum, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendPlantNotificationDto {
  @ApiProperty({ description: 'Person ID to send notification to' })
  @IsNumber()
  personId: number;

  @ApiProperty({ description: 'Object/Plant ID related to the notification' })
  @IsNumber()
  objectId: number;

  @ApiProperty({ description: 'Notification title', maxLength: 250 })
  @IsString()
  @MaxLength(250)
  title: string;

  @ApiProperty({ description: 'Notification description', maxLength: 1000 })
  @IsString()
  @MaxLength(1000)
  description: string;

  @ApiProperty({ description: 'Advice for the user', maxLength: 5000 })
  @IsString()
  @MaxLength(5000)
  advise: string;

  @ApiProperty({ description: 'Plant name', required: false })
  @IsOptional()
  @IsString()
  plantName?: string;

  @ApiProperty({ 
    description: 'Sensor type that triggered the notification',
    enum: ['moisture', 'light', 'temperature', 'nutrients'],
    required: false
  })
  @IsOptional()
  @IsEnum(['moisture', 'light', 'temperature', 'nutrients'])
  sensorType?: string;

  @ApiProperty({ 
    description: 'Alert level',
    enum: ['low', 'medium', 'high', 'critical'],
    required: false,
    default: 'medium'
  })
  @IsOptional()
  @IsEnum(['low', 'medium', 'high', 'critical'])
  alertLevel?: 'low' | 'medium' | 'high' | 'critical';
} 