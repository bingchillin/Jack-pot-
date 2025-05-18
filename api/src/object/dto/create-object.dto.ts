import { IsString, IsOptional, IsNumber, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateObjectDto {
    @ApiProperty({ description: 'The title of the object', maxLength: 250, required: false })
    @IsString()
    @IsOptional()
    @MaxLength(250)
    title?: string;

    @ApiProperty({ description: 'The description of the object', maxLength: 1000, required: false })
    @IsString()
    @IsOptional()
    @MaxLength(1000)
    description?: string;

    @ApiProperty({ description: 'Advice for the object', maxLength: 5000, required: false })
    @IsString()
    @IsOptional()
    @MaxLength(5000)
    advise?: string;

    @ApiProperty({ description: 'The ID of the category type', required: false })
    @IsNumber()
    @IsOptional()
    idCategoryType?: number;

    @ApiProperty({ description: 'The ID of the person', required: false })
    @IsNumber()
    @IsOptional()
    idPerson?: number;
} 