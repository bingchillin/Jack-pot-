import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, User, LoginRequest, RegisterRequest } from '@/interfaces/auth.interface';
import { authService } from '@/services/auth.service';

interface AuthStore extends AuthState {
  // Additional state for hydration
  isHydrated: boolean;
  
  // Actions
  login: (loginData: LoginRequest) => Promise<void>;
  register: (registerData: Omit<RegisterRequest, 'verificationCode'>) => Promise<void>;
  updateProfile: (updateData: {
    firstname?: string;
    surname?: string;
    numberPhone?: string;
    currentPassword: string;
    newPassword?: string;
  }) => Promise<void>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
  initializeAuth: () => void;
  setLoading: (loading: boolean) => void;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true, // Start with loading true to prevent flash
      isHydrated: false,

      // Actions
      setLoading: (loading: boolean) => set({ isLoading: loading }),

      setUser: (user: User | null) => set({ user, isAuthenticated: !!user }),

      setToken: (token: string | null) => set({ token }),

      setHydrated: () => set({ isHydrated: true }),

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
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      updateProfile: async (updateData: {
        firstname?: string;
        surname?: string;
        numberPhone?: string;
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

      logout: () => {
        authService.clearAuthData();
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false
        });
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
          // Check if token is expired
          if (authService.isTokenExpired(token)) {
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
      }
    }),
    {
      name: 'auth-storage',
      // Only persist certain fields
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      // Add onRehydrateStorage to handle the hydration properly
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated();
          state.initializeAuth();
        }
      },
    }
  )
); 