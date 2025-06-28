import { Order, OrderStatus } from '@/interfaces/order.interface';
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
    case OrderStatus.SHIPPED:
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case OrderStatus.DELIVERED:
      return 'bg-green-100 text-green-800 border-green-200';
    case OrderStatus.CANCELLED:
      return 'bg-red-100 text-red-800 border-red-200';
    case OrderStatus.REFUNDED:
      return 'bg-purple-100 text-purple-800 border-purple-200';
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
    case OrderStatus.SHIPPED:
      return 'Your order has been shipped! Track your package using the tracking number.';
    case OrderStatus.DELIVERED:
      return 'Your order has been delivered! Thank you for your purchase.';
    case OrderStatus.CANCELLED:
      return 'Your order has been cancelled.';
    case OrderStatus.REFUNDED:
      return 'Your order has been refunded. The refund will appear in your account within 3-5 business days.';
    default:
      return 'Order status unknown.';
  }
};

export const canCancelOrder = (order: Order): boolean => {
  console.log('=== canCancelOrder DEBUG START ===');
  console.log('Order details:', {
    orderId: order.idOrder,
    status: order.status,
    paidAt: order.paidAt,
    createdAt: order.createdAt
  });

  // Can't cancel if already cancelled or refunded
  if (order.status === OrderStatus.CANCELLED || order.status === OrderStatus.REFUNDED) {
    console.log('❌ Cannot cancel: already cancelled or refunded');
    return false;
  }

  // Can't cancel if shipped or delivered
  if (order.status === OrderStatus.SHIPPED || order.status === OrderStatus.DELIVERED) {
    console.log('❌ Cannot cancel: shipped or delivered');
    return false;
  }

  // Can cancel pending and payment processing orders
  if (order.status === OrderStatus.PENDING || order.status === OrderStatus.PAYMENT_PROCESSING) {
    console.log(`✅ Can cancel: ${order.status} order`);
    return true;
  }

  // For paid orders, check if within 48 hours
  if (order.status === OrderStatus.PAID) {
    console.log('🔍 Processing PAID order...');
    
    try {
      const paidAtTime = new Date(order.paidAt || order.createdAt).getTime();
      const currentTime = Date.now();
      const hoursSincePayment = (currentTime - paidAtTime) / (1000 * 60 * 60);
      
      console.log('⏰ Time calculation details:', {
        paidAtString: order.paidAt,
        paidAtTime,
        currentTime,
        hoursSincePayment,
        hoursSincePaymentFormatted: `${hoursSincePayment.toFixed(2)} hours`,
        canCancel: hoursSincePayment <= 48,
        timeLimit: 48
      });
      
      const result = hoursSincePayment <= 48;
      console.log(`🎯 Final result for PAID order: ${result ? '✅ CANCEL' : '❌ NO CANCEL'}`);
      return result;
    } catch (error) {
      console.error('❌ Error in time calculation:', error);
      return false;
    }
  }

  console.log(`❌ Cannot cancel: unknown status ${order.status}`);
  return false;
};

export const getCancellationTimeLeft = (order: Order): { hours: number; minutes: number } | null => {
  if (order.status !== OrderStatus.PAID) {
    return null;
  }

  const hoursSincePayment = (Date.now() - new Date(order.paidAt || order.createdAt).getTime()) / (1000 * 60 * 60);
  const timeLeft = 48 - hoursSincePayment;

  if (timeLeft <= 0) {
    return null;
  }

  const hours = Math.floor(timeLeft);
  const minutes = Math.floor((timeLeft - hours) * 60);

  return { hours, minutes };
};

export const hasActiveOrders = (orders: Order[]): boolean => {
  return orders.some(order => 
    order.status === OrderStatus.PENDING || 
    order.status === OrderStatus.PAYMENT_PROCESSING || 
    order.status === OrderStatus.PAID ||
    order.status === OrderStatus.SHIPPED
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
    case OrderStatus.SHIPPED:
      return React.createElement(Truck, { size: iconSize });
    case OrderStatus.DELIVERED:
      return React.createElement(Package, { size: iconSize });
    case OrderStatus.CANCELLED:
      return React.createElement(Ban, { size: iconSize });
    case OrderStatus.REFUNDED:
      return React.createElement(RotateCcw, { size: iconSize });
    default:
      return React.createElement(Clock, { size: iconSize });
  }
}; 