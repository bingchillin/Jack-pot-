import { IsString, IsOptional, IsNumber, MaxLength, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateObjectProfileDto {
    @ApiProperty({ description: 'The title of the object profile', maxLength: 250, required: false })
    @IsString()
    @IsOptional()
    @MaxLength(250)
    title?: string;

    @ApiProperty({ description: 'The description of the object profile', maxLength: 1000, required: false })
    @IsString()
    @IsOptional()
    @MaxLength(1000)
    description?: string;

    @ApiProperty({ description: 'Advice for the object profile', maxLength: 5000, required: false })
    @IsString()
    @IsOptional()
    @MaxLength(5000)
    advise?: string;

    @ApiProperty({ description: 'The ID of the object', required: false })
    @IsNumber()
    @IsOptional()
    idObject?: number;

    @ApiProperty({ description: 'The ID of the plant type', required: false })
    @IsNumber()
    @IsOptional()
    idPlantType?: number;

    @ApiProperty({ description: 'For the automatic plant type', required: false })
    @IsBoolean()
    @IsOptional()
    isAutomatic?: boolean;
} 