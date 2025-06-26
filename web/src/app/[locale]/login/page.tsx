"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navigation from '../../../components/landing/Navigation';
import Footer from '../../../components/landing/Footer';
import { useAuthStore } from '@/stores/authStore';
import { Eye, EyeOff, User, Lock, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const [scrolled, setScrolled] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const t = useTranslations();
  const router = useRouter();
  const { login, isLoading, isAuthenticated } = useAuthStore();
  const params = useParams();
  const locale = params.locale as string;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push(`/${locale}/profile`);
    }
  }, [isAuthenticated, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.email || !formData.password) {
      setError(t('auth.login.error.fill_fields'));
      return;
    }

    try {
      await login(formData);
      setSuccess(t('auth.login.success'));
      
        router.push(`/${locale}/profile`);
    } catch (error: any) {
      setError(error.message || t('auth.login.error.login_failed'));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <Navigation scrolled={scrolled} />
      
      {/* Hero Section */}
      <div className="relative pt-16 pb-8 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse"></div>
          <div className="absolute top-20 right-1/4 w-96 h-96 bg-gradient-to-r from-green-100 to-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 text-sm font-medium shadow-sm border border-slate-200/50">
              <User className="w-4 h-4 mr-2 text-green-500" />
              {t('auth.login.welcome_back')}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-white/80 backdrop-blur-sm shadow-2xl shadow-slate-200/50 border border-slate-200/50 rounded-3xl p-8 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full -translate-y-16 translate-x-16 opacity-60"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-100 to-blue-100 rounded-full translate-y-12 -translate-x-12 opacity-60"></div>
          
          <div className="relative">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">{t('auth.login.subtitle')}</h2>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 rounded-2xl bg-green-50 border border-green-200 flex items-center">
                <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                <p className="text-green-700 text-sm">{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Email Field */}
              <div className="group">
                <label 
                  htmlFor="email" 
                  className={`block text-sm font-semibold mb-3 transition-colors ${
                    focusedField === 'email' ? 'text-slate-900' : 'text-slate-700'
                  }`}
                >
                  {t('auth.login.email')} *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full pl-12 pr-5 py-4 border border-slate-200 rounded-2xl bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200 text-slate-900 placeholder:text-slate-400 hover:border-slate-300"
                    placeholder={t('auth.login.email_placeholder')}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="group">
                <label 
                  htmlFor="password" 
                  className={`block text-sm font-semibold mb-3 transition-colors ${
                    focusedField === 'password' ? 'text-slate-900' : 'text-slate-700'
                  }`}
                >
                  {t('auth.login.password')} *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full pl-12 pr-12 py-4 border border-slate-200 rounded-2xl bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200 text-slate-900 placeholder:text-slate-400 hover:border-slate-300"
                    placeholder={t('auth.login.password_placeholder')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors" />
                    )}
                  </button>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="text-right">
                <Link 
                  href={`/${locale}/forgot-password`} 
                  className="text-sm text-green-600 hover:text-green-700 font-medium transition-colors"
                >
                  {t('auth.login.forgot_password')}
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-200 shadow-lg shadow-green-600/25 hover:shadow-green-700/30 transform hover:translate-y-[-1px] disabled:transform-none disabled:shadow-none"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                    {t('auth.login.signing_in')}
                  </div>
                ) : (
                  t('auth.login.sign_in')
                )}
              </button>
            </form>

            {/* Additional Links */}
            <div className="mt-8 pt-8 border-t border-slate-200/50 text-center">
              <p className="text-slate-600 text-sm">
                {t('auth.login.new_to_jack_pot')}{' '}
                <Link href={`/${locale}/register`} className="text-green-600 hover:text-green-700 font-medium transition-colors">
                  {t('auth.login.create_account')}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer t={t} />
    </div>
  );
} 