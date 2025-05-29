import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyResetCodeDto {
    @ApiProperty({
        description: 'Email of the user',
        example: 'user@example.com'
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        description: '6-digit verification code',
        example: '123456'
    })
    @IsString()
    @IsNotEmpty()
    @Length(6, 6)
    code: string;
} 