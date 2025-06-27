"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname, useParams } from 'next/navigation';
import Link from 'next/link';
import { Flower, Globe, Menu, X, User, LogOut, LogIn, ShoppingCart } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { useCartHydration } from '@/hooks/useCartHydration';

interface NavigationProps {
  scrolled: boolean;
}

export default function Navigation({ scrolled }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const t = useTranslations('nav');
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const locale = params.locale as string;
  const locales = ['en', 'fr', 'es'];

  // Auth state
  const { user, isAuthenticated, logout, isHydrated } = useAuthStore();
  
  // Cart state
  const { getSummary } = useCartStore();
  const cartSummary = getSummary();
  const { isHydrated: isCartHydrated } = useCartHydration();

  // Only show auth-related UI after hydration to prevent mismatches
  const shouldShowAuth = isHydrated;
  
  // Only show cart badge after hydration to prevent mismatches
  const shouldShowCartBadge = isCartHydrated;

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);

  const switchLocale = (newLocale: string) => {
    // Remove the current locale from the pathname
    const pathnameWithoutLocale = pathname.replace(/^\/(en|fr|es)/, '');
    
    // Navigate to the new locale
    router.push(`/${newLocale}${pathnameWithoutLocale || ''}`);
    setIsMenuOpen(false);
  };

  const getFlag = (locale: string) => {
    const flags: Record<string, string> = {
      en: '🇺🇸',
      fr: '🇫🇷',
      es: '🇪🇸'
    };
    return flags[locale] || '🌐';
  };

  const getLanguageName = (locale: string) => {
    const languageNames: Record<string, string> = {
      en: 'English',
      fr: 'Français',
      es: 'Español'
    };
    return languageNames[locale] || locale;
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    router.push(`/${locale}`);
  };

  // Navigation items (removed home since logo links to home)
  const navItems = [
    { href: `/${locale}/products`, label: t('products') },
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

  const LanguageSwitcher = ({ isMobile = false }) => {
    return (
      <div className={`relative ${isMobile ? 'py-2' : ''}`}>
        {isMobile ? (
          // Mobile: Show as buttons
          <div className="flex items-center space-x-2">
            {locales.map((lang) => (
              <button
                key={lang}
                onClick={() => switchLocale(lang)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                  locale === lang
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                } w-full justify-start`}
              >
                <span className="text-lg">{getFlag(lang)}</span>
                <span className="text-sm">{getLanguageName(lang)}</span>
              </button>
            ))}
          </div>
        ) : (
          // Desktop: Dropdown
          <div className="relative">
            <button
              onClick={() => setIsLanguageOpen(!isLanguageOpen)}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all duration-200"
            >
              <span className="text-lg">{getFlag(locale)}</span>
              <span className="text-sm font-medium">{getLanguageName(locale)}</span>
              <svg 
                className={`w-4 h-4 transition-transform duration-200 ${isLanguageOpen ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isLanguageOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                {locales.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      switchLocale(lang);
                      setIsLanguageOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-2 text-sm transition-colors ${
                      locale === lang
                        ? 'bg-green-50 text-green-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-lg">{getFlag(lang)}</span>
                    <span>{getLanguageName(lang)}</span>
                    {locale === lang && (
                      <svg className="w-4 h-4 ml-auto text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const AuthSection = ({ isMobile = false }) => {
    if (!shouldShowAuth) return null;

    if (isAuthenticated && user) {
      return (
        <div className={`relative ${isMobile ? 'py-2' : ''}`}>
          {isMobile ? (
            // Mobile: Simple list
            <>
              <Link
                href={`/${locale}/profile`}
                className="block py-2 text-gray-700 hover:text-green-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('auth.profile')}
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left py-2 text-red-600 hover:text-red-700 transition-colors"
              >
                {t('auth.sign_out')}
              </button>
            </>
          ) : (
            // Desktop: Dropdown menu
            <>
              <button
                onClick={toggleUserMenu}
                className="flex items-center space-x-2 text-gray-700 hover:text-green-600 transition-colors"
              >
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-sm font-medium">{user.firstname}</span>
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user.firstname} {user.surname}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <Link
                    href={`/${locale}/profile`}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    {t('auth.profile')}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    {t('auth.sign_out')}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      );
    }

    return (
      <div className={`flex items-center space-x-4 ${isMobile ? 'py-2 flex-col space-y-2 space-x-0' : ''}`}>
        <Link
          href={`/${locale}/login`}
          className={`flex items-center space-x-2 text-gray-700 hover:text-green-600 transition-colors ${
            isMobile ? 'text-sm' : ''
          }`}
          onClick={isMobile ? () => setIsMenuOpen(false) : undefined}
        >
          <LogIn className="h-4 w-4" />
          <span>{t('auth.sign_in')}</span>
        </Link>
        <Link
          href={`/${locale}/register`}
          className={`bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
            isMobile ? 'w-full text-center' : ''
          }`}
          onClick={isMobile ? () => setIsMenuOpen(false) : undefined}
        >
          {t('auth.create_account')}
        </Link>
      </div>
    );
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setIsUserMenuOpen(false);
    };

    if (isUserMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isUserMenuOpen]);

  // Close language dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setIsLanguageOpen(false);
    };

    if (isLanguageOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isLanguageOpen]);

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
            
            {/* Cart Icon - only show when hydrated */}
            {shouldShowCartBadge && (
              <Link 
                href={`/${locale}/cart`}
                className="relative flex items-center text-gray-700 hover:text-green-600 transition-colors"
              >
                <ShoppingCart className="h-6 w-6" />
                {cartSummary.totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {cartSummary.totalItems > 99 ? '99+' : cartSummary.totalItems}
                  </span>
                )}
              </Link>
            )}
            
            <AuthSection />
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
            
            {/* Mobile Cart Link - only show when hydrated */}
            {shouldShowCartBadge && (
              <Link 
                href={`/${locale}/cart`}
                className="flex items-center justify-between py-2 text-gray-700 hover:text-green-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="h-5 w-5" />
                  <span>{t('cart')}</span>
                </div>
                {cartSummary.totalItems > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {cartSummary.totalItems > 99 ? '99+' : cartSummary.totalItems}
                  </span>
                )}
              </Link>
            )}
            
            <div className="border-t border-gray-200 pt-2">
              <LanguageSwitcher isMobile />
            </div>
            <div className="border-t border-gray-200 pt-2">
              <AuthSection isMobile />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}