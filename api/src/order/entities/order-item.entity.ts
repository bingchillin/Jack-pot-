import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from './order.entity';
import { Product } from '../../product/entities/product.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn({ name: 'id_order_item' })
  idOrderItem: number;

  @Column({ name: 'id_order', nullable: false })
  idOrder: number;

  @ManyToOne(() => Order, order => order.orderItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_order' })
  order: Order;

  @Column({ name: 'id_product', nullable: false })
  idProduct: number;

  @ManyToOne(() => Product, product => product.orderItems)
  @JoinColumn({ name: 'id_product' })
  product: Product;

  @Column({ nullable: false, default: 1 })
  quantity: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 10, scale: 2, nullable: false })
  unitPrice: number;

  @Column({ name: 'total_price', type: 'decimal', precision: 10, scale: 2, nullable: false })
  totalPrice: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
} 