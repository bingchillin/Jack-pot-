"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navigation from '../../../../components/landing/Navigation';
import Footer from '../../../../components/landing/Footer';
import { useAuthStore } from '@/stores/authStore';
import { useAuth } from '@/hooks/useAuth';
import { User, Phone, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowLeft, MapPin } from 'lucide-react';

export default function EditProfilePage() {
  const [scrolled, setScrolled] = useState(false);
  const [formData, setFormData] = useState({
    firstname: '',
    surname: '',
    numberPhone: '',
    address: '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = params.locale as string;
  const redirect = searchParams.get('redirect');
  
  // Use auth hook for authentication
  const { user, isAuthenticated, isLoading } = useAuth({
    requireAuth: true
  });

  const { updateProfile } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Initialize form data with user information
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstname: user.firstname || '',
        surname: user.surname || '',
        numberPhone: user.numberPhone || '',
        address: user.address || ''
      }));
    }
  }, [user]);

  // Show loading while hydrating or loading auth state (but not during form submission)
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-green-600/30 border-t-green-600 rounded-full animate-spin mr-3"></div>
          <span className="text-slate-600">{t('auth.common.loading')}</span>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Special handling for phone number field
    if (name === 'numberPhone') {
      // Only allow digits and limit to 15 characters
      const numericValue = value.replace(/\D/g, '').slice(0, 15);
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const validateForm = () => {
    if (!formData.firstname || !formData.surname || !formData.currentPassword) {
      setError(t('auth.profile.edit.error.fill_required_fields'));
      return false;
    }

    if (!formData.currentPassword) {
      setError(t('auth.profile.edit.error.current_password_required'));
      return false;
    }

    // If redirected from cart, address is required
    if (redirect === 'cart' && (!formData.address || formData.address.trim() === '')) {
      setError(t('auth.profile.edit.error.address_required_for_shipping'));
      return false;
    }

    // Validate phone number if provided
    if (formData.numberPhone && formData.numberPhone.trim() !== '') {
      if (formData.numberPhone.length < 9 || formData.numberPhone.length > 15 || !/^\d{9,15}$/.test(formData.numberPhone)) {
        setError(t('auth.profile.edit.error.phone_invalid'));
        return false;
      }
    }

    // If new password is provided, validate it
    if (formData.newPassword) {
      if (formData.newPassword.length < 6) {
        setError(t('auth.profile.edit.error.new_password_min_length'));
        return false;
      }

      if (formData.newPassword !== formData.confirmNewPassword) {
        setError(t('auth.profile.edit.error.new_passwords_no_match'));
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const updateData = {
        firstname: formData.firstname,
        surname: formData.surname,
        numberPhone: formData.numberPhone || undefined,
        address: formData.address || undefined,
        currentPassword: formData.currentPassword,
        ...(formData.newPassword && { newPassword: formData.newPassword }),
      };

      await updateProfile(updateData);
      
      const successMessage = formData.newPassword 
        ? t('auth.profile.edit.password_changed')
        : t('auth.profile.edit.success');
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      }));

      // Redirect based on redirect parameter or default to profile
      if (redirect === 'cart') {
        // Redirect back to cart with success message
        const params = new URLSearchParams();
        params.set('success', successMessage);
        router.push(`/${locale}/cart?${params.toString()}`);
      } else {
        // Default redirect to profile with success message
        const params = new URLSearchParams();
        params.set('success', successMessage);
        router.push(`/${locale}/profile?${params.toString()}`);
      }
      return; // Exit early to prevent the finally block from running
    } catch (error: any) {
      // Handle specific error cases
      if (error.message.includes('Current password is incorrect') || 
          error.message.includes('password') || 
          error.message.includes('incorrect') || 
          error.message.includes('invalid')) {
        setError(t('auth.profile.edit.error.current_password_incorrect'));
      } else {
        setError(error.message || t('auth.profile.edit.error.update_failed'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <Navigation scrolled={scrolled} />

      {/* Main Content */}
      <div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 pt-24">
        {/* Header with return buttons */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link
              href={`/${locale}/profile`}
              className="inline-flex items-center text-blue-600 hover:text-blue-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('auth.profile.edit.back_to_profile')}
            </Link>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm shadow-2xl shadow-slate-200/50 border border-slate-200/50 rounded-3xl p-8 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full -translate-y-16 translate-x-16 opacity-60"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-100 to-blue-100 rounded-full translate-y-12 -translate-x-12 opacity-60"></div>
          
          <div className="relative">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">{t('auth.profile.edit.title')}</h2>
              <p className="text-slate-600">{t('auth.profile.edit.subtitle')}</p>
              {redirect === 'cart' && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-2xl">
                  <p className="text-blue-800 text-sm font-medium">
                    {t('auth.profile.edit.address_required_for_shipping')}
                  </p>
                </div>
              )}
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

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Fields */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="group">
                  <label 
                    htmlFor="firstname" 
                    className={`block text-sm font-semibold mb-3 transition-colors ${
                      focusedField === 'firstname' ? 'text-slate-900' : 'text-slate-700'
                    }`}
                  >
                    {t('auth.profile.edit.first_name')} *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      id="firstname"
                      name="firstname"
                      required
                      value={formData.firstname}
                      onChange={handleInputChange}
                      onFocus={() => setFocusedField('firstname')}
                      onBlur={() => setFocusedField(null)}
                      className="w-full pl-12 pr-5 py-4 border border-slate-200 rounded-2xl bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200 text-slate-900 placeholder:text-slate-400 hover:border-slate-300"
                    />
                  </div>
                </div>
                
                <div className="group">
                  <label 
                    htmlFor="surname" 
                    className={`block text-sm font-semibold mb-3 transition-colors ${
                      focusedField === 'surname' ? 'text-slate-900' : 'text-slate-700'
                    }`}
                  >
                    {t('auth.profile.edit.last_name')} *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      id="surname"
                      name="surname"
                      required
                      value={formData.surname}
                      onChange={handleInputChange}
                      onFocus={() => setFocusedField('surname')}
                      onBlur={() => setFocusedField(null)}
                      className="w-full pl-12 pr-5 py-4 border border-slate-200 rounded-2xl bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200 text-slate-900 placeholder:text-slate-400 hover:border-slate-300"
                    />
                  </div>
                </div>
              </div>

              {/* Email Field (Read-only) */}
              <div className="group">
                <label className="block text-sm font-semibold mb-3 text-slate-700">
                  {t('auth.profile.edit.email_address')}
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full pl-5 pr-5 py-4 border border-slate-200 rounded-2xl bg-slate-100 text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Phone Field */}
              <div className="group">
                <label 
                  htmlFor="numberPhone" 
                  className={`block text-sm font-semibold mb-3 transition-colors ${
                    focusedField === 'numberPhone' ? 'text-slate-900' : 'text-slate-700'
                  }`}
                >
                  {t('auth.profile.edit.phone')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="tel"
                    id="numberPhone"
                    name="numberPhone"
                    value={formData.numberPhone}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField('numberPhone')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full pl-12 pr-16 py-4 border rounded-2xl bg-white/50 backdrop-blur-sm focus:ring-2 transition-all duration-200 text-slate-900 placeholder:text-slate-400 hover:border-slate-300 ${
                      formData.numberPhone && formData.numberPhone.length > 0
                        ? formData.numberPhone.length >= 9 && formData.numberPhone.length <= 15
                          ? 'border-green-300 focus:ring-green-500/20 focus:border-green-400'
                          : 'border-yellow-300 focus:ring-yellow-500/20 focus:border-yellow-400'
                        : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-400'
                    }`}
                    placeholder="1234567890"
                    maxLength={15}
                  />
                  {/* Character Counter */}
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <span className={`text-xs font-medium ${
                      formData.numberPhone && formData.numberPhone.length > 0
                        ? formData.numberPhone.length >= 9 && formData.numberPhone.length <= 15
                          ? 'text-green-600'
                          : 'text-yellow-600'
                        : 'text-slate-400'
                    }`}>
                      {formData.numberPhone.length}/15
                    </span>
                  </div>
                </div>
                {/* Helpful text */}
                <p className="mt-2 text-xs text-slate-500">
                  {t('auth.profile.edit.phone_help_text')}
                </p>
              </div>

              {/* Address Field */}
              <div className="group">
                <label 
                  htmlFor="address" 
                  className={`block text-sm font-semibold mb-3 transition-colors ${
                    focusedField === 'address' ? 'text-slate-900' : 'text-slate-700'
                  }`}
                >
                  {t('auth.profile.edit.address')} {redirect === 'cart' && '*'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    required={redirect === 'cart'}
                    value={formData.address}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField('address')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full pl-12 pr-5 py-4 border border-slate-200 rounded-2xl bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200 text-slate-900 placeholder:text-slate-400 hover:border-slate-300"
                    placeholder={t('auth.profile.edit.address_placeholder')}
                  />
                </div>
                {/* Helpful text */}
                <p className="mt-2 text-xs text-slate-500">
                  {redirect === 'cart' 
                    ? t('auth.profile.edit.address_required_for_shipping')
                    : t('auth.profile.edit.address_help_text')
                  }
                </p>
              </div>

              {/* Current Password Field */}
              <div className="group">
                <label 
                  htmlFor="currentPassword" 
                  className={`block text-sm font-semibold mb-3 transition-colors ${
                    focusedField === 'currentPassword' ? 'text-slate-900' : 'text-slate-700'
                  }`}
                >
                  {t('auth.profile.edit.current_password')} *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    id="currentPassword"
                    name="currentPassword"
                    required
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField('currentPassword')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full pl-12 pr-12 py-4 border border-slate-200 rounded-2xl bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200 text-slate-900 placeholder:text-slate-400 hover:border-slate-300"
                    placeholder={t('auth.profile.edit.current_password_placeholder')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors" />
                    )}
                  </button>
                </div>
              </div>

              {/* New Password Fields */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="group">
                  <label 
                    htmlFor="newPassword" 
                    className={`block text-sm font-semibold mb-3 transition-colors ${
                      focusedField === 'newPassword' ? 'text-slate-900' : 'text-slate-700'
                    }`}
                  >
                    {t('auth.profile.edit.new_password')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      id="newPassword"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      onFocus={() => setFocusedField('newPassword')}
                      onBlur={() => setFocusedField(null)}
                      className="w-full pl-12 pr-12 py-4 border border-slate-200 rounded-2xl bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200 text-slate-900 placeholder:text-slate-400 hover:border-slate-300"
                      placeholder={t('auth.profile.edit.new_password_placeholder')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors" />
                      ) : (
                        <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="group">
                  <label 
                    htmlFor="confirmNewPassword" 
                    className={`block text-sm font-semibold mb-3 transition-colors ${
                      focusedField === 'confirmNewPassword' ? 'text-slate-900' : 'text-slate-700'
                    }`}
                  >
                    {t('auth.profile.edit.confirm_new_password')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmNewPassword"
                      name="confirmNewPassword"
                      value={formData.confirmNewPassword}
                      onChange={handleInputChange}
                      onFocus={() => setFocusedField('confirmNewPassword')}
                      onBlur={() => setFocusedField(null)}
                      className="w-full pl-12 pr-12 py-4 border border-slate-200 rounded-2xl bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200 text-slate-900 placeholder:text-slate-400 hover:border-slate-300"
                      placeholder={t('auth.profile.edit.confirm_new_password_placeholder')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors" />
                      ) : (
                        <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-200 shadow-lg shadow-green-600/25 hover:shadow-green-700/30 transform hover:translate-y-[-1px] disabled:transform-none disabled:shadow-none"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                      {t('auth.profile.edit.saving')}
                    </div>
                  ) : (
                    t('auth.profile.edit.save_changes')
                  )}
                </button>
                
                <Link
                  href="/profile"
                  className="flex-1 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-200 shadow-lg shadow-slate-600/25 hover:shadow-slate-700/30 transform hover:translate-y-[-1px] text-center"
                >
                  {t('auth.profile.edit.cancel')}
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Footer/>
    </div>
  );
} 