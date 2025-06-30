'use client';

import React from 'react';
import { Card, Steps, Tag, Typography, Button, Space } from 'antd';
import { CheckCircle, Package, Truck, CreditCard, ExternalLink } from 'lucide-react';
import { Order, OrderStatus, ShippingStatus } from '@/interfaces/order.interface';
import { useTranslations, useLocale } from 'next-intl';

const { Title, Text } = Typography;

interface OrderProgressProps {
  order: Order;
}

export const OrderProgress: React.FC<OrderProgressProps> = ({ order }) => {
  const t = useTranslations('order_details.order_progress');
  const tShipping = useTranslations('orders.shipping_status');
  const locale = useLocale();
  const getCurrentStep = () => {
    if (order.status !== OrderStatus.PAID) {
      return 0; // Payment step
    }
    
    switch (order.shippingStatus) {
      case ShippingStatus.IN_PREPARATION:
        return 1;
      case ShippingStatus.SHIPPED:
        return 2;
      case ShippingStatus.DELIVERED:
        return 3;
      default:
        return 1; // Default to in preparation if shipping status is undefined
    }
  };

  const getStepStatus = (stepIndex: number) => {
    const currentStep = getCurrentStep();
    if (stepIndex < currentStep) return 'finish';
    if (stepIndex === currentStep) return 'process';
    return 'wait';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusMessage = () => {
    if (order.status === OrderStatus.CANCELLED) {
      return t('status_messages.cancelled');
    }
    if (order.status === OrderStatus.REFUNDED) {
      return t('status_messages.refunded');
    }
    if (order.status !== OrderStatus.PAID) {
      return t('status_messages.payment_pending');
    }
    
    switch (order.shippingStatus) {
      case ShippingStatus.IN_PREPARATION:
        return t('status_messages.preparing');
      case ShippingStatus.SHIPPED:
        return t('status_messages.shipped');
      case ShippingStatus.DELIVERED:
        return t('status_messages.delivered');
      default:
        return t('status_messages.confirmed');
    }
  };

  const getStatusColor = () => {
    if (order.status === OrderStatus.CANCELLED) return 'red';
    if (order.status === OrderStatus.REFUNDED) return 'purple';
    if (order.status !== OrderStatus.PAID) return 'gold';
    
    switch (order.shippingStatus) {
      case ShippingStatus.DELIVERED:
        return 'green';
      case ShippingStatus.SHIPPED:
        return 'blue';
      default:
        return 'orange';
    }
  };

  const steps = [
    {
      title: t('payment_confirmed'),
      description: order.paidAt ? formatDate(order.paidAt) : t('pending_payment'),
      icon: <CreditCard size={20} />,
    },
    {
      title: t('in_preparation'),
      description: t('order_being_prepared'),
      icon: <Package size={20} />,
    },
    {
      title: t('shipped'),
      description: order.shippedAt ? formatDate(order.shippedAt) : t('not_yet_shipped'),
      icon: <Truck size={20} />,
    },
    {
      title: t('delivered'),
      description: order.deliveredAt ? formatDate(order.deliveredAt) : t('estimated_delivery'),
      icon: <CheckCircle size={20} />,
    },
  ];

  // Don't show progress for cancelled/refunded orders
  if (order.status === OrderStatus.CANCELLED || order.status === OrderStatus.REFUNDED) {
    return (
      <Card>
        <div className="text-center py-8">
          <Tag color={getStatusColor()} className="text-lg px-4 py-2 mb-4">
            {order.status === OrderStatus.CANCELLED ? 'CANCELLED' : 'REFUNDED'}
          </Tag>
          <div>
            <Text>{getStatusMessage()}</Text>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status Overview */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <Title level={4} className="mb-0">Order #{order.idOrder}</Title>
          <Tag color={getStatusColor()} className="text-sm px-3 py-1">
            {order.shippingStatus ? tShipping(order.shippingStatus).toUpperCase() : tShipping('in_preparation').toUpperCase()}
          </Tag>
        </div>
        
        <Text className="text-gray-600 block mb-4">{getStatusMessage()}</Text>
        
        {/* Tracking Info */}
        {order.trackingNumber && (
          <Card size="small" className="bg-blue-50">
                         <Space direction="vertical" className="w-full">
               <div className="flex justify-between items-center">
                 <Text strong>{t('tracking.tracking_number')}:</Text>
                 <Text copyable>{order.trackingNumber}</Text>
               </div>
               {order.carrier && (
                 <div className="flex justify-between items-center">
                   <Text strong>{t('tracking.carrier')}:</Text>
                   <Text>{order.carrier}</Text>
                 </div>
               )}
               {order.trackingUrl && (
                 <Button 
                   type="link" 
                   icon={<ExternalLink size={16} />}
                   onClick={() => window.open(order.trackingUrl, '_blank')}
                   className="p-0 h-auto"
                 >
                   {t('tracking.track_package')}
                 </Button>
               )}
               {order.estimatedDeliveryDate && (
                 <div className="flex justify-between items-center">
                   <Text strong>{t('tracking.estimated_delivery')}:</Text>
                   <Text>{formatDate(order.estimatedDeliveryDate)}</Text>
                 </div>
               )}
             </Space>
          </Card>
        )}
      </Card>

             {/* Progress Steps */}
       <Card>
         <Title level={5} className="mb-4">{t('title')}</Title>
        <Steps
          current={getCurrentStep()}
          items={steps.map((step, index) => ({
            title: step.title,
            description: step.description,
            icon: step.icon,
            status: getStepStatus(index),
          }))}
        />
      </Card>
    </div>
  );
}; 