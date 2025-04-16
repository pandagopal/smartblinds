import { authService } from './authService';

interface VendorInfo {
  businessName: string;
  businessDescription: string;
  website: string;
  isVerified: boolean;
  categories: string[];
  joinDate: string;
}

interface DashboardData {
  productCount: number;
  orderCount: number;
  revenue: number;
  averageRating: number;
  recentProducts: any[];
  recentOrders: any[];
}

interface VendorAnalytics {
  totalSales: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  monthlySales: { month: string; sales: number }[];
  productPerformance: {
    id: string;
    name: string;
    sales: number;
    revenue: number
  }[];
}

const API_URL = '/vendor'; // Updated API_URL to remove '/api'

// Helper function to get the appropriate token - either normal or impersonation
const getToken = (): string => {
  // Check if we're in impersonation mode
  const impersonationToken = localStorage.getItem('impersonationToken');
  if (impersonationToken) {
    return impersonationToken;
  }
  // Otherwise use regular token
  return authService.getToken();
};

// Helper function to get the appropriate authorization header
const getAuthHeader = (): { Authorization: string } => {
  const impersonationToken = localStorage.getItem('impersonationToken');
  if (impersonationToken) {
    return { Authorization: `Impersonate ${impersonationToken}` };
  }
  return { Authorization: `Bearer ${authService.getToken()}` };
};

export const vendorDashboardService = {
  // Get vendor profile information
  getVendorInfo: async (): Promise<VendorInfo> => {
    try {
      const response = await fetch(`${API_URL}/profile`, {
        method: 'GET',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch vendor information');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching vendor information:', error);
      throw error;
    }
  },

  // Get vendor profile
  getProfile: async (): Promise<any> => {
    try {
      const response = await fetch(`${API_URL}/profile`, {
        method: 'GET',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch vendor profile');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching vendor profile:', error);
      throw error;
    }
  },

  // Update vendor profile
  updateProfile: async (profileData: Partial<VendorInfo>): Promise<VendorInfo> => {
    try {
      const response = await fetch(`${API_URL}/profile`, {
        method: 'PUT',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });

      if (!response.ok) {
        throw new Error('Failed to update vendor profile');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error updating vendor profile:', error);
      throw error;
    }
  },

  // Get dashboard overview data
  getDashboardData: async (): Promise<DashboardData> => {
    try {
      const response = await fetch(`${API_URL}/dashboard`, {
        method: 'GET',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  },

  // Get vendor analytics data
  getAnalytics: async (period: string = 'month'): Promise<VendorAnalytics> => {
    try {
      const response = await fetch(`${API_URL}/analytics?period=${period}`, {
        method: 'GET',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      throw error;
    }
  },

  // Check if user is impersonating
  isImpersonating: (): boolean => {
    return localStorage.getItem('impersonationToken') !== null;
  },

  // Get impersonated vendor info
  getImpersonatedVendor: (): any => {
    const vendorData = localStorage.getItem('impersonatedVendor');
    if (vendorData) {
      try {
        return JSON.parse(vendorData);
      } catch (e) {
        return null;
      }
    }
    return null;
  },

  // Stop impersonating and return to admin dashboard
  stopImpersonating: (): void => {
    localStorage.removeItem('impersonationToken');
    localStorage.removeItem('impersonatedVendor');
    // Redirect to admin dashboard
    window.location.href = '/admin';
  },

  // Get vendor products
  getProducts: async (page: number = 1, limit: number = 10, filters: any = {}): Promise<any> => {
    try {
      const response = await fetch(`${API_URL}/products?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch vendor products');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching vendor products:', error);
      throw error;
    }
  },

  // Get vendor orders
  getOrders: async (page: number = 1, limit: number = 10, status: string = ''): Promise<any> => {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      if (status) {
        queryParams.append('status', status);
      }

      const response = await fetch(`${API_URL}/orders?${queryParams}`, {
        method: 'GET',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch vendor orders');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching vendor orders:', error);
      throw error;
    }
  }
};
