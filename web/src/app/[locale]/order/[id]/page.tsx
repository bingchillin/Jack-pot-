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
  MapPin,
  Phone,
  Mail,
  Loader2,
  ArrowLeft,
  Download,
  X
} from 'lucide-react';
import Link from 'next/link';
import { 
  getStatusIcon, 
  getStatusColor, 
  getStatusDescription 
} from '@/utils/order.utils';
import { formatDate, formatAmountWithoutCurrency } from '@/utils/format.utils';
import { LoadingSpinner, ErrorState, EmptyState } from '@/utils/ui.utils';
import { generateOrderReceipt } from '@/utils/pdf.utils';

export default function OrderDetailsPage() {
  const [scrolled, setScrolled] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const orderId = parseInt(params.id as string);
  const t = useTranslations('order_details');
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
      setError(err.response?.data?.message || err.message || t('error_loading'));
      toast.error(t('error_loading'));
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async () => {
    if (!order) return;
    
    try {
      setCancelling(true);
      await orderService.cancelOrder(order.idOrder);
      toast.success(t('order_cancelled'));
      setShowCancelModal(false);
      // Reload order to get updated status
      loadOrder();
    } catch (err: any) {
      console.error('Failed to cancel order:', err);
      toast.error(err.response?.data?.message || err.message || t('order_cancel_failed'));
    } finally {
      setCancelling(false);
    }
  };

  const exportReceipt = async () => {
    if (!order) return;
    
    try {
      setExporting(true);
      generateOrderReceipt(order, locale, user);
      toast.success(t('receipt_exported'));
    } catch (err: any) {
      console.error('Failed to export receipt:', err);
      toast.error(t('receipt_export_failed'));
    } finally {
      setExporting(false);
    }
  };

  // Show loading while hydrating or loading auth state
  if (!isHydrated || isLoading) {
    return <LoadingSpinner message={t('loading')} />;
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
            <div className="flex items-center space-x-4 mb-4">
              <Link
                href={`/${locale}/orders`}
                className="inline-flex items-center text-blue-600 hover:text-blue-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('back_to_orders')}
              </Link>
              <span className="text-gray-400">|</span>
              <Link
                href={`/${locale}/profile`}
                className="inline-flex items-center text-blue-600 hover:text-blue-700"
              >
                {t('back_to_profile')}
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('title')}</h1>
            <p className="text-gray-600">{t('order_number', { id: orderId })}</p>
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
              onRetry={loadOrder}
              retryText={t('try_again')}
            />
          ) : !order ? (
            <EmptyState
              title={t('not_found')}
              description={t('not_found_description')}
              actionText={t('back_to_orders')}
              actionHref={`/${locale}/orders`}
            />
          ) : (
            <div className="space-y-6">
              {/* Order Status */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">{t('order_status')}</h2>
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(order.status, 'lg')}
                    <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                      {t(`status_names.${order.status}`)}
                    </span>
                  </div>
                </div>
                <p className="text-gray-600">{t(`status_descriptions.${order.status}`)}</p>
                
                <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                  {order.status === OrderStatus.PAYMENT_PROCESSING && (
                    <button
                      onClick={() => setShowCancelModal(true)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {t('cancel_order')}
                    </button>
                  )}
                  
                  <button
                    onClick={exportReceipt}
                    disabled={exporting}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                  >
                    {exporting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        {t('exporting')}
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        {t('export_receipt')}
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Order Information */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Order Details */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('order_information')}</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('order_id')}:</span>
                      <span className="font-medium">#{order.idOrder}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('order_date')}:</span>
                      <span className="font-medium">{formatDate(order.createdAt, locale)}</span>
                    </div>
                    {order.updatedAt && order.updatedAt !== order.createdAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t('last_updated')}:</span>
                        <span className="font-medium">{formatDate(order.updatedAt, locale)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Shipping Information */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('shipping_information')}</h3>
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
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('order_items')}</h3>
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
                        <p className="text-gray-600">{t('quantity')}: {item.quantity}</p>
                        <p className="text-gray-600">{t('unit_price')}: {formatAmountWithoutCurrency(item.unitPrice)} €</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          {formatAmountWithoutCurrency(item.totalPrice)} €
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">{t('total')}</span>
                    <span className="text-2xl font-bold text-gray-900">
                      {formatAmountWithoutCurrency(order.totalAmount)} €
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{t('cancel_order')}</h3>
              <button
                onClick={() => setShowCancelModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">{t('cancel_order_description')}</p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                onClick={cancelOrder}
                disabled={cancelling}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {cancelling ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2 inline" />
                    {t('cancelling')}
                  </>
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