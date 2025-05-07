import { PartialType } from '@nestjs/swagger';
import { CreateGamePersonDto } from './create-game-person.dto';

export class UpdateGamePersonDto extends PartialType(CreateGamePersonDto) {} 