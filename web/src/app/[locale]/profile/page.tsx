"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import Navigation from '../../../components/landing/Navigation';
import Footer from '../../../components/landing/Footer';
import { useAuthStore } from '@/stores/authStore';
import { useVerificationCheck } from '@/hooks/useVerificationCheck';
import { useAuth } from '@/hooks/useAuth';
import { User, Mail, Phone, CheckCircle2, AlertCircle, Edit3, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { authService } from '@/services/auth.service';

export default function ProfilePage() {
  const [scrolled, setScrolled] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = params.locale as string;
  const { checkVerification } = useVerificationCheck();

  // Use auth hook for authentication
  const { user, isAuthenticated, isLoading } = useAuth({
    requireAuth: true
  });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle success message from URL parameters
  useEffect(() => {
    const success = searchParams.get('success');
    if (success) {
      setSuccessMessage(success);
      setShowToast(true);
      
      // Clear the URL parameter
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
      
      // Auto-hide toast after 5 seconds
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  // Check if we should show verification modal
  useEffect(() => {
    // Check if verification is required from URL parameter
    const verificationRequired = searchParams.get('verification_required');
    if (verificationRequired === 'true') {
      setShowVerificationModal(true);
      // Clear the URL parameter
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
      return;
    }
    
    if (user && !user.isEmailVerified) {
      // Check if user has already dismissed the modal
      const hasDismissedVerification = localStorage.getItem('verificationModalDismissed');
      if (!hasDismissedVerification) {
        setShowVerificationModal(true);
      }
    }
  }, [user, searchParams]);

  // Only redirect after loading is complete
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleResendVerification = async () => {
    if (!user?.email) return;
    
    setIsResendingVerification(true);
    try {
      await authService.resendVerification(user.email);
      toast.success(t('auth.profile.verification_modal.resend_success'));
    } catch (error) {
      toast.error(t('auth.profile.verification_modal.resend_error'));
    } finally {
      setIsResendingVerification(false);
    }
  };

  // Show loading while loading auth state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-green-600/30 border-t-green-600 rounded-full animate-spin mr-3"></div>
          <span className="text-slate-600">{t('auth.common.loading')}</span>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex flex-col">
      <Navigation scrolled={scrolled} />
      
      {/* Success Toast */}
      {showToast && successMessage && (
        <div className="fixed top-28 right-4 z-50 max-w-md">
          <div className="bg-white border-l-4 border-green-500 rounded-lg shadow-lg p-4 flex items-center space-x-3 animate-slide-in-right">
            <div className="flex-shrink-0">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{successMessage}</p>
            </div>
            <button
              onClick={() => setShowToast(false)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Email Verification Modal */}
      {showVerificationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
            onClick={() => {
              setShowVerificationModal(false);
              localStorage.setItem('verificationModalDismissed', 'true');
            }}
          />
          
          {/* Modal */}
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 animate-modal-slide-in">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full -translate-y-12 translate-x-12 opacity-60"></div>
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-blue-100 to-purple-100 rounded-full translate-y-10 -translate-x-10 opacity-60"></div>
            
            <div className="relative p-8 text-center">
              {/* Warning Icon */}
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                <AlertCircle className="h-10 w-10 text-yellow-600" />
              </div>
              
              {/* Title */}
              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                {t('auth.profile.verification_modal.title')}
              </h3>
              
              {/* Message */}
              <p className="text-slate-600 mb-6 leading-relaxed">
                {t('auth.profile.verification_modal.message')}
              </p>
              
              {/* Email reminder */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
                <p className="text-sm text-blue-700 font-medium">
                  {t('auth.profile.verification_modal.check_email')}
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  {user?.email}
                </p>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleResendVerification}
                  disabled={isResendingVerification}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200 shadow-lg shadow-green-600/25 hover:shadow-green-700/30 transform hover:translate-y-[-1px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResendingVerification ? t('auth.profile.verification_modal.resending') : t('auth.profile.verification_modal.resend')}
                </button>
                
                <button
                  onClick={() => {
                    setShowVerificationModal(false);
                    localStorage.setItem('verificationModalDismissed', 'true');
                  }}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 px-6 rounded-2xl transition-all duration-200"
                >
                  {t('auth.profile.verification_modal.close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
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
              {t('auth.profile.welcome_back')}, {user.firstname}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-white/80 backdrop-blur-sm shadow-2xl shadow-slate-200/50 border border-slate-200/50 rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full -translate-y-12 translate-x-12 opacity-60"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-green-100 to-blue-100 rounded-full translate-y-10 -translate-x-10 opacity-60"></div>
          
          <div className="relative">
            {/* Profile Header */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                {user.firstname} {user.surname}
              </h2>
              {/* Only show verification status if NOT verified */}
              {!user.isEmailVerified && (
                <div className="flex items-center justify-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-yellow-600 font-medium">{t('auth.profile.pending_verification')}</span>
                </div>
              )}
            </div>

            {/* Contact Information */}
            <div className="bg-slate-50 rounded-2xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">{t('auth.profile.contact_information')}</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-slate-600">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">{user.email}</span>
                </div>
                
                {user.numberPhone && (
                  <div className="flex items-center space-x-3 text-slate-600">
                    <Phone className="h-4 w-4" />
                    <span className="text-sm">{user.numberPhone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Account Actions */}
            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={() => router.push(`/${locale}/profile/edit`)}
                className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-200 shadow-lg shadow-slate-600/25 hover:shadow-slate-700/30 transform hover:translate-y-[-1px] flex items-center justify-center space-x-2"
              >
                <Edit3 className="h-5 w-5" />
                <span>{t('auth.profile.edit_information')}</span>
              </button>

              <button 
                onClick={() => router.push(`/${locale}/orders`)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-200 shadow-lg shadow-blue-600/25 hover:shadow-blue-700/30 transform hover:translate-y-[-1px] flex items-center justify-center space-x-2"
              >
                <span>{t('auth.profile.my_orders')}</span>
              </button>
            </div>

            {/* Verification Notice */}
            {!user.isEmailVerified && (
              <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl">
                <p className="text-yellow-700 text-sm text-center">
                  {t('auth.profile.email_verification_notice')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
} 