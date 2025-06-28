'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import Navigation from '../../../components/landing/Navigation';
import Footer from '../../../components/landing/Footer';
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
  Eye,
  Calendar,
  Euro,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';

export default function OrdersPage() {
  const [scrolled, setScrolled] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
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
      router.push(`/${locale}/login?redirect=orders`);
      return;
    }

    if (isAuthenticated && user) {
      loadOrders();
    }
  }, [isAuthenticated, isLoading, isHydrated, user, locale, router]);

  // Auto-refresh active orders every 30 seconds
  useEffect(() => {
    if (!isAuthenticated || !user || orders.length === 0) return;

    // Check if there are any active orders (processing, pending, etc.)
    const hasActiveOrders = orders.some(order => 
      order.status === OrderStatus.PROCESSING || 
      order.status === OrderStatus.PENDING ||
      order.status === OrderStatus.CONFIRMED
    );

    if (!hasActiveOrders) return;

    const interval = setInterval(() => {
      console.log('Auto-refreshing orders for active orders...');
      loadOrders(true);
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [orders, isAuthenticated, user]);

  const loadOrders = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      // Get orders for the current user
      const orders = await orderService.getMyOrders();
      setOrders(orders || []);
    } catch (err: any) {
      console.error('Failed to load orders:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load orders');
      toast.error('Failed to load your orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadOrders(true);
  };

  const cancelOrder = async (orderId: number) => {
    try {
      await orderService.cancelOrder(orderId);
      toast.success('Order cancelled successfully');
      // Reload orders to get updated status
      loadOrders();
    } catch (err: any) {
      console.error('Failed to cancel order:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to cancel order');
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.DELIVERED:
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case OrderStatus.SHIPPED:
        return <Package className="w-5 h-5 text-blue-600" />;
      case OrderStatus.PROCESSING:
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case OrderStatus.CANCELLED:
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              href={`/${locale}/profile`}
              className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Profile
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
                <p className="text-gray-600">Track your order history and status</p>
              </div>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-3" />
                <span className="text-slate-600">Loading your orders...</span>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md mx-auto">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Orders</h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <button
                  onClick={() => loadOrders()}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-md mx-auto">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">No Orders Yet</h2>
                <p className="text-gray-600 mb-6">You haven't placed any orders yet. Start shopping to see your order history here.</p>
                <Link
                  href={`/${locale}/products`}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Start Shopping
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.idOrder} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  {/* Order Header */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(order.status)}
                          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          Order #{order.idOrder}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900">
                          {formatAmount(order.totalAmount)} €
                        </div>
                        <div className="text-sm text-gray-500 flex items-center justify-end">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(order.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-6">
                    <div className="space-y-4">
                      {order.orderItems?.map((item) => (
                        <div key={item.idOrderItem} className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            {item.product.imageUrl ? (
                              <img 
                                src={item.product.imageUrl} 
                                alt={item.product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <div className="text-lg">🌱</div>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {item.product.name}
                            </h4>
                            <p className="text-sm text-gray-500">
                              Qty: {item.quantity} × {formatAmount(item.unitPrice)} €
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              {formatAmount(item.totalPrice)} €
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Actions */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                          {order.orderItems?.length || 0} item{(order.orderItems?.length || 0) !== 1 ? 's' : ''}
                        </div>
                        <div className="flex items-center space-x-3">
                          {order.status === OrderStatus.PROCESSING && (
                            <button
                              onClick={() => cancelOrder(order.idOrder)}
                              className="text-sm text-red-600 hover:text-red-700 font-medium"
                            >
                              Cancel Order
                            </button>
                          )}
                          <Link
                            href={`/${locale}/order/${order.idOrder}`}
                            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
} 