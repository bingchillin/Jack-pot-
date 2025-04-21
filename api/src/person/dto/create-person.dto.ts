import { IsEmail, IsString, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePersonDto {
    @ApiProperty({ example: 'test@test.com', description: 'Email address' })
    @IsEmail()
    mail: string;

    @ApiProperty({ example: 'John', description: 'First name' })
    @IsString()
    firstname: string;

    @ApiProperty({ example: 'Doe', description: 'Last name' })
    @IsString()
    surname: string;

    @ApiProperty({ example: 'password123', description: 'Password (min 6 characters)' })
    @IsString()
    @MinLength(6)
    password: string;

    @ApiProperty({ example: '123456789', description: 'Phone number', required: false })
    @IsString()
    @IsOptional()
    numberPhone?: string;

    @ApiProperty({ example: 1, description: 'Role ID', required: false })
    @IsOptional()
    idRole?: number;
} 