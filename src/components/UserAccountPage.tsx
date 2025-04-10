import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCartItemCount } from '../services/cartService';

// Profile Components
import UserProfile from './account/UserProfile';
import OrderHistory from './account/OrderHistory';
import SavedMeasurements from './account/SavedMeasurements';
import Favorites from './account/Favorites';
import AccountSettings from './account/AccountSettings';

// Mock user data
const mockUser = {
  id: 'user123',
  firstName: 'Jane',
  lastName: 'Smith',
  email: 'jane.smith@example.com',
  phone: '(555) 123-4567',
  address: {
    street: '123 Main St',
    city: 'Seattle',
    state: 'WA',
    zipCode: '98101',
    country: 'United States'
  },
  createdAt: new Date('2023-05-15'),
  preferredContactMethod: 'email'
};

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
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true); // Mock logged in state

  useEffect(() => {
    // For demonstration, we're assuming the user is logged in
    // In a real application, you would check auth state here
    if (!isLoggedIn) {
      navigate('/sign-in');
    }
  }, [isLoggedIn, navigate]);

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
      id: 'favorites',
      label: 'Favorites',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12.62 20.81C12.28 20.93 11.72 20.93 11.38 20.81C8.48 19.82 2 15.69 2 8.69C2 5.6 4.49 3.1 7.56 3.1C9.38 3.1 10.99 3.98 12 5.34C13.01 3.98 14.63 3.1 16.44 3.1C19.51 3.1 22 5.6 22 8.69C22 15.69 15.52 19.82 12.62 20.81Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
    switch (activeSection) {
      case 'profile':
        return <UserProfile user={mockUser} />;
      case 'orders':
        return <OrderHistory userId={mockUser.id} />;
      case 'measurements':
        return <SavedMeasurements userId={mockUser.id} />;
      case 'favorites':
        return <Favorites userId={mockUser.id} />;
      case 'settings':
        return <AccountSettings user={mockUser} />;
      default:
        return <UserProfile user={mockUser} />;
    }
  };

  // Handle logout
  const handleLogout = () => {
    // In a real app, you would call your auth service logout method
    setIsLoggedIn(false);
    navigate('/sign-in');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-1/4 bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 rounded-full bg-primary-red text-white flex items-center justify-center text-xl font-bold">
              {mockUser.firstName.charAt(0)}{mockUser.lastName.charAt(0)}
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-bold">{mockUser.firstName} {mockUser.lastName}</h2>
              <p className="text-sm text-gray-600">{mockUser.email}</p>
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

              <li>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center p-3 rounded-lg text-gray-700 hover:bg-gray-100"
                >
                  <svg className="w-5 h-5 stroke-gray-700" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8.90002 7.56023C9.21002 3.96023 11.06 2.49023 15.11 2.49023H15.24C19.71 2.49023 21.5 4.28023 21.5 8.75023V15.2702C21.5 19.7402 19.71 21.5302 15.24 21.5302H15.11C11.09 21.5302 9.24002 20.0802 8.91002 16.5402" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M15 12H3.62" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M5.85 8.65039L2.5 12.0004L5.85 15.3504" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="ml-3">Logout</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="w-full md:w-3/4 bg-white rounded-lg shadow p-6">
          {renderActiveSection()}
        </div>
      </div>
    </div>
  );
};

export default UserAccountPage;
