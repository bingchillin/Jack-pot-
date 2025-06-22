import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, OneToMany } from 'typeorm';
import { OrderItem } from '../../order/entities/order-item.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn({ name: 'id_product' })
  idProduct: number;

  @Column({ length: 250, nullable: false })
  @Index()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  price: number;

  @Column({ length: 3, default: 'USD' })
  currency: string;

  @Column({ name: 'stripe_product_id', length: 255, nullable: true })
  @Index()
  stripeProductId: string;

  @Column({ name: 'stripe_price_id', length: 255, nullable: true })
  @Index()
  stripePriceId: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'image_url', length: 1000, nullable: true })
  imageUrl: string;

  @Column({ name: 'stock_quantity', default: 0 })
  stockQuantity: number;

  @Column({ name: 'sku', length: 100, nullable: true })
  @Index()
  sku: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => OrderItem, orderItem => orderItem.product)
  orderItems: OrderItem[];
} 