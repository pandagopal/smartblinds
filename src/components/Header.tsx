import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService, UserRole } from '../services/authService';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Check authentication state
  const checkAuth = () => {
    const authState = authService.isAuthenticated();
    setIsAuthenticated(authState);

    if (authState) {
      setUser(authService.getCurrentUser());
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    // Check auth state on component mount
    checkAuth();

    // Listen for storage events (for when logout happens in another tab)
    window.addEventListener('storage', checkAuth);

    // Listen for custom auth state change events
    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener('auth-state-change', handleAuthChange);

    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('auth-state-change', handleAuthChange);
    };
  }, []);

  const handleLogout = async () => {
    await authService.logout();
    // No need to manually update state here, the auth-state-change event will handle it
    navigate('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm" itemScope itemType="https://schema.org/WPHeader">
      <div className="bg-[#c41230] text-white py-1 px-4 text-center text-sm" role="banner">
        <span itemProp="description">Call (316) 530-2635 to get discount 10% on initial order.</span>
      </div>

      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo with Schema.org markup */}
          <Link
            to="/"
            className="flex items-center"
            itemScope
            itemType="https://schema.org/Organization"
            aria-label="SmartBlinds Home"
          >
            <img
              src="/logo.svg"
              alt="SmartBlinds Logo"
              className="h-8 w-auto"
              itemProp="logo"
              width="32"
              height="32"
            />
            <span className="ml-2 text-xl font-semibold text-gray-800" itemProp="name">SmartBlinds</span>
          </Link>

          {/* Navigation with semantic nav element */}
          <nav className="hidden md:flex space-x-6" itemScope itemType="https://schema.org/SiteNavigationElement" aria-label="Main Navigation">
            <Link
              to="/products"
              className="text-gray-600 hover:text-primary-red transition-colors"
              itemProp="url"
              aria-label="Shop all products"
            >
              <span itemProp="name">Shop</span>
            </Link>
            <Link
              to="/marketplace"
              className="text-gray-600 hover:text-primary-red transition-colors"
              itemProp="url"
              aria-label="Browse vendor marketplace"
            >
              <span itemProp="name">Marketplace</span>
            </Link>
            <Link
              to="/measure-install"
              className="text-gray-600 hover:text-primary-red transition-colors"
              itemProp="url"
              aria-label="Learn how to measure and install"
            >
              <span itemProp="name">Measure & Install</span>
            </Link>
            <Link
              to="/help"
              className="text-gray-600 hover:text-primary-red transition-colors"
              itemProp="url"
              aria-label="Get help with your order"
            >
              <span itemProp="name">Help Center</span>
            </Link>
            <Link
              to="/blog"
              className="text-gray-600 hover:text-primary-red transition-colors"
              itemProp="url"
              aria-label="Read our blog articles"
            >
              <span itemProp="name">Blog</span>
            </Link>
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link
              to="/cart"
              className="text-gray-600 hover:text-primary-red transition-colors relative"
              aria-label="View shopping cart"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="absolute -top-1 -right-1 bg-primary-red text-white text-xs rounded-full h-4 w-4 flex items-center justify-center" aria-label="0 items in cart">
                0
              </span>
            </Link>

            {isAuthenticated ? (
              /* User Profile Dropdown */
              <div className="relative">
                <button
                  className="flex items-center space-x-2 focus:outline-none"
                  onClick={toggleMenu}
                  aria-expanded={isMenuOpen}
                  aria-haspopup="true"
                  aria-label="Open user menu"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {user?.profileImage ? (
                      <img src={user.profileImage} alt={user.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-gray-700 font-semibold">{user?.name?.charAt(0) || '?'}</span>
                    )}
                  </div>
                  <span className="hidden md:inline text-gray-700">{user?.name?.split(' ')[0] || 'User'}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu"
                  >
                    <Link
                      to="/account"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                      role="menuitem"
                    >
                      My Account
                    </Link>

                    {/* Admin Dashboard - only shown to admin users */}
                    {user?.role === UserRole.ADMIN && (
                      <Link
                        to="/admin"
                        className="block px-4 py-2 text-sm text-primary-red font-medium hover:bg-gray-100"
                        onClick={() => setIsMenuOpen(false)}
                        role="menuitem"
                      >
                        Admin Dashboard
                      </Link>
                    )}

                    {/* Vendor Portal - only shown to vendor users */}
                    {user?.role === UserRole.VENDOR && (
                      <Link
                        to="/vendor"
                        className="block px-4 py-2 text-sm text-blue-600 font-medium hover:bg-gray-100"
                        onClick={() => setIsMenuOpen(false)}
                        role="menuitem"
                      >
                        Vendor Portal
                      </Link>
                    )}

                    <Link
                      to="/orders"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                      role="menuitem"
                    >
                      Order History
                    </Link>
                    <Link
                      to="/saved-measurements"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                      role="menuitem"
                    >
                      Saved Measurements
                    </Link>
                    <Link
                      to="/favorites"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                      role="menuitem"
                    >
                      Favorites
                    </Link>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleLogout();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Sign In Button */
              <Link
                to="/signin"
                className="flex items-center text-gray-600 hover:text-primary-red transition-colors"
                aria-label="Sign in to your account"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="hidden md:inline">Sign In</span>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-gray-600 hover:text-primary-red"
              aria-label="Open mobile menu"
              aria-expanded="false"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Secondary navigation - Categories */}
      <nav className="bg-gray-100 border-y border-gray-200 py-2" aria-label="Product Categories">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex space-x-6 overflow-x-auto" itemScope itemType="https://schema.org/SiteNavigationElement">
              <Link
                to="/category/cellular-shades"
                className="text-gray-800 hover:text-primary-red whitespace-nowrap text-sm font-medium"
                itemProp="url"
              >
                <span itemProp="name">Cellular Shades</span>
              </Link>
              <Link
                to="/category/faux-wood-blinds"
                className="text-gray-800 hover:text-primary-red whitespace-nowrap text-sm font-medium"
                itemProp="url"
              >
                <span itemProp="name">Faux Wood Blinds</span>
              </Link>
              <Link
                to="/category/roller-shades"
                className="text-gray-800 hover:text-primary-red whitespace-nowrap text-sm font-medium"
                itemProp="url"
              >
                <span itemProp="name">Roller Shades</span>
              </Link>
              <Link
                to="/category/woven-wood-shades"
                className="text-gray-800 hover:text-primary-red whitespace-nowrap text-sm font-medium"
                itemProp="url"
              >
                <span itemProp="name">Woven Wood Shades</span>
              </Link>
              <Link
                to="/category/roman-shades"
                className="text-gray-800 hover:text-primary-red whitespace-nowrap text-sm font-medium"
                itemProp="url"
              >
                <span itemProp="name">Roman Shades</span>
              </Link>
              <Link
                to="/category/wood-blinds"
                className="text-gray-800 hover:text-primary-red whitespace-nowrap text-sm font-medium"
                itemProp="url"
              >
                <span itemProp="name">Wood Blinds</span>
              </Link>
            </div>
            <div className="hidden md:block">
              <Link
                to="/measure-install"
                className="text-primary-red hover:text-red-800 text-sm font-medium"
                aria-label="Learn how to measure your windows"
              >
                How to Measure
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
