// Authentication service to handle login, logout and auth state
interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  is_admin?: boolean | string | number; // Added is_admin field for compatibility
  profileImage?: string | null;
  vendorInfo?: {
    businessName: string;
    businessDescription: string;
    isVerified: boolean;
    pendingApproval: boolean;
  };
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

// Enum for allowed roles
export enum UserRole {
  CUSTOMER = 'customer',
  VENDOR = 'vendor',
  ADMIN = 'admin',
  SALES_PERSON = 'sales_person',
  INSTALLER = 'installer'
}

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'current_user';
const TOKEN_EXPIRY_KEY = 'token_expiry';

// Custom event for auth state changes
export const dispatchAuthEvent = (type: 'login' | 'logout' | 'refresh') => {
  window.dispatchEvent(new CustomEvent('auth-state-change', { detail: { type } }));
};

class AuthService {
  // Get current user from localStorage
  getCurrentUser(): UserData | null {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr) as UserData;
    } catch (e) {
      console.error('Error parsing user data:', e);
      return null;
    }
  }

  // Check if user is logged in
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Get auth token
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  // Check if current user has a specific role
  hasRole(role: UserRole): boolean {
    const user = this.getCurrentUser();
    return !!user && user.role === role;
  }

  // Check if current user is an admin
  isAdmin(): boolean {
    const user = this.getCurrentUser();

    if (!user) {
      console.log('[Auth] isAdmin check failed: No user data found');
      return false;
    }

    // Log the user data for debugging
    console.log('[Auth] isAdmin check - User data:', JSON.stringify(user, null, 2));

    // Handle various ways an admin flag could be represented
    const isUserAdmin = !!(
      user.role === UserRole.ADMIN ||
      user.role === 'admin' ||
      user.is_admin === true ||
      user.is_admin === 't' ||
      user.is_admin === 'true' ||
      user.is_admin === 1 ||
      user.is_admin === '1'
    );

    console.log(`[Auth] isAdmin check result: ${isUserAdmin}`);
    return isUserAdmin;
  }

  // Check if current user is a vendor
  isVendor(): boolean {
    return this.hasRole(UserRole.VENDOR);
  }

  // Check if current user is a customer
  isCustomer(): boolean {
    return this.hasRole(UserRole.CUSTOMER);
  }

  // Check if current user is a sales person
  isSalesPerson(): boolean {
    return this.hasRole(UserRole.SALES_PERSON);
  }

  // Check if current user is an installer
  isInstaller(): boolean {
    return this.hasRole(UserRole.INSTALLER);
  }

  // Set token expiry time - default to 30 minutes from now
  setTokenExpiry(expiryMinutes: number = 30): void {
    const expiryTime = Date.now() + expiryMinutes * 60 * 1000;
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
  }

  // Check if token is about to expire (within 5 minutes)
  isTokenExpiringSoon(): boolean {
    const expiryTimeStr = localStorage.getItem(TOKEN_EXPIRY_KEY);
    if (!expiryTimeStr) return false;

    const expiryTime = parseInt(expiryTimeStr, 10);
    const fiveMinutes = 5 * 60 * 1000;

    return Date.now() + fiveMinutes >= expiryTime;
  }

  // Refresh token if it's about to expire
  async refreshTokenIfNeeded(): Promise<boolean> {
    if (!this.isAuthenticated() || !this.isTokenExpiringSoon()) {
      return false;
    }

    try {
      console.log('[AuthService] Refreshing token...');
      const response = await fetch('/auth/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const { token } = await response.json();
        if (token) {
          localStorage.setItem(TOKEN_KEY, token);
          this.setTokenExpiry(); // Reset expiry time
          dispatchAuthEvent('refresh');
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('[AuthService] Token refresh failed:', error);
      return false;
    }
  }

  // Login user
  login(token: string, userData: UserData): void {
    console.log('[AuthService] login() called');
    console.log('[AuthService] Storing token and user data');
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    this.setTokenExpiry(); // Set token expiry time

    // Dispatch custom event for login
    console.log('[AuthService] Dispatching login event');
    dispatchAuthEvent('login');
    console.log('[AuthService] login() completed');
  }

  // Logout user
  logout = async (): Promise<void> => {
    try {
      // Call the logout API endpoint
      await fetch('/auth/logout', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getToken()}`
        }
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Remove auth data from localStorage regardless of API success
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(TOKEN_EXPIRY_KEY);

      // Dispatch custom event for logout
      dispatchAuthEvent('logout');
    }
  }
}

export const authService = new AuthService();
