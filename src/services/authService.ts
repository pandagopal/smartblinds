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

// Custom event for auth state changes
export const dispatchAuthEvent = (type: 'login' | 'logout') => {
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
    return (
      user && (user.role === UserRole.ADMIN || user.is_admin === true || user.is_admin === 't' || user.is_admin === 'true' || user.is_admin === 1 || user.is_admin === '1')
    );
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

  // Login user
  login(token: string, userData: UserData): void {
    console.log('[AuthService] login() called');
    console.log('[AuthService] Storing token and user data');
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));

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

      // Dispatch custom event for logout
      dispatchAuthEvent('logout');
    }
  }
}

export const authService = new AuthService();
