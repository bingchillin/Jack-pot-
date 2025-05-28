import { IsEmail, IsString, IsOptional, MinLength, IsBoolean, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePersonDto {
    @ApiProperty({ 
        example: 'john.doe@example.com', 
        description: 'Email address',
        format: 'email',
        required: true
    })
    @IsEmail()
    email: string;

    @ApiProperty({ 
        example: 'John', 
        description: 'First name',
        minLength: 2,
        required: true
    })
    @IsString()
    firstname: string;

    @ApiProperty({ 
        example: 'Doe', 
        description: 'Last name',
        minLength: 2,
        required: true
    })
    @IsString()
    surname: string;

    @ApiProperty({ 
        example: 'securePassword123', 
        description: 'Password (min 6 characters)',
        minLength: 6,
        required: true,
        format: 'password'
    })
    @IsString()
    @MinLength(6)
    password: string;

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

    @ApiProperty({ 
        example: 1, 
        description: 'Role ID (1: Admin, 2: User)',
        required: false,
        minimum: 1
    })
    idRole: number;

    @IsBoolean()
    @IsOptional()
    isEmailVerified?: boolean;

    @IsString()
    @IsOptional()
    verificationCode?: string;

    @IsOptional()
    verificationCodeExpires?: Date;
} 