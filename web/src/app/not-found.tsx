"use client";

import { useEffect, useState } from 'react';
import { NextIntlClientProvider, useTranslations } from 'next-intl';
import Link from "next/link";

function NotFoundContent({ locale }: { locale: string }) {
  const t = useTranslations("auth");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="pt-32 pb-8 flex items-center justify-center px-4">
        <div className="text-center max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-9xl font-bold text-gray-200">404</h1>
          </div>
          
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              {t('errors.page_not_found')}
            </h2>
            <p className="text-lg text-gray-600 max-w-md mx-auto">
              {t('errors.page_not_found_description')}
            </p>
          </div>
          
          <div className="space-y-4">
            <Link
              href={`/${locale}`}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
            >
              {t('errors.go_home')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NotFound() {
  const [locale, setLocale] = useState('en');
  const [messages, setMessages] = useState<any>(null);

  useEffect(() => {
    // Detect locale from URL or browser
    const detectLocale = () => {
      // First try to get locale from URL path
      const path = window.location.pathname;
      const pathSegments = path.split('/').filter(Boolean);
      const supportedLocales = ['en', 'fr', 'es'];
      
      // Check if first segment is a supported locale
      if (pathSegments.length > 0 && supportedLocales.includes(pathSegments[0])) {
        return pathSegments[0];
      }
      
      // Fallback to browser language
      const browserLang = navigator.language.split('-')[0];
      return supportedLocales.includes(browserLang) ? browserLang : 'en';
    };

    const detectedLocale = detectLocale();
    setLocale(detectedLocale);

    // Load messages for the detected locale
    import(`../../messages/${detectedLocale}.json`)
      .then((messages) => {
        setMessages(messages.default);
      })
      .catch(() => {
        // Fallback to English if locale messages fail to load
        import(`../../messages/en.json`).then((messages) => {
          setMessages(messages.default);
        });
      });
  }, []);

  // Show loading spinner while messages are being loaded
  if (!messages) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div className="pt-32 pb-8 flex items-center justify-center px-4">
          <div className="text-center max-w-2xl mx-auto">
            <div className="mb-8">
              <h1 className="text-9xl font-bold text-gray-200">404</h1>
            </div>
            <div className="flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <NotFoundContent locale={locale} />
    </NextIntlClientProvider>
  );
}
