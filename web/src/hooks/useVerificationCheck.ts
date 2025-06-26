import { useAuthStore } from '@/stores/authStore';
import { useTranslations } from 'next-intl';
import { toast } from 'react-hot-toast';

export const useVerificationCheck = () => {
  const { user, isAuthenticated, isHydrated } = useAuthStore();
  const t = useTranslations();

  // Check if user is verified
  const isVerified = user?.isEmailVerified || false;

  // Function to check verification and show toast if needed
  const checkVerification = (): boolean => {
    if (!isHydrated) return false;
    
    if (!isAuthenticated) {
      toast.error(t('auth.errors.not_authenticated'));
      return false;
    }

    if (!isVerified) {
      toast.error(t('auth.errors.verification_required'), {
        duration: 4000,
        icon: '⚠️',
      });
      return false;
    }

    return true;
  };

  return {
    isVerified,
    checkVerification,
    isAuthenticated,
    isHydrated,
    user
  };
}; 