import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Comment } from './comment.entity';
import { Person } from '../../person/entities/person.entity';

@Entity('comment_like')
@Unique(['idComment', 'idPerson']) // Prevent duplicate likes
export class CommentLike {
  @PrimaryGeneratedColumn({ name: 'id_comment_like' })
  idCommentLike: number;

  @Column({ name: 'id_comment' })
  idComment: number;

  @Column({ name: 'id_person' })
  idPerson: number;

  @ManyToOne(() => Comment, (comment) => comment.likes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_comment' })
  comment: Comment;

  @ManyToOne(() => Person, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_person' })
  person: Person;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
} 