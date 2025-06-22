"use client";

import { Leaf } from 'lucide-react';

interface HeroProps {
  t: any; // Translation object
}

export default function Hero({ t }: HeroProps) {
  return (
    <section id="home" className="relative pt-16 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-blue-50"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <div className="inline-flex items-center px-4 py-2 bg-green-100 rounded-full text-green-800 text-sm font-medium mb-8">
            <Leaf className="h-4 w-4 mr-2" />
            {t('hero.subtitle')}
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            {t('hero.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {t('hero.description')}
          </p>
        </div>
      </div>
    </section>
  );
} 