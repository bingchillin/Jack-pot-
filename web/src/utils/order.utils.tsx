import React from 'react';
import { 
  Package, 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertCircle,
  Truck
} from 'lucide-react';
import { OrderStatus } from '@/interfaces/order.interface';

export const getStatusIcon = (status: OrderStatus, size: 'sm' | 'md' | 'lg' = 'md') => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  switch (status) {
    case OrderStatus.DELIVERED:
      return <CheckCircle className={`${sizeClasses[size]} text-green-600`} />;
    case OrderStatus.SHIPPED:
      return <Package className={`${sizeClasses[size]} text-blue-600`} />;
    case OrderStatus.PAYMENT_PROCESSING:
      return <Clock className={`${sizeClasses[size]} text-yellow-600`} />;
    case OrderStatus.PAID:
      return <CheckCircle className={`${sizeClasses[size]} text-green-600`} />;
    case OrderStatus.CANCELLED:
      return <XCircle className={`${sizeClasses[size]} text-red-600`} />;
    case OrderStatus.REFUNDED:
      return <XCircle className={`${sizeClasses[size]} text-purple-600`} />;
    case OrderStatus.PAYMENT_FAILED:
      return <XCircle className={`${sizeClasses[size]} text-red-600`} />;
    default:
      return <AlertCircle className={`${sizeClasses[size]} text-gray-600`} />;
  }
};

export const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.DELIVERED:
      return 'bg-green-100 text-green-800 border-green-200';
    case OrderStatus.SHIPPED:
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case OrderStatus.PAYMENT_PROCESSING:
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case OrderStatus.PAID:
      return 'bg-green-100 text-green-800 border-green-200';
    case OrderStatus.CANCELLED:
      return 'bg-red-100 text-red-800 border-red-200';
    case OrderStatus.REFUNDED:
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case OrderStatus.PAYMENT_FAILED:
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getStatusDescription = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.DELIVERED:
      return 'Your order has been delivered successfully!';
    case OrderStatus.SHIPPED:
      return 'Your order is on its way to you.';
    case OrderStatus.PAYMENT_PROCESSING:
      return 'We are processing your payment.';
    case OrderStatus.PAID:
      return 'Your payment has been confirmed and we are preparing your order.';
    case OrderStatus.CANCELLED:
      return 'This order has been cancelled.';
    case OrderStatus.REFUNDED:
      return 'This order has been refunded.';
    case OrderStatus.PAYMENT_FAILED:
      return 'Payment for this order has failed.';
    default:
      return 'Order status unknown.';
  }
};

export const canCancelOrder = (order: { status: OrderStatus }) => {
  return order.status === OrderStatus.PENDING || order.status === OrderStatus.PAYMENT_PROCESSING;
};

export const hasActiveOrders = (orders: { status: OrderStatus }[]) => {
  return orders.some(order => 
    order.status === OrderStatus.PAYMENT_PROCESSING || 
    order.status === OrderStatus.PENDING ||
    order.status === OrderStatus.PAID
  );
}; 