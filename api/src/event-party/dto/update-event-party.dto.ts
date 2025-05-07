import { PartialType } from '@nestjs/swagger';
import { CreateEventPartyDto } from './create-event-party.dto';

export class UpdateEventPartyDto extends PartialType(CreateEventPartyDto) {} 