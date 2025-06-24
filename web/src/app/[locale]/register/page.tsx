"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navigation from '../../../components/landing/Navigation';
import Footer from '../../../components/landing/Footer';
import { useAuthStore } from '@/stores/authStore';
import { Eye, EyeOff, User, Lock, Mail, Phone, AlertCircle, CheckCircle2, UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const [scrolled, setScrolled] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstname: '',
    surname: '',
    numberPhone: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const t = useTranslations();
  const router = useRouter();
  const { register, isLoading, isAuthenticated } = useAuthStore();

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
      router.push('/dashboard');
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

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.firstname || !formData.surname) {
      setError('Please fill in all required fields');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
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

    try {
      const registerData = {
        email: formData.email,
        password: formData.password,
        firstname: formData.firstname,
        surname: formData.surname,
        ...(formData.numberPhone && { numberPhone: formData.numberPhone }),
      };

      await register(registerData);
      setSuccess('Account created successfully! Please check your email for verification.');
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push('/verify-email');
      }, 2000);
    } catch (error: any) {
      setError(error.message || 'Registration failed. Please try again.');
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
              <UserPlus className="w-4 h-4 mr-2 text-green-500" />
              Join Jack Pot
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent mb-6 leading-tight">
              Create Account
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-600 mb-8 leading-relaxed max-w-3xl mx-auto">
              Start your plant care journey with Jack Pot and grow your garden with confidence
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="bg-white/80 backdrop-blur-sm shadow-2xl shadow-slate-200/50 border border-slate-200/50 rounded-3xl p-8 md:p-12 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full -translate-y-16 translate-x-16 opacity-60"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-100 to-blue-100 rounded-full translate-y-12 -translate-x-12 opacity-60"></div>
          
          <div className="relative">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Create your account</h2>
              <p className="text-slate-600">
                Already have an account?{' '}
                <Link href="/login" className="text-green-600 hover:text-green-700 font-medium transition-colors">
                  Sign in here
                </Link>
              </p>
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
                    First Name *
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
                      placeholder="John"
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
                    Last Name *
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
                      placeholder="Doe"
                    />
                  </div>
                </div>
              </div>

              {/* Email Field */}
              <div className="group">
                <label 
                  htmlFor="email" 
                  className={`block text-sm font-semibold mb-3 transition-colors ${
                    focusedField === 'email' ? 'text-slate-900' : 'text-slate-700'
                  }`}
                >
                  Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
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
                    placeholder="your.email@example.com"
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
                  Phone Number (Optional)
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
                    className="w-full pl-12 pr-5 py-4 border border-slate-200 rounded-2xl bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200 text-slate-900 placeholder:text-slate-400 hover:border-slate-300"
                    placeholder="+33 6 12 34 56 78"
                  />
                </div>
              </div>

              {/* Password Fields */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="group">
                  <label 
                    htmlFor="password" 
                    className={`block text-sm font-semibold mb-3 transition-colors ${
                      focusedField === 'password' ? 'text-slate-900' : 'text-slate-700'
                    }`}
                  >
                    Password *
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
                      placeholder="Min 6 characters"
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

                <div className="group">
                  <label 
                    htmlFor="confirmPassword" 
                    className={`block text-sm font-semibold mb-3 transition-colors ${
                      focusedField === 'confirmPassword' ? 'text-slate-900' : 'text-slate-700'
                    }`}
                  >
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      required
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      onFocus={() => setFocusedField('confirmPassword')}
                      onBlur={() => setFocusedField(null)}
                      className="w-full pl-12 pr-12 py-4 border border-slate-200 rounded-2xl bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200 text-slate-900 placeholder:text-slate-400 hover:border-slate-300"
                      placeholder="Repeat password"
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-200 shadow-lg shadow-green-600/25 hover:shadow-green-700/30 transform hover:translate-y-[-1px] disabled:transform-none disabled:shadow-none"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                    Creating account...
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            {/* Additional Links */}
            <div className="mt-8 pt-8 border-t border-slate-200/50 text-center">
              <p className="text-slate-600 text-sm">
                By creating an account, you agree to our{' '}
                <Link href="/terms" className="text-green-600 hover:text-green-700 font-medium transition-colors">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-green-600 hover:text-green-700 font-medium transition-colors">
                  Privacy Policy
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