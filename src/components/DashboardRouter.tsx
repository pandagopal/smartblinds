import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../services/authService';
import CustomerDashboard from './dashboards/CustomerDashboard';
import VendorDashboard from './dashboards/VendorDashboard';
import AdminDashboard from './dashboards/AdminDashboard';
import InstallerDashboard from './dashboards/InstallerDashboard';
import SalesDashboard from './dashboards/SalesDashboard';

const DashboardRouter: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Get current user from auth service
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-red"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!authService.isAuthenticated()) {
    return <Navigate to="/signin" replace />;
  }

  // Route to the appropriate dashboard based on user role
  switch (user?.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'vendor':
      return <VendorDashboard />;
    case 'installer':
      return <InstallerDashboard />;
    case 'sales':
      return <SalesDashboard />;
    case 'customer':
    default:
      return <CustomerDashboard />;
  }
};

export default DashboardRouter;
