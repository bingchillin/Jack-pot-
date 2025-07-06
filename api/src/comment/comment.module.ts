import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { Comment } from './entities/comment.entity';
import { PersonModule } from '../person/person.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment]),
    PersonModule,
  ],
  controllers: [CommentController],
  providers: [CommentService],
  exports: [CommentService, TypeOrmModule],
})
export class CommentModule {} 