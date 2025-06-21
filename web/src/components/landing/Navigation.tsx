"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { Leaf, Globe, Menu, X } from 'lucide-react';

interface NavigationProps {
  scrolled: boolean;
}

export default function Navigation({ scrolled }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const t = useTranslations('nav');
  const router = useRouter();
  const pathname = usePathname();

  const locales = ['en', 'fr', 'es'];

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const switchLocale = (newLocale: string) => {
    // Remove the current locale from the pathname
    const pathnameWithoutLocale = pathname.replace(/^\/(en|fr|es)/, '');
    
    // Navigate to the new locale
    router.push(`/${newLocale}${pathnameWithoutLocale || ''}`);
    setIsMenuOpen(false);
  };

  const getLanguageName = (locale: string) => {
    const languageNames: Record<string, string> = {
      en: 'EN',
      fr: 'FR',
      es: 'ES'
    };
    return languageNames[locale] || locale;
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/95 backdrop-blur-sm shadow-sm' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <Leaf className="h-8 w-8 text-green-600" />
            <span className="text-xl font-bold text-gray-900">PlantCare</span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#home" className="text-gray-700 hover:text-green-600 transition-colors">{t('home')}</a>
            <a href="#about" className="text-gray-700 hover:text-green-600 transition-colors">{t('about')}</a>
            <a href="#products" className="text-gray-700 hover:text-green-600 transition-colors">{t('products')}</a>
            <a href="#contact" className="text-gray-700 hover:text-green-600 transition-colors">{t('contact')}</a>
            
            {/* Language Switcher */}
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4 text-gray-500" />
              <select 
                value={pathname.split('/')[1] || 'en'} 
                onChange={(e) => switchLocale(e.target.value)}
                className="bg-transparent border-none text-sm text-gray-700 focus:outline-none cursor-pointer"
              >
                {locales.map((locale: string) => (
                  <option key={locale} value={locale}>
                    {getLanguageName(locale)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Mobile menu button */}
          <button onClick={toggleMenu} className="md:hidden p-2">
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-2 space-y-2">
            <a href="#home" className="block py-2 text-gray-700">{t('home')}</a>
            <a href="#about" className="block py-2 text-gray-700">{t('about')}</a>
            <a href="#products" className="block py-2 text-gray-700">{t('products')}</a>
            <a href="#contact" className="block py-2 text-gray-700">{t('contact')}</a>
            <div className="flex items-center space-x-2 py-2">
              <Globe className="h-4 w-4 text-gray-500" />
              {locales.map((locale: string) => (
                <button 
                  key={locale}
                  onClick={() => switchLocale(locale)} 
                  className={`px-2 py-1 text-sm ${pathname.split('/')[1] === locale ? 'text-green-600 font-medium' : 'text-gray-700'}`}
                >
                  {getLanguageName(locale)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
} 