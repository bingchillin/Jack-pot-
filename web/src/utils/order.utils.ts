import { Order, OrderStatus, ShippingStatus } from '@/interfaces/order.interface';
import { Clock, CreditCard, CheckCircle, XCircle, Truck, Package, Ban, RotateCcw } from 'lucide-react';
import React from 'react';

export const getStatusColor = (status: OrderStatus): string => {
  switch (status) {
    case OrderStatus.PENDING:
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case OrderStatus.PAYMENT_PROCESSING:
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case OrderStatus.PAID:
      return 'bg-green-100 text-green-800 border-green-200';
    case OrderStatus.PAYMENT_FAILED:
      return 'bg-red-100 text-red-800 border-red-200';
    case OrderStatus.CANCELLED:
      return 'bg-red-100 text-red-800 border-red-200';
    case OrderStatus.REFUNDED:
      return 'bg-purple-100 text-purple-800 border-purple-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getShippingStatusColor = (status: ShippingStatus): string => {
  switch (status) {
    case ShippingStatus.IN_PREPARATION:
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case ShippingStatus.SHIPPED:
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case ShippingStatus.DELIVERED:
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getStatusDescription = (status: OrderStatus): string => {
  switch (status) {
    case OrderStatus.PENDING:
      return 'Your order is pending and waiting for payment confirmation.';
    case OrderStatus.PAYMENT_PROCESSING:
      return 'Your payment is being processed. Please wait while we confirm your payment.';
    case OrderStatus.PAID:
      return 'Your payment has been confirmed! We are preparing your order for shipment.';
    case OrderStatus.PAYMENT_FAILED:
      return 'Payment failed. Please try again with a different payment method.';
    case OrderStatus.CANCELLED:
      return 'Your order has been cancelled.';
    case OrderStatus.REFUNDED:
      return 'Your order has been refunded. The refund will appear in your account within 3-5 business days.';
    default:
      return 'Order status unknown.';
  }
};

export const getShippingStatusDescription = (status: ShippingStatus): string => {
  switch (status) {
    case ShippingStatus.IN_PREPARATION:
      return 'Your order is being prepared for shipment.';
    case ShippingStatus.SHIPPED:
      return 'Your order has been shipped! Track your package using the tracking number.';
    case ShippingStatus.DELIVERED:
      return 'Your order has been delivered! Thank you for your purchase.';
    default:
      return 'Shipping status unknown.';
  }
};

export const canCancelOrder = (order: Order): boolean => {
  // Can't cancel if already cancelled or refunded
  if (order.status === OrderStatus.CANCELLED || order.status === OrderStatus.REFUNDED) {
    return false;
  }

  // Can't cancel if shipped or delivered
  if (order.shippingStatus === ShippingStatus.SHIPPED || order.shippingStatus === ShippingStatus.DELIVERED) {
    return false;
  }

  // Can cancel pending and payment processing orders
  if (order.status === OrderStatus.PENDING || order.status === OrderStatus.PAYMENT_PROCESSING) {
    return true;
  }

  // For paid orders, can cancel until shipped
  if (order.status === OrderStatus.PAID) {
    return true;
  }

  return false;
};



export const hasActiveOrders = (orders: Order[]): boolean => {
  return orders.some(order => 
    order.status === OrderStatus.PENDING || 
    order.status === OrderStatus.PAYMENT_PROCESSING || 
    order.status === OrderStatus.PAID
  );
};

export const getStatusIcon = (status: OrderStatus, size: 'sm' | 'md' | 'lg' = 'md'): React.ReactElement => {
  const iconSize = size === 'sm' ? 16 : size === 'md' ? 20 : 24;
  
  switch (status) {
    case OrderStatus.PENDING:
      return React.createElement(Clock, { size: iconSize });
    case OrderStatus.PAYMENT_PROCESSING:
      return React.createElement(CreditCard, { size: iconSize });
    case OrderStatus.PAID:
      return React.createElement(CheckCircle, { size: iconSize });
    case OrderStatus.PAYMENT_FAILED:
      return React.createElement(XCircle, { size: iconSize });
    case OrderStatus.CANCELLED:
      return React.createElement(Ban, { size: iconSize });
    case OrderStatus.REFUNDED:
      return React.createElement(RotateCcw, { size: iconSize });
    default:
      return React.createElement(Clock, { size: iconSize });
  }
};

export const getShippingStatusIcon = (status: ShippingStatus, size: 'sm' | 'md' | 'lg' = 'md'): React.ReactElement => {
  const iconSize = size === 'sm' ? 16 : size === 'md' ? 20 : 24;
  
  switch (status) {
    case ShippingStatus.IN_PREPARATION:
      return React.createElement(Package, { size: iconSize });
    case ShippingStatus.SHIPPED:
      return React.createElement(Truck, { size: iconSize });
    case ShippingStatus.DELIVERED:
      return React.createElement(CheckCircle, { size: iconSize });
    default:
      return React.createElement(Clock, { size: iconSize });
  }
}; 