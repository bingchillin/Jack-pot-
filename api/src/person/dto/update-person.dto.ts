import { PartialType } from '@nestjs/swagger';
import { CreatePersonDto } from './create-person.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsDate, IsNumber, MaxLength } from 'class-validator';

export class UpdatePersonDto extends PartialType(CreatePersonDto) {
    @ApiProperty({ 
        example: 'newSecurePassword123', 
        description: 'New password (min 6 characters)',
        minLength: 6,
        required: false,
        format: 'password'
    })
    password?: string;

    @IsOptional()
    @IsString()
    verificationCode?: string;

    @IsOptional()
    @IsDate()
    verificationCodeExpires?: Date;

    @IsOptional()
    @IsNumber()
    resetTokenVersion?: number;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    numberPhone?: string;
} 