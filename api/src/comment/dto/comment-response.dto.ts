import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PersonDto {
  @ApiProperty()
  idPerson: number;

  @ApiProperty()
  firstname: string;

  @ApiProperty()
  surname: string;

  @ApiProperty()
  email: string;
}

export class CommentResponseDto {
  @ApiProperty()
  idComment: number;

  @ApiProperty()
  content: string;

  @ApiProperty()
  idPerson: number;

  @ApiProperty()
  person: PersonDto;

  @ApiPropertyOptional()
  parentCommentId?: number;

  @ApiProperty()
  isDeleted: boolean;

  @ApiPropertyOptional()
  deletedAt?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  likeCount: number;

  @ApiProperty()
  replyCount: number;

  @ApiProperty()
  isLikedByCurrentUser: boolean;

  @ApiPropertyOptional({ type: [CommentResponseDto] })
  replies?: CommentResponseDto[];
} 