'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Navigation from '../../../components/landing/Navigation';
import Footer from '../../../components/landing/Footer';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { getProductPrice } from '@/interfaces/product.interface';
import { toast } from 'react-hot-toast';
import { 
  ShoppingCart, 
  Trash2, 
  Minus, 
  Plus, 
  ArrowLeft,
  CreditCard,
  Loader2,
  Shield,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useCartHydration } from '@/hooks/useCartHydration';
import { useAuth } from '@/hooks/useAuth';

export default function CartPage() {
  const [scrolled, setScrolled] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { items, removeItem, updateQuantity, clearCart, getSummary } = useCartStore();
  const { refreshUser } = useAuthStore();
  const cartSummary = getSummary();
  const t = useTranslations('shop.cart');
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = params.locale as string;
  const { isHydrated, isLoading } = useCartHydration();

  // Use auth hook for authentication and verification (only when needed)
  const { isAuthenticated, user, isLoading: authLoading } = useAuth({
    // No requireAuth - cart should be accessible without login
    // No requireVerification - only check when proceeding to payment
  });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check for success message from profile update
  useEffect(() => {
    const success = searchParams.get('success');
    if (success) {
      // Clean up the URL without showing toast to prevent double toasts
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('success');
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, [searchParams]);

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(productId);
      toast.success(t('item_removed'));
      
      // If cart becomes empty, clear it
      const remainingItems = items.filter(item => item.product.idProduct !== productId);
      if (remainingItems.length === 0) {
        handleClearCart();
      }
    } else {
      // Find the product to check stock
      const item = items.find(item => item.product.idProduct === productId);
      if (item && newQuantity > item.product.stockQuantity) {
        toast.error(`Only ${item.product.stockQuantity} items available in stock`);
        return;
      }
      updateQuantity(productId, newQuantity);
    }
  };

  const handleRemoveItem = (productId: number) => {
    removeItem(productId);
    toast.success(t('item_removed'));
    
    // If cart becomes empty, clear it
    const remainingItems = items.filter(item => item.product.idProduct !== productId);
    if (remainingItems.length === 0) {
      handleClearCart();
    }
  };

  const handleClearCart = async () => {
    clearCart();
    toast.success(t('cart_cleared'));
  };

  const handleProceedToPayment = async () => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    // Check authentication first - refresh user data to ensure it's current
    if (!isAuthenticated) {
      router.push(`/${locale}/login?redirect=cart`);
      return;
    }

    // Refresh user data to ensure we have the latest info (in case localStorage was cleared)
    try {
      await refreshUser();
    } catch (error) {
      // If refresh fails, user is no longer authenticated
      console.log('User refresh failed, redirecting to login');
      router.push(`/${locale}/login?redirect=cart`);
      return;
    }

    // Get fresh user data after refresh
    const freshUser = useAuthStore.getState().user;
    
    if (!freshUser) {
      router.push(`/${locale}/login?redirect=cart`);
      return;
    }

    // Check email verification
    if (!freshUser.isEmailVerified) {
      toast.error(t('email_verification_required'));
      router.push(`/${locale}/profile?verification_required=true`);
      return;
    }

    // Validate stock before proceeding
    for (const item of items) {
      if (item.quantity > item.product.stockQuantity) {
        toast.error(`${item.product.name}: Only ${item.product.stockQuantity} items available in stock`);
        return;
      }
    }

    // Check if user has an address
    if (!freshUser.address || freshUser.address.trim() === '') {
      toast.error(t('address_required'));
      const params = new URLSearchParams({ redirect: 'cart' });
      router.push(`/${locale}/profile/edit?${params.toString()}`);
      return;
    }

    setIsProcessing(true);

    try {
      if (!freshUser.idPerson) {
        throw new Error('User information not found. Please log in again.');
      }

      // Create Stripe checkout session directly (order will be created by webhook)
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personId: freshUser.idPerson,
          returnUrl: `${window.location.origin}/${locale}/order-success?session_id={CHECKOUT_SESSION_ID}`,
          items: items,
          locale: locale,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Checkout session error:', errorText);
        
        let errorMessage = 'Failed to create checkout session';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.details || errorMessage;
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Checkout session created:', data);

      if (data.url) {
        // Don't clear cart here - only redirect to Stripe
        // Cart will be cleared on successful payment in the order success page
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Payment processing failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process payment. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  // Show loading state while cart is hydrating
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <Navigation scrolled={scrolled} />
        
        <div className="pt-32 pb-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header - same structure as loaded state */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('title')}</h1>
            </div>

            {/* Loading content - same grid structure */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-3" />
                  </div>
                </div>
              </div>
              
              {/* Order Summary placeholder */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
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

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <Navigation scrolled={scrolled} />
        
        <div className="pt-32 pb-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-20">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-md mx-auto">
                <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('empty_title')}</h1>
                <p className="text-gray-600 mb-6">{t('empty_message')}</p>
                <Link
                  href={`/${locale}/products`}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t('continue_shopping')}
                </Link>
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('title')}</h1>
            <p className="text-gray-600">{items.length} item{items.length !== 1 ? 's' : ''} {t('in_your_cart')}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">{t('cart_items')}</h2>
                    <button
                      onClick={handleClearCart}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      {t('clear_cart')}
                    </button>
                  </div>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {items.map((item) => (
                    <div key={item.product.idProduct} className="p-6">
                      <div className="flex items-center space-x-4">
                        {/* Product Image */}
                        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
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
                        
                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {item.product.name}
                          </h3>
                          <p className="text-gray-500 text-sm">
                            {getProductPrice(item.product).toFixed(2)} € {t('each')}
                          </p>
                          <p className="text-gray-500 text-sm">
                            {t('stock_available', { quantity: item.product.stockQuantity })}
                          </p>
                        </div>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleQuantityChange(item.product.idProduct, item.quantity - 1)}
                            className="p-1 rounded hover:bg-gray-100"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-12 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item.product.idProduct, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stockQuantity}
                            className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        
                        {/* Price */}
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900">
                            {(getProductPrice(item.product) * item.quantity).toFixed(2)} €
                          </p>
                        </div>
                        
                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemoveItem(item.product.idProduct)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('order_summary')}</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t('subtotal', { items: cartSummary.totalItems })}</span>
                    <span className="font-medium">{cartSummary.totalPrice.toFixed(2)} €</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>{t('total')}</span>
                      <span>{cartSummary.totalPrice.toFixed(2)} €</span>
                    </div>
                  </div>
                </div>

                {/* Security Message */}
                <div className="p-4 bg-blue-50 rounded-lg mb-4">
                  <div className="flex items-center">
                    <Shield className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-blue-800 text-sm font-medium">
                      Secure Payment
                    </span>
                  </div>
                  <p className="text-blue-700 text-sm mt-1">
                    You'll be redirected to Stripe for secure payment processing
                  </p>
                </div>
                
                <button
                  onClick={handleProceedToPayment}
                  disabled={isProcessing || items.length === 0}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      <span>Proceed to Payment</span>
                    </>
                  )}
                </button>
                
                <div className="mt-4 flex items-center justify-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Shield className="w-4 h-4 mr-1" />
                    Secure Payment
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Encrypted
                  </div>
                </div>
                
                <div className="mt-4 text-center">
                  <Link
                    href={`/${locale}/products`}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    {t('continue_shopping')}
                  </Link>
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