import { PartialType } from '@nestjs/swagger';
import { CreateEventPartyPersonDto } from './create-event-party-person.dto';

export class UpdateEventPartyPersonDto extends PartialType(CreateEventPartyPersonDto) {} 