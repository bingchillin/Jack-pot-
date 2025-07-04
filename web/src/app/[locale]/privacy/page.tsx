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

  const renderSection = (sectionKey: string) => {
    const section = t.raw(`privacy.sections.${sectionKey}`);
    if (!section) return null;

    return (
      <section key={sectionKey} className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          {section.title}
        </h2>
        <div className="text-gray-700 leading-relaxed">
          <p className="mb-4">{section.content}</p>
          
          {/* Render details list if available */}
          {section.details && section.details.length > 0 && (
            <ul className="list-disc pl-6 mb-4 space-y-2">
              {section.details.map((detail: string, index: number) => (
                <li key={index}>{detail}</li>
              ))}
            </ul>
          )}
          
          {/* Render additional info if available */}
          {section.additional_info && (
            <p className="text-gray-600 italic">{section.additional_info}</p>
          )}
        </div>
      </section>
    );
  };

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
                  {renderSection('data_collection')}
                  {renderSection('data_use')}
                  {renderSection('data_sharing')}
                  {renderSection('data_security')}
                  {renderSection('data_retention')}
                  {renderSection('your_rights')}
                  {renderSection('children_policy')}
                  {renderSection('policy_changes')}
                  {renderSection('contact')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
} 