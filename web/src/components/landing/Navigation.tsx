"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname, useParams } from 'next/navigation';
import Link from 'next/link';
import { Flower, Globe, Menu, X, User, LogOut, LogIn } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

interface NavigationProps {
  scrolled: boolean;
}

export default function Navigation({ scrolled }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const t = useTranslations('nav');
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const locale = params.locale as string;
  const locales = ['en', 'fr', 'es'];

  // Auth state
  const { user, isAuthenticated, logout, isHydrated } = useAuthStore();

  // Only show auth-related UI after hydration to prevent mismatches
  const shouldShowAuth = isHydrated;

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);

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

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    router.push(`/${locale}`);
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

  const AuthSection = ({ isMobile = false }) => {
    // Don't show anything until hydrated to prevent UI flash
    if (!shouldShowAuth) {
      return null;
    }

    if (isAuthenticated && user) {
      return (
        <div className={`relative ${isMobile ? 'py-2' : ''}`}>
          {isMobile ? (
            // Mobile: Show user info and logout button
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-gray-700">
                <User className="h-4 w-4" />
                <span className="text-sm">{user.firstname} {user.surname}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors text-sm"
              >
                <LogOut className="h-4 w-4" />
                <span>{t('auth.sign_out')}</span>
              </button>
            </div>
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
          <span>{t('auth.login.sign_in')}</span>
        </Link>
        <Link
          href={`/${locale}/register`}
          className={`bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
            isMobile ? 'w-full text-center' : ''
          }`}
          onClick={isMobile ? () => setIsMenuOpen(false) : undefined}
        >
          {t('auth.register.create_account')}
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