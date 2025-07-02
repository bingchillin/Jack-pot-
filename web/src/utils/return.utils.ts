import { Order, ShippingStatus, OrderStatus } from '@/interfaces/order.interface';
import { ReturnStatus } from '@/interfaces/return.interface';

export const isReturnEligible = (order: Order): { eligible: boolean; reason?: string } => {
  // Check if order is delivered
  if (order.shippingStatus !== ShippingStatus.DELIVERED || !order.deliveredAt) {
    return { eligible: false, reason: 'Order must be delivered' };
  }

  // Check if order is paid
  if (order.status !== OrderStatus.PAID) {
    return { eligible: false, reason: 'Only paid orders can be returned' };
  }

  // Check 14-day window
  const now = new Date();
  const deliveryDate = new Date(order.deliveredAt);
  const daysDifference = (now.getTime() - deliveryDate.getTime()) / (1000 * 3600 * 24);

  if (daysDifference > 14) {
    return { eligible: false, reason: 'Return period expired (14 days)' };
  }

  return { eligible: true };
};

export const getDaysUntilReturnExpiry = (deliveredAt: string): number => {
  const now = new Date();
  const deliveryDate = new Date(deliveredAt);
  const daysSinceDelivery = (now.getTime() - deliveryDate.getTime()) / (1000 * 3600 * 24);
  return Math.max(0, 14 - Math.floor(daysSinceDelivery));
};

export const getReturnStatusColor = (status: ReturnStatus): string => {
  switch (status) {
    case ReturnStatus.REQUESTED:
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case ReturnStatus.RECEIVED:
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getReturnStatusText = (status: ReturnStatus, locale: string = 'en'): string => {
  const translations = {
    en: {
      [ReturnStatus.REQUESTED]: 'Return Requested',
      [ReturnStatus.RECEIVED]: 'Return Received & Refunded'
    },
    fr: {
      [ReturnStatus.REQUESTED]: 'Retour Demandé',
      [ReturnStatus.RECEIVED]: 'Retour Reçu et Remboursé'
    },
    es: {
      [ReturnStatus.REQUESTED]: 'Devolución Solicitada',
      [ReturnStatus.RECEIVED]: 'Devolución Recibida y Reembolsada'
    }
  };

  return translations[locale as keyof typeof translations]?.[status] || 
         translations.en[status];
}; 