import { Product } from './product.interface';

export interface OrderItem {
  idOrderItem: number;
  orderId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product: Product;
}

export interface Order {
  idOrder: number;
  personId: number;
  orderNumber: string;
  status: OrderStatus;
  shippingStatus?: ShippingStatus;
  totalAmount: number;
  currency: string;
  stripePaymentIntentId: string | null;
  shippingAddress: string | null;
  billingAddress: string | null;
  trackingNumber?: string;
  carrier?: string;
  trackingUrl?: string;
  estimatedDeliveryDate?: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  refundedAt?: string;
  refundAmount?: number;
  orderItems: OrderItem[];
}

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

export interface CreateOrderRequest {
  items: {
    productId: number;
    quantity: number;
  }[];
  shippingAddress?: string;
  billingAddress?: string;
  notes?: string;
  locale?: string;
}

export interface CreateOrderResponse {
  idOrder: number;
  personId: number;
  totalAmount: number;
  currency: string;
  status: OrderStatus;
  stripePaymentIntentId: string;
  clientSecret: string;
  requiresPayment: boolean;
  message: string;
  stripeCustomerId: string;
}

export interface PaymentStatusResponse {
  status: 'succeeded' | 'processing' | 'requires_payment_method' | 'failed';
  message: string;
}

export interface OrderListResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
}

export interface UpdateShippingStatusRequest {
  shippingStatus: ShippingStatus;
  trackingNumber?: string;
  carrier?: string;
  trackingUrl?: string;
  estimatedDeliveryDate?: string;
} 