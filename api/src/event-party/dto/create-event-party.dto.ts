import { IsString, IsBoolean, IsOptional, IsDate, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEventPartyDto {
    @ApiProperty({ 
        example: 'Summer Gaming Tournament', 
        description: 'Title of the event party',
        minLength: 3,
        maxLength: 250,
        required: false
    })
    @IsOptional()
    @IsString()
    @MinLength(3)
    @MaxLength(250)
    title?: string;

    @ApiProperty({ 
        example: 'Join us for an exciting summer gaming tournament with amazing prizes!', 
        description: 'Detailed description of the event party',
        minLength: 10,
        maxLength: 5000,
        required: false
    })
    @IsOptional()
    @IsString()
    @MinLength(10)
    @MaxLength(5000)
    description?: string;

    @ApiProperty({ 
        example: false, 
        description: 'Whether the event party has been launched',
        required: true
    })
    @IsBoolean()
    isLaunch: boolean;

    @ApiProperty({ 
        example: '2024-07-01', 
        description: 'Start date of the event party',
        required: false
    })
    @IsOptional()
    @IsDate()
    beginDate?: Date;

    @ApiProperty({ 
        example: '2024-07-31', 
        description: 'End date of the event party',
        required: false
    })
    @IsOptional()
    @IsDate()
    endDate?: Date;

    @ApiProperty({ 
        example: '1. All participants must register before the event\n2. No cheating allowed\n3. Prizes will be awarded to top 3 players', 
        description: 'Rules and regulations for the event party',
        maxLength: 5000,
        required: false
    })
    @IsOptional()
    @IsString()
    @MaxLength(5000)
    rules?: string;
} 