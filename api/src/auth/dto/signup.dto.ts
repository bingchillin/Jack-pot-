import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsPhoneNumber, IsNotEmpty, IsOptional, Matches } from 'class-validator';

export class SignupDto {
    @ApiProperty({
        example: 'john.doe@example.com',
        description: 'User email address',
        format: 'email',
        required: true
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        example: 'securePassword123',
        description: 'User password (min 6 characters)',
        minLength: 6,
        required: true,
        format: 'password'
    })
    @IsString()
    @MinLength(6)
    password: string;

    @ApiProperty({
        example: 'John',
        description: 'First name',
        minLength: 2,
        required: true
    })
    @IsString()
    @IsNotEmpty()
    firstname: string;

    @ApiProperty({
        example: 'Doe',
        description: 'Last name',
        minLength: 2,
        required: true
    })
    @IsString()
    @IsNotEmpty()
    surname: string;

    @ApiProperty({
        example: '1234567890',
        description: 'Phone number (9-15 digits)',
        required: false
    })
    @IsString()
    @Matches(/^[0-9]{9,15}$/, {
        message: 'Phone number must be between 9 and 15 digits'
    })
    @IsOptional()
    numberPhone?: string;

    @IsString()
    verificationCode: string;
} 