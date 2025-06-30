'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import Navigation from '../../../components/landing/Navigation';
import Footer from '../../../components/landing/Footer';
import { useAuth } from '@/hooks/useAuth';
import { orderService } from '@/services/order.service';
import { Order, OrderStatus } from '@/interfaces/order.interface';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft,
  Loader2,
  Eye,
  Calendar,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Trash2
} from 'lucide-react';
import Link from 'next/link';
import { 
  getStatusIcon, 
  getStatusColor, 
  canCancelOrder, 
  hasActiveOrders 
} from '@/utils/order.utils';
import { formatDate, formatAmountWithoutCurrency } from '@/utils/format.utils';
import { LoadingSpinner, ErrorState, EmptyState } from '@/utils/ui.utils';

export default function OrdersPage() {
  const [scrolled, setScrolled] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [ordersPerPage] = useState(10);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [cancelling, setCancelling] = useState(false);
  
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('orders');
  const { isAuthenticated, user, isLoading } = useAuth({
    requireAuth: true
  });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadOrders();
    }
  }, [isAuthenticated, isLoading, user, locale, router, currentPage]);

  // Auto-refresh active orders every 30 seconds
  useEffect(() => {
    if (!isAuthenticated || !user || orders.length === 0) return;

    if (!hasActiveOrders(orders)) return;

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
      
      // Get orders for the current user with pagination
      const response = await orderService.getMyOrders(currentPage, ordersPerPage);
      setOrders(response.orders || []);
      setTotalOrders(response.total);
      setTotalPages(Math.ceil(response.total / ordersPerPage));
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

  const handleCancelOrder = (order: Order) => {
    setOrderToCancel(order);
    setShowCancelModal(true);
  };

  const confirmCancelOrder = async () => {
    if (!orderToCancel) return;

    try {
      setCancelling(true);
      await orderService.cancelOrder(orderToCancel.idOrder);
      toast.success(t('order_cancelled'));
      setShowCancelModal(false);
      setOrderToCancel(null);
      // Reload orders to get updated status
      loadOrders();
    } catch (err: any) {
      console.error('Failed to cancel order:', err);
      toast.error(err.response?.data?.message || err.message || t('order_cancel_failed'));
    } finally {
      setCancelling(false);
    }
  };

  const getStatusText = (status: OrderStatus) => {
    return t(`status.${status.toLowerCase()}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Show loading while hydrating or loading auth state
  if (!isAuthenticated || isLoading) {
    return <LoadingSpinner message="Loading..." />;
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
              {t('back_to_profile')}
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('title')}</h1>
                <p className="text-gray-600">{t('subtitle')}</p>
              </div>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>{refreshing ? t('refreshing') : t('refresh')}</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-3" />
                <span className="text-slate-600">{t('loading')}</span>
              </div>
            </div>
          ) : error ? (
            <ErrorState
              title={t('error_loading')}
              message={error}
              onRetry={() => loadOrders()}
              retryText={t('try_again')}
            />
          ) : orders.length === 0 ? (
            <EmptyState
              title={t('no_orders')}
              description={t('no_orders_description')}
              actionText={t('start_shopping')}
              actionHref={`/${locale}/products`}
            />
          ) : (
            <>
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
                              {getStatusText(order.status)}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">
                            {t('order_number', { id: order.idOrder })}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-gray-900">
                            {formatAmountWithoutCurrency(order.totalAmount)} €
                          </div>
                          <div className="text-sm text-gray-500 flex items-center justify-end">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDate(order.createdAt, locale)}
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
                                Qty: {item.quantity} × {formatAmountWithoutCurrency(item.unitPrice)} €
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900">
                                {formatAmountWithoutCurrency(item.totalPrice)} €
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Order Actions */}
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-500">
                            {order.orderItems?.length === 1 
                              ? t('items_count', { count: order.orderItems.length })
                              : t('items_count_plural', { count: order.orderItems.length })
                            }
                          </div>
                          <div className="flex items-center space-x-3">
                            {canCancelOrder(order) && (
                              <button
                                onClick={() => handleCancelOrder(order)}
                                className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center"
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                {t('cancel_order')}
                              </button>
                            )}
                            <Link
                              href={`/${locale}/order/${order.idOrder}`}
                              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              {t('view_details')}
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    {t('pagination.showing', { 
                      from: (currentPage - 1) * ordersPerPage + 1, 
                      to: Math.min(currentPage * ordersPerPage, totalOrders), 
                      total: totalOrders 
                    })}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-gray-700">
                      {t('pagination.page', { current: currentPage, total: totalPages })}
                    </span>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Cancel Order Modal */}
      {showCancelModal && orderToCancel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{t('cancel_order_confirm')}</h3>
            </div>
            <p className="text-gray-600 mb-6">{t('cancel_order_description')}</p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                onClick={confirmCancelOrder}
                disabled={cancelling}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {cancelling ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    {t('cancelling')}
                  </div>
                ) : (
                  t('confirm_cancel')
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
} 