"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Navigation from '../../../components/landing/Navigation';
import Footer from '../../../components/landing/Footer';

export default function PrivacyPage() {
  const [scrolled, setScrolled] = useState(false);
  const t = useTranslations();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navigation scrolled={scrolled} />
      
      {/* Main Content */}
      <div className="pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-green-600 px-6 py-8">
              <div className="max-w-3xl mx-auto text-center">
                <h1 className="text-3xl font-bold text-white mb-2">
                  {t('privacy.title')}
                </h1>
                <p className="text-green-100 text-sm">
                  {t('privacy.last_updated')}
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-8">
              <div className="max-w-3xl mx-auto prose prose-lg">
                {/* Introduction */}
                <div className="mb-8">
                  <p className="text-gray-700 leading-relaxed">
                    {t('privacy.intro')}
                  </p>
                </div>

                {/* Sections */}
                <div className="space-y-8">
                  {/* Data Collection */}
                  <section>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                      {t('privacy.sections.data_collection.title')}
                    </h2>
                    <p className="text-gray-700 leading-relaxed">
                      {t('privacy.sections.data_collection.content')}
                    </p>
                  </section>

                  {/* Data Use */}
                  <section>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                      {t('privacy.sections.data_use.title')}
                    </h2>
                    <p className="text-gray-700 leading-relaxed">
                      {t('privacy.sections.data_use.content')}
                    </p>
                  </section>

                  {/* Data Sharing */}
                  <section>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                      {t('privacy.sections.data_sharing.title')}
                    </h2>
                    <p className="text-gray-700 leading-relaxed">
                      {t('privacy.sections.data_sharing.content')}
                    </p>
                  </section>

                  {/* Your Rights */}
                  <section>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                      {t('privacy.sections.your_rights.title')}
                    </h2>
                    <p className="text-gray-700 leading-relaxed">
                      {t('privacy.sections.your_rights.content')}
                    </p>
                  </section>

                  {/* Contact */}
                  <section>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                      {t('privacy.sections.contact.title')}
                    </h2>
                    <p className="text-gray-700 leading-relaxed">
                      {t('privacy.sections.contact.content')}
                    </p>
                  </section>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer t={t} />
    </div>
  );
} 