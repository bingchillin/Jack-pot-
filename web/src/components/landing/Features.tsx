"use client";

import { Droplets, Smartphone, BarChart3 } from 'lucide-react';

interface FeaturesProps {
  t: any; // Translation object
}

export default function Features({ t }: FeaturesProps) {
  const features = [
    {
      icon: Droplets,
      bgColor: 'from-blue-50 to-indigo-50',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      title: t('features.monitoring.title'),
      description: t('features.monitoring.description')
    },
    {
      icon: Smartphone,
      bgColor: 'from-green-50 to-emerald-50',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      title: t('features.smart.title'),
      description: t('features.smart.description')
    },
    {
      icon: BarChart3,
      bgColor: 'from-purple-50 to-pink-50',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      title: t('features.analytics.title'),
      description: t('features.analytics.description')
    }
  ];

  return (
    <section id="about" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('features.title')}</h2>
          <p className="text-xl text-gray-600">{t('features.subtitle')}</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div key={index} className={`text-center p-8 rounded-2xl bg-gradient-to-br ${feature.bgColor} hover:shadow-lg transition-shadow`}>
                <div className={`${feature.iconBg} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6`}>
                  <IconComponent className={`h-8 w-8 ${feature.iconColor}`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
} 