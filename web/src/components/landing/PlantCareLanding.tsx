"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Navigation from './Navigation';
import Hero from './Hero';
import Features from './Features';
import Products from './Products';
import CTA from './CTA';
import Footer from './Footer';

export default function PlantCareLanding() {
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
      <Hero t={t} />
      <Features t={t} />
      <Products t={t} />
      <CTA t={t} />
      <Footer t={t} />
    </div>
  );
} 