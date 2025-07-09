import { IsString, IsNotEmpty, IsOptional, IsNumber, IsIn, ValidateIf } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({
    description: 'The content of the comment',
    example: 'This is a great post!',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({
    description: 'URL of the image attached to the comment',
    example: 'http://localhost:3000/uploads/1234567890-abc123.jpg',
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'Tag to categorize the comment (only allowed for main posts, not replies)',
    example: 'Conversation',
    enum: ['Conversation', 'Conseil'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['Conversation', 'Conseil'])
  @ValidateIf((obj) => obj.parentCommentId === null || obj.parentCommentId === undefined)
  tag?: string;

  @ApiProperty({
    description: 'The ID of the person creating the comment',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  idPerson: number;

  @ApiPropertyOptional({
    description: 'The ID of the parent comment if this is a reply',
    example: 5,
  })
  @IsOptional()
  @IsNumber()
  parentCommentId?: number;
}