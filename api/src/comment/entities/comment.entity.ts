import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, ManyToMany, JoinTable, Index, DeleteDateColumn } from 'typeorm';
import { Person } from '../../person/entities/person.entity';
import { CommentLike } from './comment-like.entity';

@Entity('comment')
export class Comment {
  @PrimaryGeneratedColumn({ name: 'id_comment' })
  idComment: number;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'image_url', nullable: true })
  imageUrl: string;

  @Column({ name: 'tag', nullable: true })
  tag: string;

  @Column({ name: 'id_person' })
  @Index()
  idPerson: number;

  @ManyToOne(() => Person, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_person' })
  person: Person;

  @Column({ name: 'parent_comment_id', nullable: true })
  parentCommentId: number;

  @ManyToOne(() => Comment, comment => comment.replies, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'parent_comment_id' })
  parentComment: Comment;

  @OneToMany(() => Comment, comment => comment.parentComment)
  replies: Comment[];

  @OneToMany(() => CommentLike, (commentLike) => commentLike.comment)
  likes: CommentLike[];

  @Column({ name: 'is_deleted', default: false })
  isDeleted: boolean;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}