import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index, Unique } from 'typeorm';
import { Person } from '../../person/entities/person.entity';
import { Comment } from './comment.entity';

@Entity('comment_like')
@Unique(['idPerson', 'idComment'])
export class CommentLike {
  @PrimaryGeneratedColumn({ name: 'id_comment_like' })
  idCommentLike: number;

  @Column({ name: 'id_person' })
  @Index()
  idPerson: number;

  @ManyToOne(() => Person, person => person.commentLikes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_person' })
  person: Person;

  @Column({ name: 'id_comment' })
  @Index()
  idComment: number;

  @ManyToOne(() => Comment, comment => comment.likes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_comment' })
  comment: Comment;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
} 