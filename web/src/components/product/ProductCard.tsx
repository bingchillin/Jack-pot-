import { useState } from 'react';
import { Product, getProductPrice } from '@/interfaces/product.interface';
import { useCartStore } from '@/stores/cartStore';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const [quantity, setQuantity] = useState(1);
  const { addItem, getItemQuantity, hasItem } = useCartStore();
  const t = useTranslations('shop.products');
  
  const currentQuantity = getItemQuantity(product.idProduct);
  const isInCart = hasItem(product.idProduct);
  const price = getProductPrice(product);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation if this is inside a link
    
    const currentCartQuantity = getItemQuantity(product.idProduct);
    const availableStock = product.stockQuantity - currentCartQuantity;
    
    if (availableStock <= 0) {
      toast.error(t('stock_validation.max_quantity', { quantity: product.stockQuantity }));
      return;
    }
    
    addItem(product, quantity);
    toast.success(t('stock_validation.added_to_cart', { name: product.name }));
  };

  const handleUpdateQuantity = (e: React.MouseEvent) => {
    e.preventDefault();
    
    const currentCartQuantity = getItemQuantity(product.idProduct);
    const availableStock = product.stockQuantity - currentCartQuantity;
    
    if (availableStock <= 0) {
      toast.error(t('stock_validation.max_quantity', { quantity: product.stockQuantity }));
      return;
    }
    
    addItem(product, quantity);
    toast.success(t('stock_validation.added_to_cart', { name: product.name }));
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= product.stockQuantity) {
      setQuantity(newQuantity);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200 overflow-hidden group">
      {/* Product Image */}
      <Link href={`/products/${product.idProduct}`} className="block">
        <div className="aspect-square bg-gray-50 relative overflow-hidden">
          {product.imageUrl ? (
            <img 
              src={product.imageUrl} 
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
              <div className="text-3xl">🌱</div>
            </div>
          )}
          
          {/* Stock Badge */}
          {product.stockQuantity <= 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
              {t('out_of_stock')}
            </div>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-3">
        {/* Product Title */}
        <Link href={`/products/${product.idProduct}`} className="block">
          <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2 hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
        </Link>
        
        {/* Price */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-baseline">
            <span className="text-lg font-bold text-gray-900">
              {price.toFixed(2)} €
            </span>
          </div>
        </div>

        {/* Stock Status */}
        <div className="text-xs text-gray-500 mb-3">
          {product.stockQuantity > 0 ? (
            <span className="text-green-600">{t('stock_status.in_stock', { quantity: product.stockQuantity })}</span>
          ) : (
            <span className="text-red-600">{t('stock_status.out_of_stock')}</span>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={isInCart ? handleUpdateQuantity : handleAddToCart}
          disabled={product.stockQuantity <= 0 || (isInCart && currentQuantity >= product.stockQuantity)}
          className={`w-full py-2 px-3 rounded text-sm font-medium transition-all duration-200 ${
            isInCart
              ? currentQuantity >= product.stockQuantity
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
              : product.stockQuantity > 0
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isInCart 
            ? currentQuantity >= product.stockQuantity
              ? t('max_reached')
              : t('add_more')
            : product.stockQuantity > 0 
            ? t('add_to_cart') 
            : t('out_of_stock')
          }
          {isInCart && currentQuantity > 0 && (
            <span className="ml-1 text-xs opacity-75">
              ({currentQuantity} {t('in_cart')})
            </span>
          )}
        </button>
      </div>
    </div>
  );
}; 