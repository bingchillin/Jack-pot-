import { IsString, IsOptional, IsBoolean, MaxLength, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateContactDto {
    @ApiProperty({ description: 'The relation type', maxLength: 250, required: false })
    @IsString()
    @IsOptional()
    @MaxLength(250)
    relation?: string;

    @ApiProperty({ description: 'The description of the contact', maxLength: 1000, required: false })
    @IsString()
    @IsOptional()
    @MaxLength(1000)
    description?: string;

    @ApiProperty({ description: 'Whether the contact is active', default: false })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @ApiProperty({ description: 'The return value', maxLength: 100, required: false })
    @IsString()
    @IsOptional()
    @MaxLength(100)
    valueReturn?: string;

    @ApiProperty({ description: 'The ID of the person', required: true })
    @IsNumber()
    idPerson: number;

    @ApiProperty({ description: 'The ID of the relationship', required: true })
    @IsNumber()
    idRelationship: number;
} 