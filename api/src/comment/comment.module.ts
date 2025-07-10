import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { MentionService } from './mention.service';
import { Comment } from './entities/comment.entity';
import { CommentLike } from './entities/comment-like.entity';
import { CommentFlag } from './entities/comment-flag.entity';
import { CommentMention } from './entities/comment-mention.entity';
import { PersonModule } from '../person/person.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment, CommentLike, CommentFlag, CommentMention]),
    PersonModule,
    forwardRef(() => NotificationModule),
  ],
  controllers: [CommentController],
  providers: [CommentService, MentionService],
  exports: [CommentService, MentionService, TypeOrmModule],
})
export class CommentModule {} 