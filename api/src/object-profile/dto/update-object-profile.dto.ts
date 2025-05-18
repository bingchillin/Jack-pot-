import { PartialType } from '@nestjs/swagger';
import { CreateObjectProfileDto } from './create-object-profile.dto';

export class UpdateObjectProfileDto extends PartialType(CreateObjectProfileDto) {} 