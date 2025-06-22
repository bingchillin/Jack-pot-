"use client";

interface CTAProps {
  t: any; // Translation object
}

export default function CTA({ t }: CTAProps) {
  return (
    <section className="py-24 bg-green-600">
      <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-white mb-4">{t('cta.title')}</h2>
        <p className="text-xl text-green-100 mb-8">{t('cta.subtitle')}</p>
        <button className="bg-white text-green-600 px-8 py-4 rounded-lg hover:bg-green-50 transition-colors font-medium text-lg">
          {t('cta.button')}
        </button>
      </div>
    </section>
  );
} 