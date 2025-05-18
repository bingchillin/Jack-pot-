import { PartialType } from '@nestjs/swagger';
import { CreatePersonParameterDto } from './create-person-parameter.dto';

export class UpdatePersonParameterDto extends PartialType(CreatePersonParameterDto) {} 