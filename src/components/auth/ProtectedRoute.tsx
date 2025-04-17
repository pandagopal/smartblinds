import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authService, UserRole } from '../../services/authService';

interface ProtectedRouteProps {
  element: React.ReactNode;
  allowedRoles: UserRole[];
  redirectPath?: string;
}

/**
 * ProtectedRoute component that handles role-based access control
 * It checks if the user is authenticated and has the required role
 * If not, it redirects to the login page or appropriate dashboard
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  element,
  allowedRoles,
  redirectPath = '/signin'
}) => {
  const [loading, setLoading] = useState(true);
  const [accessGranted, setAccessGranted] = useState(false);
  const [redirectTo, setRedirectTo] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      // Check if user is authenticated
      const isAuthenticated = authService.isAuthenticated();

      if (!isAuthenticated) {
        console.log('[ProtectedRoute] Not authenticated, redirecting to login');
        setRedirectTo(redirectPath);
        setLoading(false);
        return;
      }

      // Try to refresh token if needed
      if (authService.getRefreshToken()) {
        await authService.refreshToken().catch(err => {
          console.error('[ProtectedRoute] Token refresh failed:', err);
        });
      }

      // Check if user has required role
      const user = authService.getCurrentUser();
      if (!user) {
        console.error('[ProtectedRoute] No user data found');
        setRedirectTo(redirectPath);
        setLoading(false);
        return;
      }

      // Check if user has one of the allowed roles
      const hasRequiredRole = allowedRoles.some(role => {
        if (role === UserRole.ADMIN) return authService.isAdmin();
        if (role === UserRole.VENDOR) return authService.isVendor();
        if (role === UserRole.SALES_PERSON) return authService.isSalesPerson();
        if (role === UserRole.INSTALLER) return authService.isInstaller();
        if (role === UserRole.CUSTOMER) return authService.isCustomer();
        return user.role === role;
      });

      console.log(`[ProtectedRoute] User has role ${user.role}, required roles: ${allowedRoles.join(', ')}, access granted: ${hasRequiredRole}`);

      if (!hasRequiredRole) {
        // Redirect to appropriate dashboard based on user role
        const dashboardUrl = authService.getDashboardUrl();
        setRedirectTo(dashboardUrl);
      } else {
        setAccessGranted(true);
      }

      setLoading(false);
    };

    checkAuth();
  }, [allowedRoles, redirectPath, location.pathname]);

  if (loading) {
    // Show loading indicator
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-red"></div>
      </div>
    );
  }

  if (redirectTo) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (accessGranted) {
    return <>{element}</>;
  }

  // Fallback - should not get here
  return <Navigate to={redirectPath} state={{ from: location }} replace />;
};

export default ProtectedRoute;
