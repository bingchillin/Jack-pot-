import { IsString, IsNumber, IsBoolean, IsOptional, MinLength, Min, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePlantDto {
    @ApiProperty({ 
        example: 'Monstera Deliciosa', 
        description: 'Name of the plant',
        minLength: 3,
        maxLength: 100,
        required: true
    })
    @IsString()
    @MinLength(3)
    @MaxLength(100)
    name: string;

    @ApiProperty({ 
        example: 'A beautiful tropical plant with distinctive split leaves', 
        description: 'Detailed description of the plant',
        minLength: 10,
        maxLength: 500,
        required: true
    })
    @IsString()
    @MinLength(10)
    @MaxLength(500)
    description: string;

    @ApiProperty({ 
        example: 29.99, 
        description: 'Price of the plant in euros',
        minimum: 0,
        required: true
    })
    @IsNumber()
    @Min(0)
    price: number;

    @ApiProperty({ 
        example: 'Indoor', 
        description: 'Category of the plant (e.g., Indoor, Outdoor, Succulent)',
        minLength: 3,
        maxLength: 50,
        required: true
    })
    @IsString()
    @MinLength(3)
    @MaxLength(50)
    category: string;

    @ApiProperty({ 
        example: true, 
        description: 'Whether the plant is available for purchase',
        required: true
    })
    @IsBoolean()
    isAvailable: boolean;

    @ApiProperty({ 
        example: 1, 
        description: 'ID of the person who owns/manages this plant',
        required: false
    })
    @IsOptional()
    @IsNumber()
    idPerson?: number;
} 