"use client";

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Flower, Smartphone, Package, Plus } from 'lucide-react';

interface ProductsProps {
  t: any; // Translation object
}

export default function Products({ t }: ProductsProps) {
  const params = useParams();
  const locale = params.locale as string;

  // Helper function to get translated features dynamically
  const getTranslatedFeatures = (productKey: string) => {
    const features = [];
    let index = 0;
    
    // Keep adding features until we can't find any more
    while (true) {
      const feature = t(`products.${productKey}.features.${index}`);
      // If the feature is the same as the key, it means it doesn't exist
      if (feature === `products.${productKey}.features.${index}`) {
        break;
      }
      features.push(feature);
      index++;
    }
    
    return features;
  };

  const products = [
    {
      icon: Flower,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      title: t('products.jack.title'),
      description: t('products.jack.description'),
      features: getTranslatedFeatures('jack'),
      price: t('products.jack.price'),
      buttonText: t('hero.cta'),
      buttonColor: 'bg-green-600 hover:bg-green-700',
      isPopular: true,
      link: `/${locale}/products`
    },
    {
      icon: Smartphone,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      title: t('products.app.title'),
      description: t('products.app.description'),
      features: getTranslatedFeatures('app'),
      price: t('products.app.price'),
      buttonText: 'Download',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
      link: '' // Blank for now - will be app store link later
    }
  ];

  return (
    <section id="products" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('products.title')}</h2>
          <p className="text-xl text-gray-600">{t('products.subtitle')}</p>
        </div>
        
        <div className="relative">
          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {products.map((product, index) => {
              const IconComponent = product.icon;
              return (
                <div key={index} className={`bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow flex flex-col ${product.isPopular ? 'border-2 border-green-200' : ''}`}>
                  <div className="flex items-center justify-between mb-6">
                    <div className={`${product.iconBg} w-12 h-12 rounded-lg flex items-center justify-center`}>
                      <IconComponent className={`h-6 w-6 ${product.iconColor}`} />
                    </div>
                    {product.isPopular && (
                      <div className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full w-fit">
                        {t('products.most_popular')}
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{product.title}</h3>
                  <p className="text-gray-600 mb-6">{product.description}</p>
                  <ul className="space-y-2 mb-6 flex-grow">
                    {product.features.map((feature: string, featureIndex: number) => (
                      <li key={featureIndex} className="flex items-center text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-3 flex-shrink-0"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-2xl font-bold text-gray-900">{product.price}</span>
                    {product.link ? (
                      <Link href={product.link}>
                        <button className={`${product.buttonColor} text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium`}>
                          {product.buttonText}
                        </button>
                      </Link>
                    ) : (
                      <button className={`${product.buttonColor} text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium cursor-not-allowed opacity-75`}>
                        {product.buttonText}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Plus icon positioned between cards - horizontal on md+, vertical on mobile */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 md:block hidden">
            <div className="bg-gradient-to-br from-green-500 to-blue-500 rounded-full p-4 shadow-xl hover:scale-110 transition-transform duration-300">
              <Plus className="h-8 w-8 text-white stroke-2" />
            </div>
          </div>
          
          {/* Plus icon for mobile - positioned between stacked cards */}
          <div className="absolute left-1/2 transform -translate-x-1/2 md:hidden block" style={{top: '50%'}}>
            <div className="bg-gradient-to-br from-green-500 to-blue-500 rounded-full p-3 shadow-xl hover:scale-110 transition-transform duration-300">
              <Plus className="h-6 w-6 text-white stroke-2" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}