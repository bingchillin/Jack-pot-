import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Person } from '../../person/entities/person.entity';
import { OrderItem } from './order-item.entity';

export enum OrderStatus {
  PENDING = 'pending',
  PAYMENT_PROCESSING = 'payment_processing',
  PAID = 'paid',
  PAYMENT_FAILED = 'payment_failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

export enum ShippingStatus {
  IN_PREPARATION = 'in_preparation',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered'
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn({ name: 'id_order' })
  idOrder: number;

  @Column({ name: 'id_person', nullable: false })
  @Index()
  idPerson: number;

  @ManyToOne(() => Person, person => person.orders, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_person' })
  person: Person;

  @Column({ name: 'stripe_payment_intent_id', length: 255, nullable: true })
  @Index()
  stripePaymentIntentId: string;

  @Column({ name: 'stripe_customer_id', length: 255, nullable: true })
  @Index()
  stripeCustomerId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  amount: number;

  @Column({ length: 3, default: 'USD' })
  currency: string;

  @Column({ 
    type: 'enum', 
    enum: OrderStatus, 
    default: OrderStatus.PENDING 
  })
  status: OrderStatus;

  @Column({ name: 'shipping_address', type: 'jsonb', nullable: true })
  shippingAddress: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
  };

  @Column({ name: 'billing_address', type: 'jsonb', nullable: true })
  billingAddress: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };

  @Column({ name: 'shipping_cost', type: 'decimal', precision: 10, scale: 2, default: 0 })
  shippingCost: number;

  @Column({ name: 'tax_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2, nullable: false })
  totalAmount: number;

  @Column({ 
    type: 'enum', 
    enum: ShippingStatus,
    name: 'shipping_status',
    nullable: true,
    default: ShippingStatus.IN_PREPARATION
  })
  shippingStatus: ShippingStatus;

  @Column({ name: 'tracking_number', length: 255, nullable: true })
  trackingNumber: string;

  @Column({ name: 'carrier', length: 100, nullable: true })
  carrier: string;

  @Column({ name: 'tracking_url', length: 500, nullable: true })
  trackingUrl: string;

  @Column({ name: 'estimated_delivery_date', type: 'timestamp', nullable: true })
  estimatedDeliveryDate: Date;

  @Column({ name: 'shipped_at', type: 'timestamp', nullable: true })
  shippedAt?: Date;

  @Column({ name: 'delivered_at', type: 'timestamp', nullable: true })
  deliveredAt?: Date;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'paid_at', type: 'timestamp', nullable: true })
  paidAt?: Date;

  @Column({ name: 'payment_method', length: 50, nullable: true })
  paymentMethod?: string;

  @Column({ name: 'stripe_payment_method_id', length: 255, nullable: true })
  stripePaymentMethodId?: string;

  @Column({ name: 'refunded_at', type: 'timestamp', nullable: true })
  refundedAt?: Date;

  @Column({ name: 'refund_amount', type: 'decimal', precision: 10, scale: 2, nullable: true })
  refundAmount?: number;

  @Column({ name: 'locale', length: 5, default: 'en' })
  locale: string;

  @OneToMany(() => OrderItem, orderItem => orderItem.order, { cascade: true })
  orderItems: OrderItem[];
} 