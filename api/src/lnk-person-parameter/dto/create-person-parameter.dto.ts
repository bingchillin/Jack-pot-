import { IsString, IsOptional, MaxLength, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePersonParameterDto {
    @ApiProperty({ description: 'The title of the person parameter', maxLength: 250, required: false })
    @IsString()
    @IsOptional()
    @MaxLength(250)
    title?: string;

    @ApiProperty({ description: 'The description of the person parameter', maxLength: 1000, required: false })
    @IsString()
    @IsOptional()
    @MaxLength(1000)
    description?: string;

    @ApiProperty({ description: 'Advice for the person parameter', maxLength: 5000, required: false })
    @IsString()
    @IsOptional()
    @MaxLength(5000)
    advise?: string;

    @ApiProperty({ description: 'The ID of the associated person', required: false })
    @IsNumber()
    @IsOptional()
    idPerson?: number;

    @ApiProperty({ description: 'The ID of the associated parameter type', required: false })
    @IsNumber()
    @IsOptional()
    idParameterType?: number;

    @ApiProperty({ description: 'The value of the parameter', required: false })
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsOptional()
    value?: number;
} 