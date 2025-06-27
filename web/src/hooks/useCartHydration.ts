import { useState, useEffect } from 'react';
import { useCartStore } from '@/stores/cartStore';

export const useCartHydration = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const items = useCartStore((state) => state.items);

  useEffect(() => {
    // Small delay to ensure Zustand persistence is loaded
    const timer = setTimeout(() => {
      setIsHydrated(true);
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Also check if items are loaded
  useEffect(() => {
    if (items !== undefined) {
      setIsHydrated(true);
      setIsLoading(false);
    }
  }, [items]);

  return { isHydrated, isLoading };
}; 