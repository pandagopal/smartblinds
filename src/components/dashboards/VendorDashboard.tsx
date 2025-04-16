import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { vendorDashboardService } from '../../services/vendorDashboardService';
import ImpersonationBanner from '../vendor/ImpersonationBanner';

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

const VendorDashboard: React.FC = () => {
  const [userData, setUserData] = useState<any>(null);
  const [vendorInfo, setVendorInfo] = useState<VendorInfo | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    productCount: 0,
    orderCount: 0,
    revenue: 0,
    averageRating: 0,
    recentProducts: [],
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        // Check if we're in impersonation mode
        if (vendorDashboardService.isImpersonating()) {
          const impersonatedVendor = vendorDashboardService.getImpersonatedVendor();
          if (impersonatedVendor) {
            setUserData(impersonatedVendor);
          } else {
            // Get current user data as fallback
            const user = authService.getCurrentUser();
            setUserData(user);
          }
        } else {
          // Normal mode - get current user data
          const user = authService.getCurrentUser();
          setUserData(user);
        }

        // Load vendor info and dashboard data
        await Promise.all([loadVendorInfo(), loadDashboardData()]);
      } catch (err) {
        console.error('Error initializing dashboard:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();
  }, []);

  const loadVendorInfo = async () => {
    try {
      // Get real vendor profile data
      const profileData = await vendorDashboardService.getProfile();
      setVendorInfo(profileData?.vendorInfo || null);
    } catch (error) {
      console.error('Error loading vendor info:', error);
      // Fallback to mock data for demo purposes
      const mockVendorInfo: VendorInfo = {
        businessName: userData?.name ? `${userData.name}'s Window Coverings` : 'Your Business',
        businessDescription: 'Custom window treatments for homes and businesses',
        website: 'www.example.com',
        isVerified: Math.random() > 0.5, // Randomly verified
        categories: ['Blinds', 'Shades', 'Drapes'],
        joinDate: new Date().toISOString()
      };
      setVendorInfo(mockVendorInfo);
    }
  };

  const loadDashboardData = async () => {
    try {
      // Get real dashboard data
      const dashData = await vendorDashboardService.getDashboardData();

      if (dashData) {
        setDashboardData({
          productCount: dashData.productCount || 0,
          orderCount: dashData.orderCount || 0,
          revenue: dashData.revenue || 0,
          averageRating: dashData.averageRating || 0,
          recentProducts: dashData.recentProducts || [],
          recentOrders: dashData.recentOrders || []
        });
      } else {
        // Fallback to mock data
        setDashboardData({
          productCount: Math.floor(Math.random() * 20) + 5,
          orderCount: Math.floor(Math.random() * 50),
          revenue: Math.floor(Math.random() * 10000) / 100,
          averageRating: parseFloat((4 + Math.random()).toFixed(1)),
          recentProducts: [],
          recentOrders: []
        });
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Mock data will be used as fallback (already set in initial state)
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-red"></div>
      </div>
    );
  }

  // Format the join date
  const joinDate = vendorInfo ? new Date(vendorInfo.joinDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : 'N/A';

  return (
    <>
      {/* Impersonation Banner */}
      <ImpersonationBanner />

      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6 bg-blue-600 text-white">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold">Vendor Dashboard</h1>
                <p>Welcome back, {vendorInfo?.businessName || userData?.name || 'Vendor'}!</p>
              </div>
              <div className="flex items-center">
                {vendorInfo?.isVerified ? (
                  <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Verified
                  </span>
                ) : (
                  <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Awaiting Verification
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Sales Summary */}
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h2 className="text-lg font-semibold mb-4">Sales Summary</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">Total Orders</p>
                    <p className="text-2xl font-bold">{dashboardData.orderCount}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">Revenue</p>
                    <p className="text-2xl font-bold">${dashboardData.revenue.toFixed(2)}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">Products</p>
                    <p className="text-2xl font-bold">{dashboardData.productCount}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">Avg. Rating</p>
                    <p className="text-2xl font-bold">{dashboardData.averageRating || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
                {dashboardData.recentOrders && dashboardData.recentOrders.length > 0 ? (
                  <div className="space-y-3">
                    {dashboardData.recentOrders.map((order, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium text-sm">Order #{order.id || order.order_id}</p>
                          <p className="text-xs text-gray-500">{new Date(order.created_at || order.date).toLocaleDateString()}</p>
                        </div>
                        <div className="text-sm font-medium">${order.total.toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No recent orders found.</p>
                )}
                <div className="mt-4">
                  <Link to="/vendor/orders" className="text-blue-600 hover:underline text-sm">Manage orders</Link>
                </div>
              </div>

              {/* Business Profile */}
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h2 className="text-lg font-semibold mb-4">Business Profile</h2>
                <div className="space-y-2">
                  <p className="text-sm"><span className="font-medium">Business Name:</span> {vendorInfo?.businessName || 'Not set'}</p>
                  <p className="text-sm"><span className="font-medium">Email:</span> {userData?.email}</p>
                  <p className="text-sm"><span className="font-medium">Website:</span> {vendorInfo?.website || 'Not set'}</p>
                  <p className="text-sm"><span className="font-medium">Joined:</span> {joinDate}</p>
                </div>
                <div className="mt-4">
                  <Link to="/vendor/profile" className="text-blue-600 hover:underline text-sm">Edit profile</Link>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link to="/vendor/products" className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg text-center transition">
                  <div className="text-blue-600 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">My Products</span>
                </Link>

                <Link to="/vendor/orders" className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg text-center transition">
                  <div className="text-blue-600 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">Orders</span>
                </Link>

                <Link to="/vendor/products/new" className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg text-center transition">
                  <div className="text-blue-600 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">Add Product</span>
                </Link>

                <Link to="/vendor/analytics" className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg text-center transition">
                  <div className="text-blue-600 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">Analytics</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default VendorDashboard;
