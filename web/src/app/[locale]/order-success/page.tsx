'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Navigation from '../../../components/landing/Navigation';
import Footer from '../../../components/landing/Footer';
import { orderService } from '@/services/order.service';
import { useCartStore } from '@/stores/cartStore';
import { toast } from 'react-hot-toast';
import { 
  CheckCircle, 
  Package, 
  Mail, 
  Home,
  ShoppingBag,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

export default function OrderSuccessPage() {
  const [scrolled, setScrolled] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = params.locale as string;
  const t = useTranslations('order_success');
  const { clearCart } = useCartStore();
  
  const orderId = searchParams.get('orderId');
  const paymentIntentId = searchParams.get('paymentIntentId');
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (orderId || paymentIntentId || sessionId) {
      // Clear cart and sessionStorage on successful payment
      clearCart();
      sessionStorage.removeItem('checkout_order');
      sessionStorage.removeItem('cart_order');
      
      loadOrder();
    } else {
      setLoading(false);
    }
  }, [orderId, paymentIntentId, sessionId, clearCart]);

  const loadOrder = async () => {
    if (!sessionId) return;

    try {
      setLoading(true);
      setError(null);

      // Try to get or create the order
      const order = await orderService.getOrderBySessionWithRetry(sessionId);
      setOrder(order);
    } catch (error) {
      console.error('Failed to load order:', error);
      setError('Failed to load order details. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to safely format amount
  const formatAmount = (amount: any) => {
    if (amount === null || amount === undefined) return '0.00';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return isNaN(numAmount) ? '0.00' : numAmount.toFixed(2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <Navigation scrolled={scrolled} />
        
        <div className="pt-32 pb-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-20">
              <div className="flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-3" />
                <span className="text-slate-600">Loading order details...</span>
              </div>
            </div>
          </div>
        </div>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <Navigation scrolled={scrolled} />
      
      <div className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Success Icon */}
            <div className="mb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('title')}</h1>
              <p className="text-gray-600 text-lg">{t('subtitle')}</p>
            </div>

            {/* Order Details */}
            {error ? (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-8 mb-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-red-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-red-900 mb-2">Payment Successful</h2>
                  <p className="text-red-700 mb-4">{error}</p>
                  <p className="text-red-600 text-sm">
                    Your payment was successful, but we&#39;re having trouble loading your order details. 
                    Please contact support with your session ID: {sessionId}
                  </p>
                </div>
              </div>
            ) : order ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('order_details')}</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">{t('order_info')}</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p><span className="font-medium">{t('order_number')}:</span> #{order.idOrder}</p>
                      <p><span className="font-medium">{t('order_date')}:</span> {new Date(order.createdAt).toLocaleDateString()}</p>
                      <p><span className="font-medium">{t('total_amount')}:</span> {formatAmount(order.totalAmount)} €</p>
                      <p><span className="font-medium">{t('status')}:</span> <span className="text-green-600 font-medium">{t('paid')}</span></p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">{t('next_steps')}</h3>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="w-4 h-4 mr-2 text-blue-600" />
                        <span>{t('email_confirmation')}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Package className="w-4 h-4 mr-2 text-blue-600" />
                        <span>{t('shipping_preparation')}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                        <span>{t('order_processing')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/${locale}`}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Home className="w-4 h-4 mr-2" />
                {t('back_to_home')}
              </Link>
              
              <Link
                href={`/${locale}/products`}
                className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                {t('continue_shopping')}
              </Link>
            </div>

            {/* Additional Info */}
            <div className="mt-12 max-w-2xl mx-auto">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-medium text-blue-900 mb-2">{t('support.title')}</h3>
                <p className="text-blue-800 text-sm mb-4">{t('support.description')}</p>
                <Link
                  href={`/${locale}/contact`}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  {t('support.contact_us')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
} 