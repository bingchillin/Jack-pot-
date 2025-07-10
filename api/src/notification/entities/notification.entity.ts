import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Person } from '../../person/entities/person.entity';
import { ObjectEntity } from '../../object/entities/object.entity';

@Entity('notification')
export class Notification {
  @PrimaryGeneratedColumn({ name: 'id_notification' })
  idNotification: number;

  @Column({ length: 250, nullable: true })
  title: string;

  @Column({ length: 1000, nullable: true })
  description: string;

  @Column({ name: 'id_object', nullable: true })
  idObject: number;

  @ManyToOne(() => ObjectEntity, object => object.notifications, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_object' })
  object: ObjectEntity;

  @Column({ name: 'id_person', nullable: true })
  idPerson: number;

  @ManyToOne(() => Person, person => person.notifications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_person' })
  person: Person;

  @Column({ length: 5000, nullable: true })
  advise: string;

  @Column({ name: 'isRead', default: false })
  @Index()
  isRead: boolean;

  // New fields for social notifications
  @Column({ 
    name: 'notification_type', 
    type: 'varchar', 
    length: 50, 
    default: 'plant_care'
  })
  @Index()
  notificationType: string; // 'plant_care', 'comment_like', 'comment_mention', 'comment_reply'

  @Column({ name: 'id_comment', nullable: true })
  @Index()
  idComment: number; // Reference to comment for social notifications

  @Column({ name: 'id_triggering_person', nullable: true })
  @Index()
  idTriggeringPerson: number; // Person who triggered the notification (liker, mentioner, replier)

  @ManyToOne(() => Person, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_triggering_person' })
  triggeringPerson: Person;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}