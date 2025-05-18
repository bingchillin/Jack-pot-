import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryTypeDto {
    @ApiProperty({ description: 'The title of the category type', maxLength: 250, required: false })
    @IsString()
    @IsOptional()
    @MaxLength(250)
    title?: string;

    @ApiProperty({ description: 'The description of the category type', maxLength: 1000, required: false })
    @IsString()
    @IsOptional()
    @MaxLength(1000)
    description?: string;

    @ApiProperty({ description: 'Advice for the category type', maxLength: 5000, required: false })
    @IsString()
    @IsOptional()
    @MaxLength(5000)
    advise?: string;
} 