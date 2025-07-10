import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsOptional, IsBoolean, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateCommentDto } from './create-comment.dto';

export class UpdateCommentDto extends PartialType(CreateCommentDto) {
  @ApiPropertyOptional({
    description: 'The content of the comment',
    example: 'This is an updated comment!',
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({
    description: 'URL of the image attached to the comment',
    example: 'http://localhost:3000/uploads/1234567890-abc123.jpg',
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'Tag to categorize the comment',
    example: 'Conversation',
    enum: ['Conversation', 'Conseil'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['Conversation', 'Conseil'])
  tag?: string;

  @ApiPropertyOptional({
    description: 'Whether the comment is deleted (soft delete)',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean;
}