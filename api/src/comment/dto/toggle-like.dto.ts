import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export class ToggleLikeDto {
  @ApiProperty({
    description: 'The ID of the person toggling the like',
    example: 1,
    type: Number,
  })
  @IsInt()
  @IsPositive()
  idPerson: number;
} 