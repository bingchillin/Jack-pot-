import { IsEmail, IsString, IsOptional, MinLength, IsPhoneNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePersonDto {
    @ApiProperty({ 
        example: 'john.doe@example.com', 
        description: 'Email address',
        format: 'email',
        required: true
    })
    @IsEmail()
    mail: string;

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
        example: '+33612345678', 
        description: 'Phone number in international format',
        required: false,
        pattern: '^\\+[1-9]\\d{1,14}$'
    })
    @IsString()
    @IsPhoneNumber()
    numberPhone: string;

    @ApiProperty({ 
        example: 1, 
        description: 'Role ID (1: Admin, 2: User)',
        required: false,
        minimum: 1
    })
    idRole: number;
} 