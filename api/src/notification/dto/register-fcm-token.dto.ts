import { IsString, IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterFcmTokenDto {
  @ApiProperty({ 
    description: 'Firebase Cloud Messaging token',
    example: 'dGhpcyBpcyBhIGZha2UgdG9rZW4...'
  })
  @IsString()
  @IsNotEmpty()
  fcmToken: string;

  @ApiProperty({ 
    description: 'Device platform',
    enum: ['ios', 'android', 'web'],
    example: 'android'
  })
  @IsEnum(['ios', 'android', 'web'])
  platform: 'ios' | 'android' | 'web';
} 