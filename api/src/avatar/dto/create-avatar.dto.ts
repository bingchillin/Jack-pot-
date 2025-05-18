import { IsString, IsOptional, MaxLength, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAvatarDto {
    @ApiProperty({ description: 'The title of the avatar', maxLength: 250, required: false })
    @IsString()
    @IsOptional()
    @MaxLength(250)
    title?: string;

    @ApiProperty({ description: 'The description of the avatar', maxLength: 1000, required: false })
    @IsString()
    @IsOptional()
    @MaxLength(1000)
    description?: string;

    @ApiProperty({ description: 'Advice for the avatar', maxLength: 5000, required: false })
    @IsString()
    @IsOptional()
    @MaxLength(5000)
    advise?: string;

    @ApiProperty({ description: 'The ID of the associated plant type', required: false })
    @IsNumber()
    @IsOptional()
    idPlantType?: number;
} 