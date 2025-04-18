// Authentication service to handle login, logout and auth state
import { jwtDecode } from "jwt-decode";

// User data interface
export interface UserData {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profileImage?: string | null;
  emailVerified?: boolean;
  linkedProviders?: string[];
  // Vendor-specific info
  vendorInfo?: {
    businessName: string;
    businessDescription: string;
    isVerified: boolean;
    pendingApproval: boolean;
  };
  // Employee-specific info (for sales persons and installers)
  employeeInfo?: {
    employeeId: string;
    department: string;
    position: string;
    hireDate: string;
    territory?: string; // For sales persons
    serviceArea?: string; // For installers
    certifications?: string[]; // For installers
    performanceMetrics?: {
      monthlySales?: number; // For sales persons
      installationRating?: number; // For installers
      customerSatisfaction?: number;
    };
  };
}

// User roles enum
export enum UserRole {
  CUSTOMER = 'customer',
  VENDOR = 'vendor',
  ADMIN = 'admin',
  SALES_PERSON = 'sales_person',
  INSTALLER = 'installer'
}

// Auth state interface
export interface AuthState {
  isAuthenticated: boolean;
  user: UserData | null;
  loading: boolean;
  error: string | null;
}

// Social Authentication Provider
export type SocialProvider = 'google' | 'facebook' | 'apple';

// Local storage keys
const TOKEN_KEY = 'smartblinds_auth_token';
const USER_KEY = 'smartblinds_user';
const REFRESH_TOKEN_KEY = 'smartblinds_refresh_token';
const TOKEN_EXPIRY_KEY = 'smartblinds_token_expiry';
const AUTO_REFRESH_KEY = 'smartblinds_auto_refresh';

// Custom event for auth state changes
export const dispatchAuthEvent = (type: 'login' | 'logout' | 'refresh') => {
  window.dispatchEvent(new CustomEvent('auth-state-change', { detail: { type } }));
};

// API URL
const API_URL = '/api';

// Token refresh timer
let refreshTimer: ReturnType<typeof setTimeout> | null = null;

class AuthService {
  /**
   * Force clear tokens and redirect to login
   * This can be used as a manual recovery when sessions expire
   */
  forceRenewSession(): void {
    // Clear any token refresh timer
    if (refreshTimer) {
      clearTimeout(refreshTimer);
      refreshTimer = null;
    }

    // Clear all auth tokens
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);

    // Dispatch logout event
    dispatchAuthEvent('logout');

    // Redirect to login page
    window.location.href = '/signin?expired=true';
  }

  /**
   * Get the current authenticated user
   */
  getCurrentUser(): UserData | null {
    try {
      const userStr = localStorage.getItem(USER_KEY);
      if (!userStr) return null;
      return JSON.parse(userStr) as UserData;
    } catch (error) {
      console.error('[AuthService] Error parsing user data:', error);
      this.logout(); // Clear potentially corrupted data
      return null;
    }
  }

  /**
   * Get authentication token
   */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      // Check token expiration
      const decodedToken: any = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      // If token is expired but we have a refresh token, attempt refresh
      if (decodedToken.exp < currentTime) {
        const hasRefreshToken = !!this.getRefreshToken();
        if (hasRefreshToken) {
          console.log('[AuthService] Token expired, has refresh token');
          this.refreshToken().catch(() => {
            console.error('[AuthService] Auto-refresh failed, logging out');
            this.logout();
          });
          // Return true optimistically - we'll handle the refresh result later
          return true;
        }
        console.log('[AuthService] Token expired, no refresh token');
        this.logout();
        return false;
      }

      return true;
    } catch (error) {
      console.error('[AuthService] Error validating token:', error);
      return false;
    }
  }

  /**
   * Check if current user has a specific role
   */
  hasRole(role: UserRole): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    // Special case for checking admin role with multiple possible values
    if (role === UserRole.ADMIN && this.isAdmin()) {
      return true;
    }

    return user.role === role;
  }

  /**
   * Check if current user is an admin
   */
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    // Admin can be indicated by role or a specific flag
    return user.role === UserRole.ADMIN;
  }

  /**
   * Check if current user is a vendor
   */
  isVendor(): boolean {
    return this.hasRole(UserRole.VENDOR);
  }

  /**
   * Check if current user is a customer
   */
  isCustomer(): boolean {
    return this.hasRole(UserRole.CUSTOMER);
  }

  /**
   * Check if current user is a sales person
   */
  isSalesPerson(): boolean {
    return this.hasRole(UserRole.SALES_PERSON);
  }

  /**
   * Check if current user is an installer
   */
  isInstaller(): boolean {
    return this.hasRole(UserRole.INSTALLER);
  }

  /**
   * Get appropriate dashboard URL for current user
   */
  getDashboardUrl(): string {
    const user = this.getCurrentUser();
    if (!user) return '/signin';

    if (this.isAdmin()) return '/admin';
    if (this.isVendor()) return '/vendor';
    if (this.isSalesPerson()) return '/sales';
    if (this.isInstaller()) return '/installer';

    // Default to customer account page
    return '/account';
  }

  /**
   * Setup auto token refresh
   */
  setupTokenRefresh(): void {
    // Clear any existing refresh timers
    if (refreshTimer) {
      clearTimeout(refreshTimer);
      refreshTimer = null;
    }

    const token = this.getToken();
    if (!token) return;

    try {
      // Get token expiration
      const decodedToken: any = jwtDecode(token);
      const expiresAt = decodedToken.exp * 1000; // Convert to milliseconds
      const now = Date.now();

      // If token is already expired, try to refresh now
      if (expiresAt <= now) {
        this.refreshToken();
        return;
      }

      // Set refresh to occur 5 minutes before expiration
      const timeToRefresh = expiresAt - now - (5 * 60 * 1000);

      // Don't set a refresh if it would be negative
      if (timeToRefresh <= 0) {
        this.refreshToken();
        return;
      }

      console.log(`[AuthService] Setting token refresh in ${Math.round(timeToRefresh / 1000 / 60)} minutes`);

      refreshTimer = setTimeout(() => {
        console.log('[AuthService] Executing auto token refresh');
        this.refreshToken();
      }, timeToRefresh);
    } catch (error) {
      console.error('[AuthService] Error setting up token refresh:', error);
    }
  }

  /**
   * Attempt to refresh the authentication token
   */
  async refreshToken(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return false;

    try {
      console.log('[AuthService] Refreshing token...');
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      if (data.token) {
        localStorage.setItem(TOKEN_KEY, data.token);
        if (data.refreshToken) {
          localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
        }

        // Update user data if provided
        if (data.user) {
          localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        }

        // Set up the next auto-refresh
        this.setupTokenRefresh();

        dispatchAuthEvent('refresh');
        return true;
      }

      return false;
    } catch (error) {
      console.error('[AuthService] Token refresh error:', error);
      return false;
    }
  }

  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<UserData> {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      this.setAuthData(data.token, data.user, data.refreshToken);
      return data.user;
    } catch (error) {
      console.error('[AuthService] Login error:', error);
      throw error;
    }
  }

  /**
   * Register a new user
   */
  async register(userData: {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
  }): Promise<UserData> {
    try {
      // Set default role to customer if not specified
      const userDataWithRole = {
        ...userData,
        role: userData.role || UserRole.CUSTOMER,
      };

      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userDataWithRole),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      this.setAuthData(data.token, data.user, data.refreshToken);
      return data.user;
    } catch (error) {
      console.error('[AuthService] Registration error:', error);
      throw error;
    }
  }

  /**
   * Social login (Google, Facebook, Apple)
   */
  async socialLogin(provider: SocialProvider, token: string, authorizationCode?: string): Promise<UserData> {
    try {
      const response = await fetch(`${API_URL}/auth/social/${provider}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, authorizationCode }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `${provider} login failed`);
      }

      this.setAuthData(data.token, data.user, data.refreshToken);
      return data.user;
    } catch (error) {
      console.error(`[AuthService] ${provider} login error:`, error);
      throw error;
    }
  }

  /**
   * Link social account to existing user
   */
  async linkSocialAccount(provider: SocialProvider, token: string, authorizationCode?: string): Promise<string[]> {
    try {
      const authToken = this.getToken();
      if (!authToken) {
        throw new Error('Must be logged in to link accounts');
      }

      const response = await fetch(`${API_URL}/auth/link/${provider}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, authorizationCode }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `Failed to link ${provider} account`);
      }

      // Update user data with new linked providers
      const user = this.getCurrentUser();
      if (user) {
        user.linkedProviders = data.linkedProviders;
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      }

      return data.linkedProviders || [];
    } catch (error) {
      console.error(`[AuthService] Link ${provider} account error:`, error);
      throw error;
    }
  }

  /**
   * Unlink social account from user
   */
  async unlinkSocialAccount(provider: SocialProvider): Promise<string[]> {
    try {
      const authToken = this.getToken();
      if (!authToken) {
        throw new Error('Must be logged in to unlink accounts');
      }

      const response = await fetch(`${API_URL}/auth/link/${provider}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `Failed to unlink ${provider} account`);
      }

      // Update user data with new linked providers
      const user = this.getCurrentUser();
      if (user) {
        user.linkedProviders = data.linkedProviders;
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      }

      return data.linkedProviders || [];
    } catch (error) {
      console.error(`[AuthService] Unlink ${provider} account error:`, error);
      throw error;
    }
  }

  /**
   * Set authentication data in localStorage
   */
  setAuthData(token: string, user: UserData, refreshToken?: string): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }

    // Setup token auto-refresh
    this.setupTokenRefresh();

    dispatchAuthEvent('login');
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    const token = this.getToken();

    // Clear any token refresh timer
    if (refreshTimer) {
      clearTimeout(refreshTimer);
      refreshTimer = null;
    }

    try {
      // Attempt to invalidate token on server
      if (token) {
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }).catch(() => {
          // Ignore server errors during logout
        });
      }
    } finally {
      // Always clear local storage
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(TOKEN_EXPIRY_KEY);
      dispatchAuthEvent('logout');
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/auth/forgotpassword`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      return response.ok;
    } catch (error) {
      console.error('[AuthService] Password reset request error:', error);
      return false;
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/auth/resetpassword/${token}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: newPassword }),
      });

      if (response.ok) {
        const data = await response.json();

        // If the response includes a new token, set it
        if (data.token) {
          this.setAuthData(data.token, data.user, data.refreshToken);
        }

        return true;
      }

      return false;
    } catch (error) {
      console.error('[AuthService] Password reset error:', error);
      return false;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(profileData: {
    name?: string;
    email?: string;
    phone?: string;
  }): Promise<UserData> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_URL}/auth/updateprofile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Profile update failed');
      }

      // Update stored user data
      const currentUser = this.getCurrentUser();
      if (currentUser) {
        const updatedUser = {
          ...currentUser,
          ...data.data
        };
        localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      }

      return data.data;
    } catch (error) {
      console.error('[AuthService] Update profile error:', error);
      throw error;
    }
  }

  /**
   * Change password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_URL}/auth/changepassword`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      return response.ok;
    } catch (error) {
      console.error('[AuthService] Change password error:', error);
      return false;
    }
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/auth/verify/${token}`, {
        method: 'GET',
      });

      if (response.ok) {
        // Update user's verified status if logged in
        const currentUser = this.getCurrentUser();
        if (currentUser) {
          currentUser.emailVerified = true;
          localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
        }
        return true;
      }

      return false;
    } catch (error) {
      console.error('[AuthService] Email verification error:', error);
      return false;
    }
  }
}

export const authService = new AuthService();
