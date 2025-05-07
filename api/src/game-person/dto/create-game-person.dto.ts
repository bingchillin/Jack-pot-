import { IsBoolean, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGamePersonDto {
    @ApiProperty({ 
        example: 1, 
        description: 'ID of the game',
        required: true
    })
    @IsNumber()
    idGame: number;

    @ApiProperty({ 
        example: 1, 
        description: 'ID of the person',
        required: true
    })
    @IsNumber()
    idPerson: number;

    @ApiProperty({ 
        example: true, 
        description: 'Whether the person is the owner of the game',
        required: false,
        default: false
    })
    @IsOptional()
    @IsBoolean()
    isOwner?: boolean;

    @ApiProperty({ 
        example: false, 
        description: 'Whether the person is a player in the game',
        required: false,
        default: false
    })
    @IsOptional()
    @IsBoolean()
    isPlayer?: boolean;
} 