"use client";

import { Thermometer, Wifi, Smartphone } from 'lucide-react';

interface ProductsProps {
  t: any; // Translation object
}

export default function Products({ t }: ProductsProps) {
  // Helper function to get translated features
  const getTranslatedFeatures = (productKey: string) => {
    const features = [
      t(`products.${productKey}.features.0`),
      t(`products.${productKey}.features.1`),
      t(`products.${productKey}.features.2`),
      t(`products.${productKey}.features.3`)
    ];
    return features.filter(feature => feature && feature !== `products.${productKey}.features.0`);
  };

  const products = [
    {
      icon: Thermometer,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      title: t('products.sensor.title'),
      description: t('products.sensor.description'),
      features: getTranslatedFeatures('sensor'),
      price: t('products.sensor.price'),
      buttonText: t('hero.cta'),
      buttonColor: 'bg-green-600 hover:bg-green-700'
    },
    {
      icon: Wifi,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      title: t('products.hub.title'),
      description: t('products.hub.description'),
      features: getTranslatedFeatures('hub'),
      price: t('products.hub.price'),
      buttonText: t('hero.cta'),
      buttonColor: 'bg-green-600 hover:bg-green-700',
      isPopular: true
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
      buttonColor: 'bg-blue-600 hover:bg-blue-700'
    }
  ];

  return (
    <section id="products" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('products.title')}</h2>
          <p className="text-xl text-gray-600">{t('products.subtitle')}</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {products.map((product, index) => {
            const IconComponent = product.icon;
            return (
              <div key={index} className={`bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow ${product.isPopular ? 'border-2 border-green-200' : ''}`}>
                <div className={`${product.iconBg} w-12 h-12 rounded-lg flex items-center justify-center mb-6`}>
                  <IconComponent className={`h-6 w-6 ${product.iconColor}`} />
                </div>
                {product.isPopular && (
                  <div className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full inline-block mb-4">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{product.title}</h3>
                <p className="text-gray-600 mb-6">{product.description}</p>
                <ul className="space-y-2 mb-6">
                  {product.features.map((feature: string, featureIndex: number) => (
                    <li key={featureIndex} className="flex items-center text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-3"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-900">{product.price}</span>
                  <button className={`${product.buttonColor} text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium`}>
                    {product.buttonText}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
} 