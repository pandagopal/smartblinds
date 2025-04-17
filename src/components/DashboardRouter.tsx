import React, { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { authService, UserRole } from '../services/authService';
import CustomerDashboard from './dashboards/CustomerDashboard';
import VendorDashboard from './dashboards/VendorDashboard';
import AdminDashboard from './dashboards/AdminDashboard';
import InstallerDashboard from './dashboards/InstallerDashboard';
import SalesDashboard from './dashboards/SalesDashboard';

const DashboardRouter: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get current user from auth service
    const currentUser = authService.getCurrentUser();
    console.log('[DashboardRouter] Current user data:', currentUser);

    // Add a token check but don't try to refresh it
    const token = authService.getToken();
    console.log('[DashboardRouter] Authentication token:', token ? 'exists' : 'missing');

    if (!token) {
      setError('Authentication required. Please sign in to access your dashboard.');
      setLoading(false);
    } else if (!currentUser) {
      console.error('[DashboardRouter] Token exists but no user data found');
      setError('User data not found. Please sign in again.');
      setLoading(false);
    } else {
      // We have both token and user data, we can proceed
      setUser(currentUser);
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-red"></div>
      </div>
    );
  }

  // Show error message if present
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[400px]">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
        <Link to="/signin" className="mt-4 bg-primary-red text-white px-4 py-2 rounded hover:bg-red-700">
          Sign In
        </Link>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!authService.isAuthenticated()) {
    console.log('[DashboardRouter] User not authenticated, redirecting to signin');
    return <Navigate to="/signin" replace />;
  }

  // Route to the appropriate dashboard based on user role
  console.log('[DashboardRouter] User role:', user?.role);

  switch (user?.role) {
    case UserRole.ADMIN:
      console.log('[DashboardRouter] Identified as admin, showing admin dashboard');
      return <AdminDashboard />;
    case UserRole.VENDOR:
      console.log('[DashboardRouter] Identified as vendor, showing vendor dashboard');
      return <VendorDashboard />;
    case UserRole.INSTALLER:
      console.log('[DashboardRouter] Identified as installer, showing installer dashboard');
      return <InstallerDashboard />;
    case UserRole.SALES_PERSON:
    case 'sales':
      console.log('[DashboardRouter] Identified as sales person, showing sales dashboard');
      return <SalesDashboard />;
    case UserRole.CUSTOMER:
      console.log('[DashboardRouter] Identified as customer, showing customer dashboard');
      return <CustomerDashboard />;
    default:
      // If role is not recognized, default to customer dashboard
      console.log('[DashboardRouter] No specific role identified, defaulting to customer dashboard');
      return <CustomerDashboard />;
  }
};

export default DashboardRouter;
