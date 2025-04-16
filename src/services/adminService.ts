import { authService } from './authService';

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
      const token = authService.getToken();

      if (!token) {
        throw new Error('No authentication token available');
      }

      const options: RequestInit = {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      if (body) {
        options.body = JSON.stringify(body);
      }

      console.log(`[Admin API] Making ${method} request to ${endpoint}`, attempt > 0 ? `(retry attempt ${attempt})` : '');
      const response = await fetch(`${API_URL}${endpoint}`, options);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || `Request failed with status ${response.status}`;

        if (response.status === 401) {
          console.error('[Admin API] Authentication error:', errorMessage);
          throw new Error('Authentication error - please sign in again');
        }

        if (response.status === 403) {
          console.error('[Admin API] Authorization error:', errorMessage);
          throw new Error('You do not have permission to access this resource');
        }

        console.error(`[Admin API] Request failed with status ${response.status}:`, errorMessage);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data.data;
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
