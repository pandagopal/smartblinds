import { authService } from './authService';
import { handleSessionExpired } from '../utils/authUtils';

interface Vendor {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
  is_active: boolean;
  is_listing_active: boolean;
  vendor_info: {
    businessName: string;
    businessDescription: string;
    website: string;
    isVerified: boolean;
    categories: string[];
    joinDate: string;
  };
}

interface VendorDetails extends Vendor {
  phone: string;
  profileImage: string;
  stats: {
    productCount: number;
    orderCount: number;
    totalRevenue: number;
  };
}

interface DashboardData {
  userCounts: {
    total_users: number;
    customers: number;
    vendors: number;
    admins: number;
  };
  vendorStatus: {
    active_vendors: number;
    inactive_vendors: number;
    verified_vendors: number;
    unverified_vendors: number;
    listed_vendors: number;
    unlisted_vendors: number;
  };
  recentVendors: Vendor[];
  orderStats: {
    total_orders: number;
    total_revenue: number;
    pending_orders: number;
    processing_orders: number;
    completed_orders: number;
    cancelled_orders: number;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  orderDate: Date;
  customer: {
    name: string;
    email: string;
  };
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  items: {
    id: string;
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  status: string;
  paymentStatus: string;
  shippingMethod: string;
  trackingNumber?: string;
  notes?: string;
}

const API_URL = '/admin';

// Helper function for API requests with enhanced error handling
const apiRequest = async <T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any,
  retries: number = 1
): Promise<T> => {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      let currentToken = authService.getToken();

      // Enhanced token debugging
      if (currentToken) {
        try {
          // Check if we can decode the token
          const tokenPayload = JSON.parse(atob(currentToken.split('.')[1]));
          const expTime = new Date(tokenPayload.exp * 1000);
          const now = new Date();
          const timeLeft = expTime.getTime() - now.getTime();

          console.log(`[Admin API] Token expires at ${expTime.toLocaleString()}, ${Math.round(timeLeft / 1000 / 60)} minutes remaining`);

          // If token is about to expire in less than 5 minutes, try to refresh it
          if (timeLeft < 5 * 60 * 1000 && timeLeft > 0) {
            console.log('[Admin API] Token about to expire, attempting to refresh');
            const refreshed = await authService.refreshToken();
            if (refreshed) {
              console.log('[Admin API] Token refreshed successfully');
              // Get the new token
              const newToken = authService.getToken();
              if (newToken) currentToken = newToken;
            }
          }
        } catch (error) {
          console.error('[Admin API] Error parsing token:', error);
        }
      }

      if (!currentToken) {
        throw new Error('No authentication token available');
      }

      const options: RequestInit = {
        method,
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json'
        }
      };

      if (method !== 'GET' && body) {
        options.body = JSON.stringify(body);
      }

      console.log(`[Admin API] Making ${method} request to ${endpoint}`, attempt > 0 ? `(retry attempt ${attempt})` : '');
      const response = await fetch(`${API_URL}${endpoint}`, options);

      // Check content type to detect HTML responses instead of JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        console.error('[Admin API] Received HTML response instead of JSON - likely session expired');

        // Try to refresh the token and retry immediately
        if (attempt === 0) {
          console.log('[Admin API] Attempting token refresh and retry');
          const refreshed = await authService.refreshToken();
          if (refreshed) {
            console.log('[Admin API] Token refreshed successfully, retrying request');
            continue; // Skip to next loop iteration to retry with new token
          }
        }

        // If we get here, the token refresh failed or this is a retry attempt
        if (window.confirm('Your session has expired. Would you like to sign in again?')) {
          handleSessionExpired();
        }

        // Throw error to be caught by caller
        throw new Error('Your session has expired. Please sign in again.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || `Request failed with status ${response.status}`;

        if (response.status === 401) {
          console.error('[Admin API] Authentication error:', errorMessage);

          // Check if we should try to refresh the token
          if (attempt === 0) {
            const refreshed = await authService.refreshToken();
            if (refreshed) {
              console.log('[Admin API] Token refreshed after 401, retrying request');
              continue; // Skip to next loop iteration to retry with new token
            }
          }

          // If we get here, token refresh failed or this is a retry attempt
          if (window.confirm('Authentication error. Would you like to sign in again?')) {
            handleSessionExpired();
          }

          // Don't automatically logout - just report the error
          throw new Error('Authentication error - please sign in again');
        }

        if (response.status === 403) {
          console.error('[Admin API] Authorization error:', errorMessage);
          throw new Error('You do not have permission to access this resource');
        }

        console.error(`[Admin API] Request failed with status ${response.status}:`, errorMessage);
        throw new Error(errorMessage);
      }

      // Safely parse JSON response
      try {
        const data = await response.json();
        return data.data;
      } catch (jsonError) {
        console.error('[Admin API] Failed to parse JSON response:', jsonError);
        throw new Error('Invalid response format from server');
      }
    } catch (error: any) {
      lastError = error;

      if (attempt < retries) {
        // Wait before retrying (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
        console.log(`[Admin API] Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // If we've exhausted all retries, throw the last error
  throw lastError || new Error('API request failed');
};

export const adminService = {
  // Get admin dashboard data
  getDashboard: async (): Promise<DashboardData> => {
    try {
      return await apiRequest<DashboardData>('/dashboard');
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  },

  // Get all vendors with optional filters
  getVendors: async (
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string,
    verified?: string,
    listingStatus?: string
  ): Promise<{ vendors: Vendor[], pagination: any }> => {
    try {
      // Build query params
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      if (search) params.append('search', search);
      if (status) params.append('status', status);
      if (verified) params.append('verified', verified);
      if (listingStatus) params.append('listingStatus', listingStatus);

      return await apiRequest<{ vendors: Vendor[], pagination: any }>(`/vendors?${params}`);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      throw error;
    }
  },

  // Get vendor details
  getVendorDetails: async (vendorId: number): Promise<VendorDetails> => {
    try {
      return await apiRequest<VendorDetails>(`/vendors/${vendorId}`);
    } catch (error) {
      console.error('Error fetching vendor details:', error);
      throw error;
    }
  },

  // Get orders for admin with optional filters
  getOrders: async (
    page: number = 1,
    limit: number = 10,
    status?: string,
    startDate?: string,
    endDate?: string,
    search?: string
  ): Promise<{ orders: Order[], pagination: any }> => {
    try {
      // Build query params
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      if (status) params.append('status', status);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (search) params.append('search', search);

      return await apiRequest<{ orders: Order[], pagination: any }>(`/orders?${params}`);
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  // Update vendor status (active/inactive)
  updateVendorStatus: async (vendorId: number, isActive: boolean): Promise<any> => {
    try {
      return await apiRequest<any>(
        `/vendors/${vendorId}/status`,
        'PUT',
        { isActive }
      );
    } catch (error) {
      console.error('Error updating vendor status:', error);
      throw error;
    }
  },

  // Update vendor listing status (products visible/hidden on front-end)
  updateVendorListingStatus: async (vendorId: number, isListingActive: boolean): Promise<any> => {
    try {
      return await apiRequest<any>(
        `/vendors/${vendorId}/listing-status`,
        'PUT',
        { isListingActive }
      );
    } catch (error) {
      console.error('Error updating vendor listing status:', error);
      throw error;
    }
  },

  // Update vendor verification
  updateVendorVerification: async (vendorId: number, isVerified: boolean): Promise<any> => {
    try {
      return await apiRequest<any>(
        `/vendors/${vendorId}/verify`,
        'PUT',
        { isVerified }
      );
    } catch (error) {
      console.error('Error updating vendor verification:', error);
      throw error;
    }
  },

  // Impersonate vendor
  impersonateVendor: async (vendorId: number): Promise<any> => {
    try {
      return await apiRequest<any>(
        `/vendors/${vendorId}/impersonate`,
        'POST'
      );
    } catch (error) {
      console.error('Error impersonating vendor:', error);
      throw error;
    }
  }
};
