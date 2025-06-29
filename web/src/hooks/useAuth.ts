import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useLocale } from 'next-intl';

interface UseAuthOptions {
  requireAuth?: boolean;
  requireVerification?: boolean;
  redirectTo?: string;
}

export function useAuth({
  requireAuth = false,
  requireVerification = false,
  redirectTo
}: UseAuthOptions = {}) {
  const router = useRouter();
  const locale = useLocale();
  const searchParams = useSearchParams();
  const { isAuthenticated, user, isLoading, initializeAuth } = useAuthStore();

  useEffect(() => {
    // Initialize auth state on mount
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    // Wait for auth to be initialized
    if (isLoading) {
      return;
    }

    // Handle authentication requirement
    if (requireAuth && !isAuthenticated) {
      const currentPath = window.location.pathname;
      const loginUrl = `/${locale}/login?redirect=${encodeURIComponent(currentPath)}`;
      router.push(loginUrl);
      return;
    }

    // Handle email verification requirement
    if (requireVerification && isAuthenticated && user && !user.isEmailVerified) {
      const profileUrl = `/${locale}/profile?verification_required=true`;
      router.push(profileUrl);
      return;
    }

    // Handle custom redirect (only if not already on the target page)
    if (redirectTo && isAuthenticated) {
      const currentPath = window.location.pathname;
      if (currentPath !== redirectTo) {
        router.push(redirectTo);
      }
      return;
    }

    // Handle redirect after login (only if not already on the target page)
    const redirectParam = searchParams.get('redirect');
    if (redirectParam && isAuthenticated) {
      const currentPath = window.location.pathname;
      if (currentPath !== redirectParam) {
        router.push(redirectParam);
      }
      return;
    }
  }, [
    isAuthenticated,
    user,
    isLoading,
    requireAuth,
    requireVerification,
    redirectTo,
    router,
    locale,
    searchParams
  ]);

  return {
    isAuthenticated,
    user,
    isLoading
  };
} 