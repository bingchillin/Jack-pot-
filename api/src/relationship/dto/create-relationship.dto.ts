import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRelationshipDto {
    @ApiProperty({ description: 'The title of the relationship', maxLength: 250 })
    @IsString()
    @IsNotEmpty()
    @MaxLength(250)
    title: string;

    @ApiProperty({ description: 'The description of the relationship', maxLength: 1000, required: false })
    @IsString()
    @IsOptional()
    @MaxLength(1000)
    description?: string;
} 