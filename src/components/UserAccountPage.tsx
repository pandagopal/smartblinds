import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getCartItemCount } from '../services/cartService';
import { authService, UserRole } from '../services/authService';

// Profile Components
import UserProfile from './account/UserProfile';
import OrderHistory from './account/OrderHistory';
import SavedMeasurements from './account/SavedMeasurements';
import Favorites from './account/Favorites';
import AccountSettings from './account/AccountSettings';
import SupportTickets from './account/SupportTickets';
import ProductReviews from './account/ProductReviews';
import UserAddresses from './account/UserAddresses';

// Navigation items
type NavItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
};

const UserAccountPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<string>('profile');
  const [cartItemCount, setCartItemCount] = useState<number>(getCartItemCount());
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string>('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check if there's a logged-in user from authService
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setIsLoggedIn(true);
      setUser(currentUser);
      setUserRole(currentUser.role);
    } else {
      // Redirect to sign-in if not logged in
      navigate('/sign-in');
    }
  }, [navigate]);

  // Navigation items with icons
  const navItems: NavItem[] = [
    {
      id: 'profile',
      label: 'My Profile',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M20.5899 22C20.5899 18.13 16.7399 15 11.9999 15C7.25991 15 3.40991 18.13 3.40991 22" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    },
    {
      id: 'orders',
      label: 'Order History',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M8.5 12H15.5" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 15.5V8.5" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    },
    {
      id: 'measurements',
      label: 'Saved Measurements',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M7.75 12L10.58 14.83L16.25 9.17" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    },
    {
      id: 'addresses',
      label: 'My Addresses',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 13.43C13.7231 13.43 15.12 12.0331 15.12 10.31C15.12 8.58687 13.7231 7.19 12 7.19C10.2769 7.19 8.88 8.58687 8.88 10.31C8.88 12.0331 10.2769 13.43 12 13.43Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3.62 8.49C5.59 -0.169 18.42 -0.159 20.38 8.5C21.53 13.58 18.37 17.88 15.6 20.54C13.59 22.48 10.41 22.48 8.39 20.54C5.63 17.88 2.47 13.57 3.62 8.49Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      id: 'favorites',
      label: 'Favorites',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.62 20.81C12.28 20.93 11.72 20.93 11.38 20.81C8.48 19.82 2 15.69 2 8.69C2 5.6 4.49 3.1 7.56 3.1C9.38 3.1 10.99 3.98 12 5.34C13.01 3.98 14.63 3.1 16.44 3.1C19.51 3.1 22 5.6 22 8.69C22 15.69 15.52 19.82 12.62 20.81Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    },
    {
      id: 'reviews',
      label: 'My Reviews',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.5 17L8.5 14M11.5 17L14.5 14M11.5 17V10M21.5 12C21.5 16.92 17.52 21 12.5 21C7.48 21 3.5 16.92 3.5 12C3.5 7.08 7.48 3 12.5 3C13.25 3 13.97 3.1 14.67 3.29L15.62 3.55C16.45 3.79 16.87 3.91 17.17 4.31C17.46 4.7 17.43 5.15 17.38 6.05L17.35 6.68C17.31 7.37 17.29 7.71 17.5 7.92C17.71 8.12 18.05 8.12 18.73 8.12H19.47C20.35 8.12 20.8 8.12 21.18 8.42C21.57 8.73 21.67 9.17 21.87 10.05C21.95 10.42 22 10.79 22 11.17" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 5C8 6.65685 6.65685 8 5 8C3.34315 8 2 6.65685 2 5C2 3.34315 3.34315 2 5 2C6.65685 2 8 3.34315 8 5Z" strokeWidth="1.5"/>
        </svg>
      )
    },
    {
      id: 'support',
      label: 'Support Tickets',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 2H6C4.34 2 3 3.33 3 4.97V15.88C3 17.52 4.34 18.85 6 18.85H6.76C7.55 18.85 8.31 19.16 8.87 19.72L10.17 21.02C11.28 22.13 13.13 22.13 14.24 21.02L15.54 19.72C16.1 19.16 16.86 18.85 17.65 18.85H18C19.66 18.85 21 17.52 21 15.88V4.97C21 3.33 19.66 2 18 2Z" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 13.5V13.51" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 9.5V9.51" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      id: 'settings',
      label: 'Account Settings',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2 12.88V11.12C2 10.08 2.85 9.22 3.9 9.22C5.71 9.22 6.45 7.94 5.54 6.37C5.02 5.47 5.33 4.3 6.24 3.78L7.97 2.79C8.76 2.32 9.78 2.6 10.25 3.39L10.36 3.58C11.26 5.15 12.74 5.15 13.65 3.58L13.76 3.39C14.23 2.6 15.25 2.32 16.04 2.79L17.77 3.78C18.68 4.3 18.99 5.47 18.47 6.37C17.56 7.94 18.3 9.22 20.11 9.22C21.15 9.22 22.01 10.07 22.01 11.12V12.88C22.01 13.92 21.16 14.78 20.11 14.78C18.3 14.78 17.56 16.06 18.47 17.63C18.99 18.54 18.68 19.7 17.77 20.22L16.04 21.21C15.25 21.68 14.23 21.4 13.76 20.61L13.65 20.42C12.75 18.85 11.27 18.85 10.36 20.42L10.25 20.61C9.78 21.4 8.76 21.68 7.97 21.21L6.24 20.22C5.33 19.7 5.02 18.53 5.54 17.63C6.45 16.06 5.71 14.78 3.9 14.78C2.85 14.78 2 13.92 2 12.88Z" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    }
  ];

  // Render the active section content
  const renderActiveSection = () => {
    if (!user) return null;

    switch (activeSection) {
      case 'profile':
        return <UserProfile user={user} />;
      case 'orders':
        return <OrderHistory userId={user.id} />;
      case 'measurements':
        return <SavedMeasurements userId={user.id} />;
      case 'addresses':
        return <UserAddresses userId={user.id} />;
      case 'favorites':
        return <Favorites userId={user.id} />;
      case 'reviews':
        return <ProductReviews userId={user.id} />;
      case 'support':
        return <SupportTickets userId={user.id} />;
      case 'settings':
        return <AccountSettings />;
      default:
        return <UserProfile user={user} />;
    }
  };

  // Handle logout
  const handleLogout = () => {
    authService.logout();
    setIsLoggedIn(false);
    navigate('/sign-in');
  };

  if (!isLoggedIn || !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-red mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-1/4 bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 rounded-full bg-primary-red text-white flex items-center justify-center text-xl font-bold">
              {user.firstName?.charAt(0) || ''}{user.lastName?.charAt(0) || ''}
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-bold">{user.firstName} {user.lastName}</h2>
              <p className="text-sm text-gray-600">{user.email}</p>
              <p className="text-xs text-gray-500 mt-1">{userRole.charAt(0).toUpperCase() + userRole.slice(1)}</p>
            </div>
          </div>

          <nav className="mt-8">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center p-3 rounded-lg ${
                      activeSection === item.id
                        ? 'bg-primary-red text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className={`${
                      activeSection === item.id ? 'stroke-white' : 'stroke-gray-700'
                    }`}>
                      {item.icon}
                    </span>
                    <span className="ml-3">{item.label}</span>
                  </button>
                </li>
              ))}

              {/* Admin Dashboard Link - only visible for admins */}
              {userRole === UserRole.ADMIN && (
                <li>
                  <Link
                    to="/admin"
                    className="w-full flex items-center p-3 rounded-lg text-gray-700 hover:bg-gray-100"
                  >
                    <svg className="w-5 h-5 stroke-gray-700" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 3H14C19.5 3 21 4.5 21 10V14C21 19.5 19.5 21 14 21H10C4.5 21 3 19.5 3 14V10C3 4.5 4.5 3 10 3Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M17.5 11.5C16.672 11.5 16 10.828 16 10C16 9.172 16.672 8.5 17.5 8.5C18.328 8.5 19 9.172 19 10C19 10.828 18.328 11.5 17.5 11.5Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M9.5 11.5C8.672 11.5 8 10.828 8 10C8 9.172 8.672 8.5 9.5 8.5C10.328 8.5 11 9.172 11 10C11 10.828 10.328 11.5 9.5 11.5Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M9.5 11.5C8.672 11.5 8 10.828 8 10C8 9.172 8.672 8.5 9.5 8.5C10.328 8.5 11 9.172 11 10C11 10.828 10.328 11.5 9.5 11.5Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M19 17L15.5 15.5C14.62 16.45 13.37 17 12 17C10.63 17 9.38 16.45 8.5 15.5L5 17" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="ml-3">Admin Dashboard</span>
                  </Link>
                </li>
              )}

              {/* Vendor Portal Link - only visible for vendors */}
              {userRole === UserRole.VENDOR && (
                <li>
                  <Link
                    to="/vendor"
                    className="w-full flex items-center p-3 rounded-lg text-gray-700 hover:bg-gray-100"
                  >
                    <svg className="w-5 h-5 stroke-gray-700" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22 6V8.42C22 10 21 11 19.42 11H16V4.01C16 2.9 16.91 2 18.02 2C19.11 2.01 20.11 2.45 20.83 3.17C21.55 3.9 22 4.9 22 6Z" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M2 7V21C2 21.83 2.94 22.3 3.6 21.8L5.31 20.52C5.71 20.22 6.27 20.26 6.63 20.62L8.29 22.29C8.68 22.68 9.32 22.68 9.71 22.29L11.39 20.61C11.74 20.26 12.3 20.22 12.69 20.52L14.4 21.8C15.06 22.29 16 21.82 16 21V4C16 2.9 16.9 2 18 2H7H6C3 2 2 3.79 2 6V7Z" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M9 13.01H12" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M9 9.01H12" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M9 17.01H12" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="ml-3">Vendor Portal</span>
                  </Link>
                </li>
              )}

              {/* Logout button */}
              <li>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center p-3 rounded-lg text-gray-700 hover:bg-gray-100"
                >
                  <svg className="w-5 h-5 stroke-gray-700" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8.9 7.56C9.21 3.96 11.06 2.49 15.11 2.49H15.24C19.71 2.49 21.5 4.28 21.5 8.75V15.27C21.5 19.74 19.71 21.53 15.24 21.53H15.11C11.09 21.53 9.24 20.08 8.91 16.54" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M15 12H3.62" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M5.85 8.6499L2.5 11.9999L5.85 15.3499" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="ml-3">Log Out</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>

        {/* Main content */}
        <div className="w-full md:w-3/4 bg-white rounded-lg shadow p-6">
          {renderActiveSection()}
        </div>
      </div>
    </div>
  );
};

export default UserAccountPage;
