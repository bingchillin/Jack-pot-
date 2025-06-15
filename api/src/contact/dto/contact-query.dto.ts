import { IsEnum, IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';
import { ContactStatus } from '../entities/contact.entity';
import { ApiProperty } from '@nestjs/swagger';

export class ContactQueryDto {
  @ApiProperty({ enum: ContactStatus, required: false })
  @IsOptional()
  @IsEnum(ContactStatus)
  status?: ContactStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ required: false, default: 20 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

export class ContactStatsDto {
  @ApiProperty()
  totalContacts: number;

  @ApiProperty()
  pendingRequests: number;

  @ApiProperty()
  acceptedContacts: number;

  @ApiProperty()
  blockedContacts: number;

  @ApiProperty()
  rejectedContacts: number;
} 