"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Navigation from '../../../../components/landing/Navigation';
import Footer from '../../../../components/landing/Footer';
import { Product, getProductPrice } from '@/interfaces/product.interface';
import { productService } from '@/services/product.service';
import { useCartStore } from '@/stores/cartStore';
import { toast } from 'react-hot-toast';
import { 
  ShoppingCart, 
  Shield, 
  CheckCircle,
  AlertCircle,
  Plus,
  Minus
} from 'lucide-react';
import Link from 'next/link';

export default function ProductDetailPage() {
  const [scrolled, setScrolled] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  
  const params = useParams();
  const t = useTranslations('shop.product_detail');
  const { addItem, getItemQuantity, hasItem } = useCartStore();

  const productId = Number(params.id);
  const currentQuantity = product ? getItemQuantity(product.idProduct) : 0;
  const isInCart = product ? hasItem(product.idProduct) : false;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const productData = await productService.getProductById(productId);
        setProduct(productData);
      } catch (err) {
        setError(t('not_found_message'));
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleAddToCart = () => {
    if (product) {
      const currentCartQuantity = getItemQuantity(product.idProduct);
      const availableStock = product.stockQuantity - currentCartQuantity;
      
      if (availableStock <= 0) {
        toast.error(t('stock_validation.max_quantity', { quantity: product.stockQuantity }));
        return;
      }
      
      if (quantity > availableStock) {
        toast.error(t('stock_validation.only_available', { quantity: availableStock }));
        return;
      }
      
      addItem(product, quantity);
      toast.success(t('stock_validation.added_to_cart', { name: product.name }));
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (product && newQuantity >= 1 && newQuantity <= product.stockQuantity) {
      setQuantity(newQuantity);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <Navigation scrolled={scrolled} />
        <div className="pt-32 pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-green-600/30 border-t-green-600 rounded-full animate-spin mr-3"></div>
                <span className="text-slate-600">{t('loading')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <Navigation scrolled={scrolled} />
        <div className="pt-32 pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-20">
              <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md mx-auto">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-red-800 mb-2">{t('not_found')}</h2>
                <p className="text-red-700 mb-4">{error}</p>
                <Link
                  href="/products"
                  className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition-colors"
                >
                  {t('back_to_products')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const price = getProductPrice(product);
  const images = product.imageUrl ? [product.imageUrl] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <Navigation scrolled={scrolled} />
      
      {/* Breadcrumb */}
      <div className="pt-20 pb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center space-x-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-gray-700">{t('breadcrumb.home')}</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-gray-700">{t('breadcrumb.products')}</Link>
            <span>/</span>
            <span className="text-gray-900">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Main Product Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-lg border border-gray-200 overflow-hidden">
              {images[selectedImage] ? (
                <img 
                  src={images[selectedImage]} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
                  <div className="text-6xl">🌱</div>
                </div>
              )}
            </div>
            
            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="flex space-x-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 rounded border-2 overflow-hidden ${
                      selectedImage === index ? 'border-blue-500' : 'border-gray-200'
                    }`}
                  >
                    <img src={image} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title and Rating */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            </div>

            {/* Price */}
            <div className="border-b border-gray-200 pb-4">
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-bold text-gray-900">${price.toFixed(2)}</span>
              </div>
            </div>

            {/* Stock Status */}
            <div className="flex items-center space-x-2">
              {product.stockQuantity > 0 ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-green-600 font-medium">{t('stock_status.in_stock', { quantity: product.stockQuantity })}</span>
                  <span className="text-gray-500">
                    ({product.stockQuantity - currentQuantity} {t('available')}, {currentQuantity} {t('in_cart')})
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <span className="text-red-600 font-medium">{t('stock_status.out_of_stock')}</span>
                </>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">{t('quantity')}</span>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                  className="px-3 py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 py-2 border-x border-gray-300 font-medium">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= Math.min(product.stockQuantity, product.stockQuantity - currentQuantity)}
                  className="px-3 py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span className="text-sm text-gray-500">
                {product.stockQuantity - currentQuantity} {t('available')}
              </span>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={product.stockQuantity <= 0}
              className={`w-full py-4 px-6 rounded-lg font-medium text-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
                isInCart
                  ? 'bg-green-100 text-green-700 border-2 border-green-200'
                  : product.stockQuantity > 0
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              <span>
                {isInCart 
                  ? `${t('in_cart')} (${currentQuantity})` 
                  : product.stockQuantity > 0 
                  ? t('add_to_cart') 
                  : t('out_of_stock')
                }
              </span>
            </button>

            {/* Trust Badges */}
            <div className="flex items-center justify-center space-x-6 py-4 border-t border-gray-200">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Shield className="w-4 h-4" />
                <span>{t('trust_badges.secure_payment')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {[
                { id: 'description', label: t('tabs.description') },
                { id: 'specifications', label: t('tabs.specifications') },
                { id: 'shipping', label: t('tabs.shipping') }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="py-8">
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <h3 className="text-xl font-semibold mb-4">{t('description.title')}</h3>
                <p className="text-gray-700 leading-relaxed">
                  {product.description || t('description.no_description')}
                </p>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div>
                <h3 className="text-xl font-semibold mb-4">{t('specifications.title')}</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">{t('specifications.sku')}</span>
                      <span className="font-medium">{product.idProduct}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">{t('specifications.stock')}</span>
                      <span className="font-medium">{product.stockQuantity} {t('specifications.units')}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">{t('specifications.status')}</span>
                      <span className={`font-medium ${product.isActive ? 'text-green-600' : 'text-red-600'}`}>
                        {product.isActive ? t('specifications.active') : t('specifications.inactive')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div>
                <h3 className="text-xl font-semibold mb-4">{t('shipping.title')}</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">{t('shipping.return_policy')}</h4>
                    <p className="text-gray-700">{t('shipping.return_policy_text')}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer t={t} />
    </div>
  );
} 