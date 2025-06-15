import { PartialType } from '@nestjs/swagger';
import { CreateContactDto } from './create-contact.dto';
import { IsEnum } from 'class-validator';
import { ContactStatus } from '../entities/contact.entity';

export class UpdateContactDto extends PartialType(CreateContactDto) {
  @IsEnum(ContactStatus)
  status: ContactStatus;
} 