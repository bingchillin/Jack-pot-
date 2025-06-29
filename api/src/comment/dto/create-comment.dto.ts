import { IsString, IsNotEmpty, IsOptional, IsNumber, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({
    description: 'Contenu du commentaire',
    example: 'Ceci est un commentaire très intéressant !'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  content: string;

  @ApiPropertyOptional({
    description: 'ID du commentaire parent (pour les réponses)',
    example: 1
  })
  @IsOptional()
  @IsNumber()
  parentCommentId?: number;
} 