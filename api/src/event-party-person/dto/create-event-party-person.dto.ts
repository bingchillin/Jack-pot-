import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEventPartyPersonDto {
    @ApiProperty({ 
        example: 1, 
        description: 'ID of the event party',
        required: true
    })
    @IsNumber()
    idEventParty: number;

    @ApiProperty({ 
        example: 1, 
        description: 'ID of the person',
        required: true
    })
    @IsNumber()
    idPerson: number;
} 