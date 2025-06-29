import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, ManyToMany, JoinTable, Index } from 'typeorm';
import { Person } from '../../person/entities/person.entity';
import { CommentLike } from './comment-like.entity';

@Entity('comment')
export class Comment {
  @PrimaryGeneratedColumn({ name: 'id_comment' })
  idComment: number;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'id_person' })
  @Index()
  idPerson: number;

  @ManyToOne(() => Person, person => person.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_person' })
  person: Person;

  @Column({ name: 'parent_comment_id', nullable: true })
  @Index()
  parentCommentId: number;

  @ManyToOne(() => Comment, comment => comment.replies, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parent_comment_id' })
  parentComment: Comment;

  @OneToMany(() => Comment, comment => comment.parentComment)
  replies: Comment[];

  @Column({ name: 'is_deleted', default: false })
  isDeleted: boolean;

  @Column({ name: 'deleted_at', nullable: true })
  deletedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => CommentLike, like => like.comment)
  likes: CommentLike[];

  // Propriétés calculées (non persistées)
  likeCount?: number;
  replyCount?: number;
  isLikedByCurrentUser?: boolean;
} 