/**
 * IMPORTANT: This file is for DEVELOPMENT AND TESTING PURPOSES ONLY.
 * It contains mock data and utilities that should never be used in production.
 *
 * This file allows developers to test different user roles without needing
 * to set up actual user accounts in a database.
 *
 * In production, authentication should be handled by a proper backend service.
 */

import { authService, UserRole } from '../services/authService';

/**
 * Set of utility functions to help with testing different user roles
 * FOR DEVELOPMENT/TESTING PURPOSES ONLY
 */

// Mock user template
const mockUserTemplate = {
  id: 'testuser123',
  name: 'Test User',
  email: 'test@example.com',
  profileImage: null,
};

/**
 * Simulates login as a user with the specified role
 * FOR TESTING PURPOSES ONLY - not for production use
 */
export const loginAsRole = (role: UserRole) => {
  // Create a mock user with the specified role
  const mockUser = {
    ...mockUserTemplate,
    role,
  };

  // If role is vendor, add vendor info
  if (role === UserRole.VENDOR) {
    mockUser.vendorInfo = {
      businessName: 'Test Business',
      businessDescription: 'A test business for development',
      isVerified: true,
      pendingApproval: false,
    };
  }

  // Mock login with a fake token
  const fakeToken = `fake_token_${role}_${Date.now()}`;
  authService.login(fakeToken, mockUser);

  console.log(`[DEV] Logged in as ${role} role for testing`);
  return mockUser;
};

/**
 * Utility function to log in as admin
 * FOR TESTING PURPOSES ONLY
 */
export const loginAsAdmin = () => {
  return loginAsRole(UserRole.ADMIN);
};

/**
 * Utility function to log in as vendor
 * FOR TESTING PURPOSES ONLY
 */
export const loginAsVendor = () => {
  return loginAsRole(UserRole.VENDOR);
};

/**
 * Utility function to log in as customer
 * FOR TESTING PURPOSES ONLY
 */
export const loginAsCustomer = () => {
  return loginAsRole(UserRole.CUSTOMER);
};

/**
 * Logs out the current user
 */
export const logout = () => {
  authService.logout();
  console.log('[DEV] Logged out');
};

/**
 * Gets the current user role or null if not logged in
 */
export const getCurrentRole = (): UserRole | null => {
  const user = authService.getCurrentUser();
  return user?.role || null;
};

// Export a simple dev panel that can be triggered in the console
export const showRoleTestingPanel = () => {
  console.log('=== ROLE TESTING PANEL ===');
  console.log('Use these functions to test different roles:');
  console.log('window.loginAsAdmin() - Login as Admin');
  console.log('window.loginAsVendor() - Login as Vendor');
  console.log('window.loginAsCustomer() - Login as Customer');
  console.log('window.logout() - Logout');
  console.log('window.getCurrentRole() - Get current role');
  console.log('========================');
};

// Expose functions to window for easy console access
declare global {
  interface Window {
    loginAsAdmin: () => void;
    loginAsVendor: () => void;
    loginAsCustomer: () => void;
    logout: () => void;
    getCurrentRole: () => UserRole | null;
    showRoleTestingPanel: () => void;
  }
}

// Add to window for developer access
if (typeof window !== 'undefined') {
  window.loginAsAdmin = loginAsAdmin;
  window.loginAsVendor = loginAsVendor;
  window.loginAsCustomer = loginAsCustomer;
  window.logout = logout;
  window.getCurrentRole = getCurrentRole;
  window.showRoleTestingPanel = showRoleTestingPanel;
}
