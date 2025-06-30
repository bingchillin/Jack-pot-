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

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  address: string;
  city: string; // May be empty if not parsed from person.address
  state: string; // May be empty if not parsed from person.address
  postalCode: string; // May be empty if not parsed from person.address
  country: string; // May be empty if not parsed from person.address
  phone?: string;
}

export interface BillingAddress {
  firstName: string;
  lastName: string;
  address: string;
  city: string; // May be empty if not parsed from person.address
  state: string; // May be empty if not parsed from person.address
  postalCode: string; // May be empty if not parsed from person.address
  country: string; // May be empty if not parsed from person.address
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
  stripeCustomerId?: string | null;
  shippingAddress: ShippingAddress | null;
  billingAddress: BillingAddress | null;
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
  notes?: string;
  locale?: string;
  // Shipping address will be automatically populated from user's profile
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