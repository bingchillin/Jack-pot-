"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname, useParams } from 'next/navigation';
import Link from 'next/link';
import { Flower, Globe, Menu, X } from 'lucide-react';

interface NavigationProps {
  scrolled: boolean;
}

export default function Navigation({ scrolled }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const t = useTranslations('nav');
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const locale = params.locale as string;
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

  // Single navigation items array
  const navItems = [
    { href: `/${locale}`, label: t('home') },
    { href: `/${locale}#products`, label: t('products') },
    { href: `/${locale}/contact`, label: t('contact') }
  ];

  const NavLinks = ({ isMobile = false }) => (
    <>
      {navItems.map((item, index) => (
        <Link 
          key={index}
          href={item.href} 
          className={`text-gray-700 hover:text-green-600 transition-colors ${
            isMobile ? 'block py-2' : ''
          }`}
          onClick={isMobile ? () => setIsMenuOpen(false) : undefined}
        >
          {item.label}
        </Link>
      ))}
    </>
  );

  const LanguageSwitcher = ({ isMobile = false }) => (
    <div className={`flex items-center space-x-2 ${isMobile ? 'py-2' : ''}`}>
      <Globe className="h-4 w-4 text-gray-500" />
      {isMobile ? (
        // Mobile: Show as buttons
        locales.map((loc) => (
          <button 
            key={loc}
            onClick={() => switchLocale(loc)} 
            className={`px-2 py-1 text-sm ${
              pathname.split('/')[1] === loc ? 'text-green-600 font-medium' : 'text-gray-700'
            }`}
          >
            {getLanguageName(loc)}
          </button>
        ))
      ) : (
        // Desktop: Show as select
        <select 
          value={pathname.split('/')[1] || 'en'} 
          onChange={(e) => switchLocale(e.target.value)}
          className="bg-transparent border-none text-sm text-gray-700 focus:outline-none cursor-pointer"
        >
          {locales.map((loc) => (
            <option key={loc} value={loc}>
              {getLanguageName(loc)}
            </option>
          ))}
        </select>
      )}
    </div>
  );

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/95 backdrop-blur-sm shadow-sm' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <Flower className="h-8 w-8 text-green-600" />
            <span className="text-xl font-bold text-gray-900">Jack Pot</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLinks />
            <LanguageSwitcher />
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
            <NavLinks isMobile />
            <LanguageSwitcher isMobile />
          </div>
        </div>
      )}
    </nav>
  );
}