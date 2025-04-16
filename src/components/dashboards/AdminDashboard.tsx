import React, { useState, useEffect } from 'react';
import { Link, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { adminService } from '../../services/adminService';
import VendorManagement from '../admin/VendorManagement';
import VendorDetails from '../admin/VendorDetails';
import UserManagement from '../admin/UserManagement';
import ProductsManager from '../admin/database/ProductsManager';
import CacheManager from '../admin/database/CacheManager';
import ShippingDashboard from '../admin/ShippingDashboard';
import BatchShipping from '../admin/BatchShipping';
import DatabaseAdminPanel from '../admin/DatabaseAdminPanel';

interface DashboardStats {
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
  };
  recentVendors: any[];
  orderStats: {
    total_orders: number;
    total_revenue: number;
    pending_orders: number;
    processing_orders: number;
    completed_orders: number;
    cancelled_orders: number;
  };
}

const AdminDashboard: React.FC = () => {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Set up token refresh interval
  useEffect(() => {
    // Refresh token on component mount
    authService.refreshTokenIfNeeded();

    // Set up an interval to refresh the token
    const intervalId = setInterval(() => {
      authService.refreshTokenIfNeeded();
    }, 5 * 60 * 1000); // Every 5 minutes

    // Clear interval on component unmount
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // Refresh token when path changes (e.g., navigating to Orders section)
  useEffect(() => {
    const refreshToken = async () => {
      await authService.refreshTokenIfNeeded();
    };

    refreshToken();
  }, [location.pathname]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Verify admin role - do not disable this check
        if (!authService.isAdmin()) {
          console.error('Access denied: User is not an admin');
          setError('Access denied: Admin privileges required');
          setLoading(false);
          // Navigate to sign in page after a short delay
          setTimeout(() => navigate('/signin'), 2000);
          return;
        }

        // Get current user data
        const user = authService.getCurrentUser();
        setUserData(user);

        // Make sure token is fresh before making API call
        await authService.refreshTokenIfNeeded();

        // Log the token for debugging purposes
        const token = authService.getToken();
        console.log('Using token for admin dashboard:', token ? 'Token exists' : 'No token');

        // Fetch real dashboard data
        const dashboardData = await adminService.getDashboard();
        setStats(dashboardData);
        setError(null);
      } catch (error: any) {
        console.error('Error fetching dashboard data:', error);
        setError(error.message || 'Failed to load dashboard data');
        // Set default empty stats to avoid null checks
        setStats({
          userCounts: { total_users: 0, customers: 0, vendors: 0, admins: 0 },
          vendorStatus: { active_vendors: 0, inactive_vendors: 0, verified_vendors: 0, unverified_vendors: 0 },
          recentVendors: [],
          orderStats: {
            total_orders: 0,
            total_revenue: 0,
            pending_orders: 0,
            processing_orders: 0,
            completed_orders: 0,
            cancelled_orders: 0
          }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[400px]">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
        <button
          className="mt-4 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 ml-64">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 m-4 rounded relative" role="alert">
            <strong className="font-bold">Warning: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <Routes>
          <Route path="/" element={<DashboardOverview userData={userData} stats={stats} />} />
          <Route path="/vendors" element={<VendorManagement />} />
          <Route path="/vendors/:id" element={<VendorDetails />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/products" element={<ProductsManager />} />
          <Route path="/orders" element={<ShippingDashboard />} />
          <Route path="/shipping" element={<BatchShipping />} />
          <Route path="/database" element={<DatabaseAdminPanel />} />
          <Route path="/cache" element={<CacheManager />} />
          <Route path="/settings" element={<div>Settings Page</div>} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </div>
    </div>
  );
};

const AdminSidebar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname.includes(path) ? 'bg-purple-700 text-white' : 'text-gray-700 hover:bg-purple-100';
  };

  return (
    <div className="fixed w-64 h-screen bg-white shadow-md">
      <div className="p-6 bg-purple-700 text-white">
        <h2 className="text-xl font-bold">Admin Panel</h2>
      </div>
      <div className="p-4">
        <ul className="space-y-2">
          <li>
            <Link
              to="/admin"
              className={`flex items-center p-3 rounded-lg ${isActive('/admin') && !location.pathname.includes('/admin/vendors') ? 'bg-purple-700 text-white' : 'text-gray-700 hover:bg-purple-100'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              to="/admin/vendors"
              className={`flex items-center p-3 rounded-lg ${isActive('/admin/vendors')}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Vendor Management
            </Link>
          </li>
          <li>
            <Link
              to="/admin/products"
              className={`flex items-center p-3 rounded-lg ${isActive('/admin/products')}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              Products
            </Link>
          </li>
          <li>
            <Link
              to="/admin/orders"
              className={`flex items-center p-3 rounded-lg ${isActive('/admin/orders')}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Orders
            </Link>
          </li>
          <li>
            <Link
              to="/admin/users"
              className={`flex items-center p-3 rounded-lg ${isActive('/admin/users')}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Users
            </Link>
          </li>
          <li>
            <Link
              to="/admin/database"
              className={`flex items-center p-3 rounded-lg ${isActive('/admin/database')}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
              Database
            </Link>
          </li>
          <li>
            <Link
              to="/admin/cache"
              className={`flex items-center p-3 rounded-lg ${isActive('/admin/cache')}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Cache Manager
            </Link>
          </li>
          <li>
            <Link
              to="/admin/settings"
              className={`flex items-center p-3 rounded-lg ${isActive('/admin/settings')}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

const DashboardOverview: React.FC<{ userData: any, stats: DashboardStats | null }> = ({ userData, stats }) => {
  if (!stats) {
    return <div>Error loading dashboard data</div>;
  }

  return (
    <div className="container p-6">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6 bg-purple-700 text-white">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p>Welcome back, {userData?.name || 'Admin'}!</p>
        </div>

        <div className="p-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center">
                <div className="bg-purple-100 p-3 rounded-full mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Users</p>
                  <p className="text-xl font-bold">{stats.userCounts.total_users}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Vendors</p>
                  <p className="text-xl font-bold">{stats.userCounts.vendors}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-full mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Active Vendors</p>
                  <p className="text-xl font-bold">{stats.vendorStatus.active_vendors}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center">
                <div className="bg-red-100 p-3 rounded-full mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pending Verification</p>
                  <p className="text-xl font-bold">{stats.vendorStatus.unverified_vendors}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Recent Vendors */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Recent Vendors</h2>
                <Link to="/admin/vendors" className="text-purple-600 text-sm font-medium hover:underline">
                  View All
                </Link>
              </div>
              {stats.recentVendors.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentVendors.map((vendor) => (
                    <div key={vendor.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-purple-200 flex items-center justify-center mr-3">
                          {vendor.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{vendor.name}</p>
                          <p className="text-sm text-gray-500">{vendor.email}</p>
                        </div>
                      </div>
                      <div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          vendor.vendor_info.isVerified
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {vendor.vendor_info.isVerified ? 'Verified' : 'Pending'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No recent vendors to display.</p>
              )}
            </div>

            {/* Order Statistics */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h2 className="text-lg font-semibold mb-4">Order Statistics</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Orders</span>
                  <span className="font-medium">{stats.orderStats.total_orders}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Revenue</span>
                  <span className="font-medium">${stats.orderStats.total_revenue?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pending Orders</span>
                  <span className="font-medium">{stats.orderStats.pending_orders}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Completed Orders</span>
                  <span className="font-medium">{stats.orderStats.completed_orders}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link to="/admin/vendors" className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg text-center transition">
                <div className="text-purple-700 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <span className="text-sm font-medium">Vendor Management</span>
              </Link>

              <Link to="/admin/products" className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg text-center transition">
                <div className="text-purple-700 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                </div>
                <span className="text-sm font-medium">Product Management</span>
              </Link>

              <Link to="/admin/orders" className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg text-center transition">
                <div className="text-purple-700 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <span className="text-sm font-medium">Order Management</span>
              </Link>

              <Link to="/admin/settings" className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg text-center transition">
                <div className="text-purple-700 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="text-sm font-medium">System Settings</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
