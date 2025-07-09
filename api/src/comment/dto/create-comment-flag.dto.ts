import { IsString, IsNotEmpty, IsOptional, IsNumber, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommentFlagDto {
  @ApiProperty({
    description: 'The ID of the comment being flagged',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  idComment: number;

  @ApiProperty({
    description: 'The ID of the person flagging the comment',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  idPerson: number;

  @ApiProperty({
    description: 'The reason for flagging the comment',
    example: 'inappropriate',
    enum: ['inappropriate', 'spam', 'harassment', 'hate_speech', 'other'],
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['inappropriate', 'spam', 'harassment', 'hate_speech', 'other'])
  reason: string;

  @ApiPropertyOptional({
    description: 'Additional details about the flag',
    example: 'This comment contains offensive language',
  })
  @IsOptional()
  @IsString()
  details?: string;
} 