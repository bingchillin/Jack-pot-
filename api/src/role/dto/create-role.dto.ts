import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
    @ApiProperty({ 
        example: 'Admin', 
        description: 'Title of the role',
        minLength: 3,
        maxLength: 250,
        required: true
    })
    @IsString()
    @MinLength(3)
    @MaxLength(250)
    title: string;

    @ApiProperty({ 
        example: 'Administrator with full system access', 
        description: 'Detailed description of the role',
        maxLength: 1000,
        required: false
    })
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    description?: string;
} 