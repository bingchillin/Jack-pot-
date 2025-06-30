import { create } from 'zustand';
import { authService } from '@/services/auth.service';
import { AuthState, User, LoginRequest, RegisterRequest } from '@/interfaces/auth.interface';
import { useCartStore } from './cartStore';
import { toast } from 'react-hot-toast';

interface AuthStore extends AuthState {
  // Actions
  login: (loginData: LoginRequest) => Promise<void>;
  register: (registerData: Omit<RegisterRequest, 'verificationCode'>) => Promise<void>;
  updateProfile: (updateData: {
    firstname?: string;
    surname?: string;
    numberPhone?: string;
    address?: string;
    currentPassword: string;
    newPassword?: string;
  }) => Promise<void>;
  refreshUser: () => Promise<void>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
  initializeAuth: () => void;
  setLoading: (loading: boolean) => void;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  // Debug function
  debugAuthState: () => void;
  forceLogout: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  // Initial state
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  setUser: (user: User | null) => set({ user }),

  setToken: (token: string | null) => set({ token }),

  login: async (loginData: LoginRequest) => {
    try {
      set({ isLoading: true });
      const response = await authService.login(loginData);
      
      // Save to localStorage
      authService.saveAuthData(response);
      
      // Update store
      set({
        user: response.user,
        token: response.access_token,
        refreshToken: response.refresh_token,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (registerData: Omit<RegisterRequest, 'verificationCode'>) => {
    try {
      set({ isLoading: true });
      const response = await authService.register(registerData);
      
      // Save to localStorage
      authService.saveAuthData(response);
      
      // Update store
      set({
        user: response.user,
        token: response.access_token,
        refreshToken: response.refresh_token,
        isAuthenticated: true,
        isLoading: false
      });
      
      // Cart is preserved when registering (user might have added items while anonymous)
      // The cart store persists automatically via localStorage
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  updateProfile: async (updateData: {
    firstname?: string;
    surname?: string;
    numberPhone?: string;
    address?: string;
    currentPassword: string;
    newPassword?: string;
  }) => {
    try {
      set({ isLoading: true });
      const updatedUser = await authService.updateProfile(get().user!, updateData);
      
      // Update localStorage with new user data
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      // Update store
      set({
        user: updatedUser,
        isLoading: false
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  refreshUser: async () => {
    try {
      const { user } = get();
      if (!user) {
        throw new Error('No user available');
      }

      set({ isLoading: true });
      const updatedUser = await authService.refreshUser(user);
      
      // Update localStorage with new user data
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      // Update store
      set({
        user: updatedUser,
        isLoading: false
      });
    } catch (error) {
      console.error('🔍 Auth Store - Error refreshing user:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    // Clear cart when logging out for privacy/security
    const cartStore = useCartStore.getState();
    const cartSummary = cartStore.getSummary();
    
    if (cartSummary.totalItems > 0) {
      toast.success('Cart cleared for privacy');
    }
    
    cartStore.clearCart();
    
    // Clear sessionStorage related to orders
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('cart_order');
      sessionStorage.removeItem('checkout_order');
    }
    
    // Clear all auth data from localStorage
    authService.clearAuthData();
    
    // Clear store state
    set({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false
    });
  },

  forceLogout: () => {
    // Clear cart when logging out for privacy/security
    const cartStore = useCartStore.getState();
    const cartSummary = cartStore.getSummary();
    
    if (cartSummary.totalItems > 0) {
      toast.success('Cart cleared for privacy');
    }
    
    cartStore.clearCart();
    
    // Clear ALL possible storage locations
    if (typeof window !== 'undefined') {
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      // Clear sessionStorage
      sessionStorage.removeItem('cart_order');
      sessionStorage.removeItem('checkout_order');
      
      // Clear any Zustand persist data
      localStorage.removeItem('auth-storage');
      localStorage.removeItem('cart-storage');
      
      // Clear any other potential auth-related storage
      localStorage.removeItem('auth');
      localStorage.removeItem('user-data');
    }
    
    // Clear store state
    set({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false
    });
    
    console.log('🔍 Force logout completed - all storage cleared');
  },

  refreshAuth: async () => {
    try {
      const { refreshToken } = get();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      set({ isLoading: true });
      const response = await authService.refreshToken(refreshToken);
      
      // Save to localStorage
      authService.saveAuthData(response);
      
      // Update store
      set({
        user: response.user,
        token: response.access_token,
        refreshToken: response.refresh_token,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (error) {
      // If refresh fails, logout user
      get().logout();
      throw error;
    }
  },

  initializeAuth: () => {
    set({ isLoading: true });
    
    const { token, refreshToken, user } = authService.getAuthData();
    
    if (token && user) {
      // Check if token is expired (with 5 minute margin for proactive refresh)
      if (authService.isTokenExpired(token, 5 * 60 * 1000)) {
        if (refreshToken) {
          // Try to refresh token
          get().refreshAuth().catch(() => {
            get().logout();
          });
        } else {
          get().logout();
        }
      } else {
        // Token is valid, set user as authenticated
        set({
          user,
          token,
          refreshToken,
          isAuthenticated: true,
          isLoading: false
        });
        
        // Set up automatic token refresh if token expires within 10 minutes
        if (authService.isTokenExpired(token, 10 * 60 * 1000)) {
          setTimeout(() => {
            const currentState = get();
            if (currentState.isAuthenticated && currentState.refreshToken) {
              get().refreshAuth().catch(() => {
                get().logout();
              });
            }
          }, 5 * 60 * 1000); // Refresh 5 minutes before expiry
        }
      }
    } else {
      // No valid auth data, ensure user is logged out
      set({
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false
      });
    }

    // Listen for storage changes (when localStorage is cleared externally)
    if (typeof window !== 'undefined') {
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'token' || e.key === 'refreshToken' || e.key === 'user') {
          // If any auth data was removed, logout
          if (e.newValue === null) {
            console.log('Auth data cleared externally, logging out');
            get().logout();
          }
        }
      };

      window.addEventListener('storage', handleStorageChange);
      
      // Also listen for localStorage.clear() calls
      const originalClear = localStorage.clear;
      localStorage.clear = function() {
        originalClear.call(this);
        console.log('localStorage cleared, logging out');
        get().logout();
      };
    }
  },

  // Debug function to check auth state
  debugAuthState: () => {
    const state = get();
    const localStorageData = authService.getAuthData();
    
    console.log('🔍 Auth Store State:', {
      store: {
        user: state.user,
        token: state.token ? 'EXISTS' : 'NULL',
        refreshToken: state.refreshToken ? 'EXISTS' : 'NULL',
        isAuthenticated: state.isAuthenticated,
        isLoading: state.isLoading
      },
      localStorage: {
        user: localStorageData.user,
        token: localStorageData.token ? 'EXISTS' : 'NULL',
        refreshToken: localStorageData.refreshToken ? 'EXISTS' : 'NULL'
      }
    });
  }
})); 