import { IsString, IsOptional, IsDate, IsNumber, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGameDto {
    @ApiProperty({ 
        example: 'Chess Tournament Final', 
        description: 'Title of the game',
        minLength: 3,
        maxLength: 250,
        required: true
    })
    @IsString()
    @MinLength(3)
    @MaxLength(250)
    title: string;

    @ApiProperty({ 
        example: 'Final match of the chess tournament between the top two players', 
        description: 'Detailed description of the game',
        minLength: 10,
        maxLength: 5000,
        required: true
    })
    @IsString()
    @MinLength(10)
    @MaxLength(5000)
    description: string;

    @ApiProperty({ 
        example: 1, 
        description: 'ID of the winning player',
        required: false
    })
    @IsOptional()
    @IsNumber()
    idWon?: number;

    @ApiProperty({ 
        example: 2, 
        description: 'ID of the losing player',
        required: false
    })
    @IsOptional()
    @IsNumber()
    idLose?: number;

    @ApiProperty({ 
        example: '2024-07-15', 
        description: 'Start date of the game',
        required: false
    })
    @IsOptional()
    @IsDate()
    beginDate?: Date;

    @ApiProperty({ 
        example: '2024-07-15', 
        description: 'End date of the game',
        required: false
    })
    @IsOptional()
    @IsDate()
    endDate?: Date;

    @ApiProperty({ 
        example: '1. Standard chess rules apply\n2. Time control: 90 minutes + 30 seconds increment\n3. No draw offers before move 30', 
        description: 'Rules and regulations for the game',
        maxLength: 5000,
        required: false
    })
    @IsOptional()
    @IsString()
    @MaxLength(5000)
    rules?: string;

    @ApiProperty({ 
        example: 1, 
        description: 'ID of the associated event party',
        required: true
    })
    @IsNumber()
    idEventParty: number;
} 