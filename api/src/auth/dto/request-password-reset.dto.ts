import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class RequestPasswordResetDto {
  @ApiProperty({
    description: 'Email of the user requesting password reset',
    example: 'user@example.com'
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
} 