"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Navigation from '../../../components/landing/Navigation';
import Footer from '../../../components/landing/Footer';

export default function TermsPage() {
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
                  {t('terms.title')}
                </h1>
                <p className="text-green-100 text-sm">
                  {t('terms.last_updated')}
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-8">
              <div className="max-w-3xl mx-auto prose prose-lg">
                {/* Introduction */}
                <div className="mb-8">
                  <p className="text-gray-700 leading-relaxed">
                    {t('terms.intro')}
                  </p>
                </div>

                {/* Sections */}
                <div className="space-y-8">
                  {/* Service Description */}
                  <section>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                      {t('terms.sections.service_description.title')}
                    </h2>
                    <p className="text-gray-700 leading-relaxed">
                      {t('terms.sections.service_description.content')}
                    </p>
                  </section>

                  {/* User Responsibilities */}
                  <section>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                      {t('terms.sections.user_responsibilities.title')}
                    </h2>
                    <p className="text-gray-700 leading-relaxed">
                      {t('terms.sections.user_responsibilities.content')}
                    </p>
                  </section>

                  {/* Intellectual Property */}
                  <section>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                      {t('terms.sections.intellectual_property.title')}
                    </h2>
                    <p className="text-gray-700 leading-relaxed">
                      {t('terms.sections.intellectual_property.content')}
                    </p>
                  </section>

                  {/* Limitation of Liability */}
                  <section>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                      {t('terms.sections.limitation_liability.title')}
                    </h2>
                    <p className="text-gray-700 leading-relaxed">
                      {t('terms.sections.limitation_liability.content')}
                    </p>
                  </section>

                  {/* Termination */}
                  <section>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                      {t('terms.sections.termination.title')}
                    </h2>
                    <p className="text-gray-700 leading-relaxed">
                      {t('terms.sections.termination.content')}
                    </p>
                  </section>

                  {/* Changes to Terms */}
                  <section>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                      {t('terms.sections.changes.title')}
                    </h2>
                    <p className="text-gray-700 leading-relaxed">
                      {t('terms.sections.changes.content')}
                    </p>
                  </section>

                  {/* Contact */}
                  <section>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                      {t('terms.sections.contact.title')}
                    </h2>
                    <p className="text-gray-700 leading-relaxed">
                      {t('terms.sections.contact.content')}
                    </p>
                  </section>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer/>
    </div>
  );
} 