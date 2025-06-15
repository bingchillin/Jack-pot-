import { IsNumber, IsNotEmpty } from 'class-validator';

export class CreateContactDto {
  @IsNumber()
  @IsNotEmpty()
  receiverId: number;
}

// dto/update-contact.dto.ts
import { IsEnum } from 'class-validator';
import { ContactStatus } from '../entities/contact.entity';

export class UpdateContactDto {
  @IsEnum(ContactStatus)
  status: ContactStatus;
}