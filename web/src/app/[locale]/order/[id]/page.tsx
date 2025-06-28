'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import Navigation from '../../../../components/landing/Navigation';
import Footer from '../../../../components/landing/Footer';
import { useAuthStore } from '@/stores/authStore';
import { orderService } from '@/services/order.service';
import { Order, OrderStatus } from '@/interfaces/order.interface';
import { toast } from 'react-hot-toast';
import { 
  Package, 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertCircle,
  ArrowLeft,
  Loader2,
  MapPin,
  Phone,
  Mail,
  Truck,
  CreditCard
} from 'lucide-react';
import Link from 'next/link';

export default function OrderDetailsPage() {
  const [scrolled, setScrolled] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const orderId = parseInt(params.id as string);
  const t = useTranslations('orders');
  const { isAuthenticated, user, isLoading, isHydrated } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isHydrated && !isLoading && !isAuthenticated) {
      router.push(`/${locale}/login?redirect=order/${orderId}`);
      return;
    }

    if (isAuthenticated && user && orderId) {
      loadOrder();
    }
  }, [isAuthenticated, isLoading, isHydrated, user, orderId, locale, router]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const orderData = await orderService.getOrder(orderId);
      setOrder(orderData);
    } catch (err: any) {
      console.error('Failed to load order:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load order');
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async () => {
    if (!order) return;
    
    try {
      setCancelling(true);
      await orderService.cancelOrder(order.idOrder);
      toast.success('Order cancelled successfully');
      // Reload order to get updated status
      loadOrder();
    } catch (err: any) {
      console.error('Failed to cancel order:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.DELIVERED:
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case OrderStatus.SHIPPED:
        return <Truck className="w-6 h-6 text-blue-600" />;
      case OrderStatus.PROCESSING:
        return <Clock className="w-6 h-6 text-yellow-600" />;
      case OrderStatus.CANCELLED:
        return <XCircle className="w-6 h-6 text-red-600" />;
      default:
        return <AlertCircle className="w-6 h-6 text-gray-600" />;
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.DELIVERED:
        return 'bg-green-100 text-green-800 border-green-200';
      case OrderStatus.SHIPPED:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case OrderStatus.PROCESSING:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case OrderStatus.CANCELLED:
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusDescription = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.DELIVERED:
        return 'Your order has been delivered successfully!';
      case OrderStatus.SHIPPED:
        return 'Your order is on its way to you.';
      case OrderStatus.PROCESSING:
        return 'We are preparing your order for shipment.';
      case OrderStatus.CANCELLED:
        return 'This order has been cancelled.';
      default:
        return 'Order status unknown.';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount: any) => {
    if (amount === null || amount === undefined) return '0.00';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return isNaN(numAmount) ? '0.00' : numAmount.toFixed(2);
  };

  // Show loading while hydrating or loading auth state
  if (!isHydrated || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-green-600/30 border-t-green-600 rounded-full animate-spin mr-3"></div>
          <span className="text-slate-600">Loading...</span>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <Navigation scrolled={scrolled} />
      
      <div className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              href={`/${locale}/orders`}
              className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Orders
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Details</h1>
            <p className="text-gray-600">Order #{orderId}</p>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-3" />
                <span className="text-slate-600">Loading order details...</span>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md mx-auto">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Order</h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <button
                  onClick={loadOrder}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : !order ? (
            <div className="text-center py-20">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-md mx-auto">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">Order Not Found</h2>
                <p className="text-gray-600 mb-6">The order you're looking for doesn't exist or you don't have permission to view it.</p>
                <Link
                  href={`/${locale}/orders`}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Back to Orders
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Order Status */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Order Status</h2>
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(order.status)}
                    <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>
                <p className="text-gray-600">{getStatusDescription(order.status)}</p>
                
                {order.status === OrderStatus.PROCESSING && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={cancelOrder}
                      disabled={cancelling}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {cancelling ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2 inline" />
                          Cancelling...
                        </>
                      ) : (
                        'Cancel Order'
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Order Information */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Order Details */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order ID:</span>
                      <span className="font-medium">#{order.idOrder}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order Date:</span>
                      <span className="font-medium">{formatDate(order.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Method:</span>
                      <span className="font-medium flex items-center">
                        <CreditCard className="w-4 h-4 mr-1" />
                        Stripe
                      </span>
                    </div>
                    {order.updatedAt && order.updatedAt !== order.createdAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Updated:</span>
                        <span className="font-medium">{formatDate(order.updatedAt)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Shipping Information */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                      <div>
                        <p className="font-medium">{user.firstname} {user.surname}</p>
                        <p className="text-gray-600 text-sm">Shipping address would be here</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">{user.email}</span>
                    </div>
                    {user.numberPhone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">{user.numberPhone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
                <div className="space-y-4">
                  {order.orderItems?.map((item) => (
                    <div key={item.idOrderItem} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                        {item.product.imageUrl ? (
                          <img 
                            src={item.product.imageUrl} 
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="text-2xl">🌱</div>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-medium text-gray-900">{item.product.name}</h4>
                        <p className="text-gray-600">Quantity: {item.quantity}</p>
                        <p className="text-gray-600">Unit Price: {formatAmount(item.unitPrice)} €</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          {formatAmount(item.totalPrice)} €
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-gray-900">
                      {formatAmount(order.totalAmount)} €
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
} 