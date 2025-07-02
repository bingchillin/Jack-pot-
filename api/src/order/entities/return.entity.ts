import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from './order.entity';

export enum ReturnStatus {
  REQUESTED = 'requested',
  RECEIVED = 'received'
}

@Entity('returns')
export class Return {
  @PrimaryGeneratedColumn({ name: 'id_return' })
  idReturn: number;

  @Column({ name: 'id_order', nullable: false })
  idOrder: number;

  @ManyToOne(() => Order, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_order' })
  order: Order;

  @Column({ 
    type: 'enum', 
    enum: ReturnStatus, 
    default: ReturnStatus.REQUESTED 
  })
  status: ReturnStatus;

  @Column({ name: 'reason', type: 'text', nullable: true })
  reason: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'received_at', type: 'timestamp', nullable: true })
  receivedAt?: Date;

  @Column({ name: 'refunded_at', type: 'timestamp', nullable: true })
  refundedAt?: Date;
} 