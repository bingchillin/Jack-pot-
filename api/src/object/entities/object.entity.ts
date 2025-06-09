import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, Index } from 'typeorm';
import { CategoryType } from '../../category-type/entities/category-type.entity';
import { ObjectProfile } from '../../object-profile/entities/object-profile.entity';
import { EventParty } from '../../event-party/entities/event-party.entity';
import { Notification } from '../../notification/entities/notification.entity';

@Entity('object')
export class ObjectEntity {
  @PrimaryGeneratedColumn({ name: 'id_object' })
  idObject: number;

  @Column({ length: 250, nullable: true })
  @Index()
  title: string;

  @Column({ length: 1000, nullable: true })
  description: string;

  @Column({ name: 'id_category_type', nullable: true })
  idCategoryType: number;

  @ManyToOne(() => CategoryType, categoryType => categoryType.objects, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_category_type' })
  categoryType: CategoryType;

  @Column({ length: 5000, nullable: true })
  advise: string;

  @Column({ name: 'is_reset', default: false })
  isReset: boolean;

  @Column({ name: 'preference_number', nullable: true })
  preferenceNumber: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => EventParty, eventParty => eventParty.object)
  eventParties: EventParty[];

  @OneToMany(() => Notification, notification => notification.object)
  notifications: Notification[];

  @OneToMany(() => ObjectProfile, objectProfile => objectProfile.object)
  objectProfiles: ObjectProfile[];
}