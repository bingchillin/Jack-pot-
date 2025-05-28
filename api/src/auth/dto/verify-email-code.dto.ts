import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';

export class VerifyEmailCodeDto {
  @ApiProperty({
    description: 'The 6-digit verification code sent to the user\'s email',
    example: '123456',
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  @Matches(/^[0-9]{6}$/, {
    message: 'Verification code must be exactly 6 digits',
  })
  code: string;

  @ApiProperty({
    description: 'The email address to verify',
    example: 'user@example.com',
  })
  @IsString()
  @IsNotEmpty()
  email: string;
} 