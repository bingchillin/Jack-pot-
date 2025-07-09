import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Person } from '../../person/entities/person.entity';
import { Comment } from './comment.entity';

@Entity('comment_flag')
export class CommentFlag {
  @PrimaryGeneratedColumn({ name: 'id_comment_flag' })
  idCommentFlag: number;

  @Column({ name: 'id_comment' })
  @Index()
  idComment: number;

  @ManyToOne(() => Comment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_comment' })
  comment: Comment;

  @Column({ name: 'id_person' })
  @Index()
  idPerson: number;

  @ManyToOne(() => Person, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_person' })
  person: Person;

  @Column({ 
    type: 'varchar', 
    length: 50,
    default: 'inappropriate'
  })
  reason: string; // 'inappropriate', 'spam', 'harassment', 'hate_speech', 'other'

  @Column({ type: 'text', nullable: true })
  details?: string; // Additional details provided by the reporter

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
} 