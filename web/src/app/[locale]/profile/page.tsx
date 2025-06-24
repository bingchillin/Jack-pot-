"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import Navigation from '../../../components/landing/Navigation';
import Footer from '../../../components/landing/Footer';
import { useAuthStore } from '@/stores/authStore';
import { User, Mail, Phone, Calendar, Shield, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ProfilePage() {
  const [scrolled, setScrolled] = useState(false);
  const t = useTranslations();
  const router = useRouter();
  const { user, isAuthenticated, isLoading, isHydrated } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Only redirect after hydration is complete and we're not loading
  useEffect(() => {
    if (isHydrated && !isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, isHydrated, router]);

  // Show loading while hydrating or loading auth state
  if (!isHydrated || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-green-600/30 border-t-green-600 rounded-full animate-spin mr-3"></div>
          <span className="text-slate-600">Loading...</span>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated || !user) {
    return null;
  }

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
              Welcome back, {user.firstname}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm shadow-2xl shadow-slate-200/50 border border-slate-200/50 rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full -translate-y-12 translate-x-12 opacity-60"></div>
              
              <div className="relative">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="h-10 w-10 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    {user.firstname} {user.surname}
                  </h2>
                  <div className="flex items-center justify-center space-x-2">
                    {user.isEmailVerified ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-600 font-medium">Verified</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm text-yellow-600 font-medium">Pending Verification</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
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

                  <div className="flex items-center space-x-3 text-slate-600">
                    <Shield className="h-4 w-4" />
                    <span className="text-sm">
                      {user.idRole === 1 ? 'Administrator' : 'Customer'}
                    </span>
                  </div>
                </div>

                {!user.isEmailVerified && (
                  <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl">
                    <p className="text-yellow-700 text-sm text-center">
                      Please check your email to verify your account
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <div className="grid gap-6">
              {/* Quick Actions */}
              <div className="bg-white/80 backdrop-blur-sm shadow-2xl shadow-slate-200/50 border border-slate-200/50 rounded-3xl p-8 relative overflow-hidden">
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-100 to-blue-100 rounded-full translate-y-12 -translate-x-12 opacity-60"></div>
                
                <div className="relative">
                  <h3 className="text-2xl font-bold text-slate-900 mb-6">Quick Actions</h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-200 shadow-lg shadow-green-600/25 hover:shadow-green-700/30 transform hover:translate-y-[-1px]">
                      Browse Products
                    </button>
                    
                    <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-200 shadow-lg shadow-blue-600/25 hover:shadow-blue-700/30 transform hover:translate-y-[-1px]">
                      My Orders
                    </button>
                    
                    <button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-200 shadow-lg shadow-purple-600/25 hover:shadow-purple-700/30 transform hover:translate-y-[-1px]">
                      Plant Care Guide
                    </button>
                    
                    <button className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-200 shadow-lg shadow-orange-600/25 hover:shadow-orange-700/30 transform hover:translate-y-[-1px]">
                      Settings
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white/80 backdrop-blur-sm shadow-2xl shadow-slate-200/50 border border-slate-200/50 rounded-3xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full -translate-y-16 translate-x-16 opacity-60"></div>
                
                <div className="relative">
                  <h3 className="text-2xl font-bold text-slate-900 mb-6">Recent Activity</h3>
                  
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-500">No recent activity to show</p>
                    <p className="text-sm text-slate-400 mt-2">
                      Start browsing products to see your activity here
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer t={t} />
    </div>
  );
} 