import { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  RegisterResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  User
} from '@/interfaces/auth.interface';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class AuthService {
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];

  private processQueue(error: any, token: string | null = null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    this.failedQueue = [];
  }

  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
    };
  }

  private getAuthHeaders(): HeadersInit {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // Generate a 6-digit verification code
  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Enhanced request method with automatic token refresh
  private async makeAuthenticatedRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    if (!token) {
      throw new Error('No authentication token available');
    }

    // Check if token is about to expire (within 5 minutes)
    if (this.isTokenExpired(token, 5 * 60 * 1000)) {
      if (this.isRefreshing) {
        // Wait for the current refresh to complete
        return new Promise((resolve, reject) => {
          this.failedQueue.push({ resolve, reject });
        }).then(() => this.makeAuthenticatedRequest<T>(url, options));
      }

      this.isRefreshing = true;
      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        try {
          const response = await this.refreshToken(refreshToken);
          this.saveAuthData(response);
          this.processQueue(null, response.access_token);
          this.isRefreshing = false;
        } catch (error) {
          this.processQueue(error, null);
          this.isRefreshing = false;
          this.clearAuthData();
          throw new Error('Authentication expired. Please log in again.');
        }
      } else {
        this.isRefreshing = false;
        this.clearAuthData();
        throw new Error('No refresh token available. Please log in again.');
      }
    }

    // Make the actual request
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    });

    // Handle 401 responses
    if (response.status === 401) {
      if (this.isRefreshing) {
        // Wait for the current refresh to complete
        return new Promise((resolve, reject) => {
          this.failedQueue.push({ resolve, reject });
        }).then(() => this.makeAuthenticatedRequest<T>(url, options));
      }

      this.isRefreshing = true;
      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        try {
          const refreshResponse = await this.refreshToken(refreshToken);
          this.saveAuthData(refreshResponse);
          this.processQueue(null, refreshResponse.access_token);
          this.isRefreshing = false;
          
          // Retry the original request with new token
          return this.makeAuthenticatedRequest<T>(url, options);
        } catch (error) {
          this.processQueue(error, null);
          this.isRefreshing = false;
          this.clearAuthData();
          throw new Error('Authentication expired. Please log in again.');
        }
      } else {
        this.isRefreshing = false;
        this.clearAuthData();
        throw new Error('No refresh token available. Please log in again.');
      }
    }

    return this.handleResponse<T>(response);
  }

  async login(loginData: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/user/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        ...loginData,
        client: 'web'
      }),
    });
    return this.handleResponse<LoginResponse>(response);
  }

  async register(registerData: Omit<RegisterRequest, 'verificationCode'>): Promise<RegisterResponse> {
    const verificationCode = this.generateVerificationCode();
    
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        ...registerData,
        verificationCode,
        client: 'web'
      }),
    });
    return this.handleResponse<RegisterResponse>(response);
  }

  async verifyEmail(verifyData: VerifyEmailRequest): Promise<VerifyEmailResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/verify-email-code`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(verifyData),
    });
    return this.handleResponse<VerifyEmailResponse>(response);
  }

  async resendVerification(email: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email }),
    });
    return this.handleResponse<{ message: string }>(response);
  }

  async forgotPassword(forgotData: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/request-password-reset`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(forgotData),
    });
    return this.handleResponse<ForgotPasswordResponse>(response);
  }

  async resetPassword(resetData: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resetData.token}`,
      },
      body: JSON.stringify({ newPassword: resetData.newPassword }),
    });
    return this.handleResponse<ResetPasswordResponse>(response);
  }

  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ 
        refresh_token: refreshToken,
        client: 'web'
      }),
    });
    return this.handleResponse<LoginResponse>(response);
  }

  async getProfile(): Promise<User> {
    return this.makeAuthenticatedRequest<User>(`${API_BASE_URL}/auth/profile`);
  }

  async updateProfile(user: User, updateData: {
    firstname?: string;
    surname?: string;
    numberPhone?: string;
    address?: string;
    currentPassword: string;
    newPassword?: string;
  }): Promise<User> {
    return this.makeAuthenticatedRequest<User>(`${API_BASE_URL}/auth/profile`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  }

  async refreshUser(user: User): Promise<User> {
    return this.makeAuthenticatedRequest<User>(`${API_BASE_URL}/auth/profile`);
  }

  // Local storage helpers
  saveAuthData(data: LoginResponse): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('refreshToken', data.refresh_token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
  }

  getAuthData(): { token: string | null; refreshToken: string | null; user: User | null } {
    if (typeof window === 'undefined') {
      return { token: null, refreshToken: null, user: null };
    }

    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;

    return { token, refreshToken, user };
  }

  clearAuthData(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  }

  isTokenExpired(token: string, margin: number = 0): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000;
      const now = Date.now();
      return now + margin >= exp;
    } catch {
      return true;
    }
  }
}

export const authService = new AuthService(); 