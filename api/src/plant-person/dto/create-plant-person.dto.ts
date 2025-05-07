import { IsBoolean, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePlantPersonDto {
    @ApiProperty({ 
        example: 1, 
        description: 'ID of the plant',
        required: true
    })
    @IsNumber()
    idPlant: number;

    @ApiProperty({ 
        example: 1, 
        description: 'ID of the person',
        required: true
    })
    @IsNumber()
    idPerson: number;

    @ApiProperty({ 
        example: true, 
        description: 'Whether the person is the owner of the plant',
        required: false,
        default: false
    })
    @IsOptional()
    @IsBoolean()
    isOwner?: boolean;

    @ApiProperty({ 
        example: false, 
        description: 'Whether the person is the seller of the plant',
        required: false,
        default: false
    })
    @IsOptional()
    @IsBoolean()
    isSeller?: boolean;
} 