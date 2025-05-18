import { PartialType } from '@nestjs/swagger';
import { CreateComposantDto } from './create-composant.dto';

export class UpdateComposantDto extends PartialType(CreateComposantDto) {} 