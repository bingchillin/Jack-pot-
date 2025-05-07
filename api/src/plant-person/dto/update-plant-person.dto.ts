import { PartialType } from '@nestjs/swagger';
import { CreatePlantPersonDto } from './create-plant-person.dto';

export class UpdatePlantPersonDto extends PartialType(CreatePlantPersonDto) {} 