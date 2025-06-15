import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Index, JoinColumn } from 'typeorm';
import { Person } from '../../person/entities/person.entity';

export enum ContactStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  BLOCKED = 'blocked'
}

@Entity('contacts')
@Index(['requesterId', 'receiverId'], { unique: true })
export class Contact {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'requester_id' })
  requesterId: number;

  @Column({ name: 'receiver_id' })
  receiverId: number;

  @Column({
    type: 'enum',
    enum: ContactStatus,
    default: ContactStatus.PENDING
  })
  status: ContactStatus;

  @Column({ name: 'blocked_by', nullable: true })
  blockedBy: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Person)
  @JoinColumn({ name: 'requester_id', referencedColumnName: 'idPerson' })
  requester: Person;

  @ManyToOne(() => Person)
  @JoinColumn({ name: 'receiver_id', referencedColumnName: 'idPerson' })
  receiver: Person;
}