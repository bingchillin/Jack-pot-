"use client";

import { Flower } from 'lucide-react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface FooterProps {
  t: any;
}

export default function Footer({ t }: FooterProps) {
  const params = useParams();
  const locale = params.locale as string;

  return (
    <footer id="contact" className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
          <Flower className="h-8 w-8 text-green-600" />
            <span className="text-xl font-bold">{t('footer.company')}</span>
          </div>
          <div className="flex space-x-6 text-sm text-gray-400">
            <Link href={`/${locale}/privacy`} className="hover:text-white transition-colors">{t('footer.links.privacy')}</Link>
            <Link href={`/${locale}/terms`} className="hover:text-white transition-colors">{t('footer.links.terms')}</Link>
            <Link href={`/${locale}/contact`} className="hover:text-white transition-colors">{t('footer.links.support')}</Link>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          © 2025 {t('footer.company')}. {t('footer.rights')}
        </div>
      </div>
    </footer>
  );
} 