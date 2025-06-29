"use client";

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const { initializeAuth, isHydrated } = useAuthStore();

  useEffect(() => {
    // Only initialize auth manually if not already hydrated
    // (Zustand persist will handle hydration automatically)
    if (isHydrated) {
      initializeAuth();
    }
  }, [initializeAuth, isHydrated]);

  return <>{children}</>;
} 