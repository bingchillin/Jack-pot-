"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Navigation from '../../../components/landing/Navigation';
import Footer from '../../../components/landing/Footer';

export default function ContactPage() {
  const [scrolled, setScrolled] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const t = useTranslations('contact');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch(`${API_URL}/mailer/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
        
        setTimeout(() => setSubmitStatus('idle'), 5000);
      } else {
        throw new Error(result.message || 'Failed to send message');
      }
      
    } catch (error) {
      console.error('Error sending contact form:', error);
      setSubmitStatus('error');
      
      setTimeout(() => setSubmitStatus('idle'), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <Navigation scrolled={scrolled} />
      
      {/* Hero Section */}
      <div className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse"></div>
          <div className="absolute top-20 right-1/4 w-96 h-96 bg-gradient-to-r from-green-100 to-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 text-sm font-medium mb-8 shadow-sm border border-slate-200/50">
              <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {t('response_badge')}
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent mb-6 leading-tight">
              {t('title')}
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-600 mb-8 leading-relaxed max-w-3xl mx-auto">
              {t('subtitle')}
            </p>
            
            <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
              {t('description')}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
          {/* Contact Form */}
          <div className="lg:col-span-3">
            <div className="bg-white/80 backdrop-blur-sm shadow-2xl shadow-slate-200/50 border border-slate-200/50 rounded-3xl p-8 md:p-12 relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full -translate-y-16 translate-x-16 opacity-60"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-100 to-blue-100 rounded-full translate-y-12 -translate-x-12 opacity-60"></div>
              
              <div className="relative">
                <div className="mb-10">
                  <h2 className="text-3xl font-bold text-slate-900 mb-4">{t('form.title')}</h2>
                  <p className="text-slate-600">{t('form.subtitle')}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="group">
                      <label 
                        htmlFor="name" 
                        className={`block text-sm font-semibold mb-3 transition-colors ${
                          focusedField === 'name' ? 'text-slate-900' : 'text-slate-700'
                        }`}
                      >
                        {t('form.name')} *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField('name')}
                        onBlur={() => setFocusedField(null)}
                        className="w-full px-5 py-4 border border-slate-200 rounded-2xl bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200 text-slate-900 placeholder:text-slate-400 hover:border-slate-300"
                        placeholder={t('form.name_placeholder')}
                      />
                    </div>
                    <div className="group">
                      <label 
                        htmlFor="email" 
                        className={`block text-sm font-semibold mb-3 transition-colors ${
                          focusedField === 'email' ? 'text-slate-900' : 'text-slate-700'
                        }`}
                      >
                        {t('form.email')} *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        className="w-full px-5 py-4 border border-slate-200 rounded-2xl bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200 text-slate-900 placeholder:text-slate-400 hover:border-slate-300"
                        placeholder={t('form.email_placeholder')}
                      />
                    </div>
                  </div>
                  
                  <div className="group">
                    <label 
                      htmlFor="subject" 
                      className={`block text-sm font-semibold mb-3 transition-colors ${
                        focusedField === 'subject' ? 'text-slate-900' : 'text-slate-700'
                      }`}
                    >
                      {t('form.subject')} *
                    </label>
                    <div className="relative">
                      <select
                        id="subject"
                        name="subject"
                        required
                        value={formData.subject}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField('subject')}
                        onBlur={() => setFocusedField(null)}
                        className="w-full px-5 py-4 border border-slate-200 rounded-2xl bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200 text-slate-900 hover:border-slate-300 appearance-none cursor-pointer"
                      >
                        <option value="">{t('form.subject_placeholder')}</option>
                        <option value={t('topics.technical')}>{t('topics.technical')}</option>
                        <option value={t('topics.product')}>{t('topics.product')}</option>
                        <option value={t('topics.order')}>{t('topics.order')}</option>
                        <option value={t('topics.account_deletion')}>{t('topics.account_deletion')}</option>
                        <option value={t('topics.general')}>{t('topics.general')}</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-5 pointer-events-none">
                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div className="group">
                    <label 
                      htmlFor="message" 
                      className={`block text-sm font-semibold mb-3 transition-colors ${
                        focusedField === 'message' ? 'text-slate-900' : 'text-slate-700'
                      }`}
                    >
                      {t('form.message')} *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={6}
                      value={formData.message}
                      onChange={handleInputChange}
                      onFocus={() => setFocusedField('message')}
                      onBlur={() => setFocusedField(null)}
                      className="w-full px-5 py-4 border border-slate-200 rounded-2xl bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200 text-slate-900 placeholder:text-slate-400 hover:border-slate-300 resize-none"
                      placeholder={t('form.message_placeholder')}
                    />
                  </div>
                  
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="group relative w-full bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white py-5 px-8 rounded-2xl font-semibold focus:ring-2 focus:ring-slate-500/20 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-slate-900/20 hover:shadow-xl hover:shadow-slate-900/30 hover:-translate-y-0.5"
                    >
                      <span className="relative flex items-center justify-center">
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {t('form.sending')}
                          </>
                        ) : (
                          <>
                            {t('form.submit')}
                            <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                          </>
                        )}
                      </span>
                    </button>
                  </div>
                  
                  {/* Status Messages */}
                  {submitStatus === 'success' && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 rounded-2xl p-6 backdrop-blur-sm">
                      <div className="flex items-center">
                        <svg className="w-6 h-6 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <p className="text-green-800 font-medium">{t('form.success')}</p>
                      </div>
                    </div>
                  )}
                  
                  {submitStatus === 'error' && (
                    <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200/50 rounded-2xl p-6 backdrop-blur-sm">
                      <div className="flex items-center">
                        <svg className="w-6 h-6 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <p className="text-red-800 font-medium">{t('form.error')}</p>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="lg:col-span-2 space-y-8">
            {/* Topics Card */}
            <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-200/50 rounded-3xl p-8 shadow-lg shadow-slate-200/30">
              <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center">
                <svg className="w-6 h-6 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t('topics.title')}
              </h3>
              
              <div className="grid grid-cols-1 gap-3">
                {[
                  { icon: '🔧', text: t('topics.technical') },
                  { icon: '📦', text: t('topics.product') },
                  { icon: '🛒', text: t('topics.order') },
                  { icon: '🗑️', text: t('topics.account_deletion') },
                  { icon: '💬', text: t('topics.general') }
                ].map((topic, index) => (
                  <div 
                    key={index}
                    className="flex items-center p-4 rounded-2xl bg-white/60 border border-slate-200/30 hover:bg-white/80 hover:border-slate-300/50 transition-all duration-200"
                  >
                    <span className="text-xl mr-4">{topic.icon}</span>
                    <span className="text-slate-700 font-medium">{topic.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}