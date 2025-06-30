import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class UpdateProfileDto {
    @ApiProperty({ 
        example: 'John', 
        description: 'First name',
        required: false
    })
    @IsOptional()
    @IsString()
    firstname?: string;

    @ApiProperty({ 
        example: 'Doe', 
        description: 'Last name',
        required: false
    })
    @IsOptional()
    @IsString()
    surname?: string;

    @ApiProperty({ 
        example: '+33612345678', 
        description: 'Phone number',
        required: false
    })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    numberPhone?: string;

    @ApiProperty({ 
        example: '123 Main Street, City, Country', 
        description: 'Address (max 500 characters)',
        required: false,
        maxLength: 500
    })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    address?: string;

    @ApiProperty({ 
        example: 'currentPassword123', 
        description: 'Current password (required for any update)',
        required: true
    })
    @IsString()
    currentPassword: string;

    @ApiProperty({ 
        example: 'newPassword123', 
        description: 'New password (optional)',
        required: false,
        minLength: 6
    })
    @IsOptional()
    @IsString()
    @MinLength(6)
    newPassword?: string;
} 