'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import Navigation from '../../../components/landing/Navigation';
import Footer from '../../../components/landing/Footer';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { orderService } from '@/services/order.service';
import { CreateOrderRequest } from '@/interfaces/order.interface';
import { getProductPrice } from '@/interfaces/product.interface';
import { toast } from 'react-hot-toast';
import { 
  CreditCard, 
  Lock, 
  Shield, 
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const [scrolled, setScrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [orderData, setOrderData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const orderCreatedRef = useRef(false);
  
  const { items, getSummary, clearCart } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('checkout');
  
  const cartSummary = getSummary();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      router.push(`/${locale}/login?redirect=checkout`);
      return;
    }

    // Check if cart has items
    if (items.length === 0) {
      router.push(`/${locale}/cart`);
      return;
    }

    // Check if we already have an order in sessionStorage
    const savedOrder = sessionStorage.getItem('checkout_order');
    if (savedOrder) {
      try {
        const parsedOrder = JSON.parse(savedOrder);
        setOrderData(parsedOrder);
        setIsLoading(false);
        return;
      } catch (e) {
        // If parsing fails, remove the invalid data
        sessionStorage.removeItem('checkout_order');
      }
    }

    // Prevent multiple order creations
    if (orderCreatedRef.current) {
      return;
    }

    // Create order only once
    orderCreatedRef.current = true;
    createOrder();
  }, [isAuthenticated, items.length]); // Changed from 'items' to 'items.length'

  const createOrder = async () => {
    // Additional guard to prevent multiple calls
    if (orderCreatedRef.current && orderData) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const orderRequest: CreateOrderRequest = {
        items: items.map(item => ({
          productId: item.product.idProduct,
          quantity: item.quantity,
        })),
        notes: 'Order placed from checkout',
      };

      const order = await orderService.createOrder(orderRequest);
      console.log('Order response:', order); // Debug log
      setOrderData(order);
      
      // Save order to sessionStorage to prevent recreation on refresh
      sessionStorage.setItem('checkout_order', JSON.stringify(order));
    } catch (err: any) {
      console.error('Failed to create order:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create order');
      toast.error('Failed to create order. Please try again.');
      // Reset the ref on error so user can retry
      orderCreatedRef.current = false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleProceedToPayment = async () => {
    if (!orderData?.stripePaymentIntentId) {
      toast.error('Payment information not available');
      return;
    }

    setIsRedirecting(true);
    
    try {
      // Redirect to Stripe Checkout
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentIntentId: orderData.stripePaymentIntentId,
          orderId: orderData.idOrder,
          returnUrl: `${window.location.origin}/${locale}/order-success?orderId=${orderData.idOrder}`,
          items: items, // Send items data for line_items
        }),
      });

      console.log('API Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error response:', errorText);
        
        let errorMessage = 'Failed to create checkout session';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.details || errorMessage;
        } catch (e) {
          // If it's not JSON, use the text as is
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('API Response data:', data);
      
      if (data.url) {
        // Clear the session storage before redirecting
        sessionStorage.removeItem('checkout_order');
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Payment redirect failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to proceed to payment. Please try again.';
      toast.error(errorMessage);
      setIsRedirecting(false);
    }
  };

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  if (items.length === 0) {
    return null; // Will redirect to cart
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <Navigation scrolled={scrolled} />
        
        <div className="pt-32 pb-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-20">
              <div className="flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-3" />
                <span className="text-slate-600">{t('creating_order')}</span>
              </div>
            </div>
          </div>
        </div>
        
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <Navigation scrolled={scrolled} />
        
        <div className="pt-32 pb-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-20">
              <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md mx-auto">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('order_error')}</h1>
                <p className="text-gray-600 mb-6">{error}</p>
                <div className="space-y-3">
                  <button
                    onClick={createOrder}
                    className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {t('try_again')}
                  </button>
                  <Link
                    href={`/${locale}/cart`}
                    className="block w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    {t('back_to_cart')}
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

  if (!orderData) {
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
              href={`/${locale}/cart`}
              className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('back_to_cart')}
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('title')}</h1>
            <p className="text-gray-600">{t('subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Payment Section */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('payment_details')}</h3>
                
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <Shield className="w-5 h-5 text-blue-600 mr-2" />
                      <span className="text-blue-800 text-sm font-medium">
                        {t('secure_payment')}
                      </span>
                    </div>
                    <p className="text-blue-700 text-sm mt-1">
                      {t('redirect_to_stripe')}
                    </p>
                  </div>

                  <button
                    onClick={handleProceedToPayment}
                    disabled={isRedirecting}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isRedirecting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        {t('redirecting')}
                      </>
                    ) : (
                      <>
                        <ExternalLink className="w-5 h-5 mr-2" />
                        {t('proceed_to_payment')} ({Number(orderData.totalAmount).toFixed(2)} {orderData.currency})
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-4 flex items-center justify-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Shield className="w-4 h-4 mr-1" />
                    {t('secure_payment')}
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    {t('encrypted')}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('order_summary')}</h2>
                
                {/* Order Items */}
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.product.idProduct} className="flex items-center space-x-3">
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
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {item.product.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {item.quantity} × {getProductPrice(item.product).toFixed(2)} €
                        </p>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {(getProductPrice(item.product) * item.quantity).toFixed(2)} €
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t('subtotal')}</span>
                    <span className="font-medium">{cartSummary.totalPrice.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t('shipping')}</span>
                    <span className="font-medium text-green-600">{t('free')}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>{t('total')}</span>
                      <span>{Number(orderData.totalAmount).toFixed(2)} €</span>
                    </div>
                  </div>
                </div>

                {/* Security Notice */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start">
                    <Shield className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium">{t('security_notice.title')}</p>
                      <p className="mt-1">{t('security_notice.description')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
} 