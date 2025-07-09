import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index, Unique } from 'typeorm';
import { Person } from '../../person/entities/person.entity';
import { Comment } from './comment.entity';

@Entity('comment_mention')
@Unique(['idComment', 'idPersonMentioned']) // Prevent duplicate mentions
export class CommentMention {
  @PrimaryGeneratedColumn({ name: 'id_mention' })
  idMention: number;

  @Column({ name: 'id_comment' })
  @Index()
  idComment: number;

  @ManyToOne(() => Comment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_comment' })
  comment: Comment;

  @Column({ name: 'id_person_mentioned' })
  @Index()
  idPersonMentioned: number;

  @ManyToOne(() => Person, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_person_mentioned' })
  mentionedPerson: Person;

  @Column({ name: 'id_person_mentioner' })
  @Index()
  idPersonMentioner: number;

  @ManyToOne(() => Person, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_person_mentioner' })
  mentionerPerson: Person;

  @Column({ name: 'position_start' })
  positionStart: number;

  @Column({ name: 'position_end' })
  positionEnd: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
} 