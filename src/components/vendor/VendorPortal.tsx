import React, { useState, useEffect } from 'react';
import { Navigate, useLocation, Routes, Route, Link } from 'react-router-dom';
import { authService, UserRole } from '../../services/authService';

// Import vendor tab components
import CompanyProfile from './tabs/CompanyProfile';
import ContactInformation from './tabs/ContactInformation';
import ManufacturingInfo from './tabs/ManufacturingInfo';
import ShippingAddresses from './tabs/ShippingAddresses';
import BusinessSchedule from './tabs/BusinessSchedule';
import LegalDocuments from './tabs/LegalDocuments';
import ProductForm from './ProductForm';
import ProductConfigOptions from './ProductConfigOptions';
import ProductCatalog from './ProductCatalog';
import OrderManagement from './OrderManagement';
import OrderDetail from './OrderDetail';

// Tab type definition
interface Tab {
  id: string;
  label: string;
  icon: React.ReactNode;
  component: React.ReactNode;
}

const VendorPortal: React.FC = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<string>('company-profile');
  const [isVendor, setIsVendor] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check if user is a vendor
  useEffect(() => {
    const checkVendorStatus = () => {
      const user = authService.getCurrentUser();
      setIsVendor(user?.role === UserRole.VENDOR);
      setIsLoading(false);
    };

    checkVendorStatus();
  }, []);

  // Get tab from URL if present
  useEffect(() => {
    // Only set tab from hash if not in a nested route
    if (!location.pathname.includes('/products/') && !location.pathname.includes('/orders/')) {
      const hash = location.hash.replace('#', '');
      if (hash && tabs.some(tab => tab.id === hash)) {
        setActiveTab(hash);
      } else if (location.pathname.includes('/vendor/products')) {
        setActiveTab('products');
      } else if (location.pathname.includes('/vendor/orders')) {
        setActiveTab('orders');
      }
    }
  }, [location]);

  // Define tabs with their icons and components
  const tabs: Tab[] = [
    {
      id: 'company-profile',
      label: 'Company Profile',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      component: <CompanyProfile />
    },
    {
      id: 'products',
      label: 'Products',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      component: <ProductCatalog />
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      component: <OrderManagement />
    },
    {
      id: 'contact-information',
      label: 'Contact Info',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      component: <ContactInformation />
    },
    {
      id: 'manufacturing-info',
      label: 'Manufacturing',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      component: <ManufacturingInfo />
    },
    {
      id: 'shipping-addresses',
      label: 'Shipping',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      component: <ShippingAddresses />
    },
    {
      id: 'business-schedule',
      label: 'Business Hours',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      component: <BusinessSchedule />
    },
    {
      id: 'legal-documents',
      label: 'Legal Documents',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      component: <LegalDocuments />
    }
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    window.location.hash = tabId;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-red"></div>
      </div>
    );
  }

  // Redirect if not a vendor
  if (!isVendor) {
    return <Navigate to="/account" replace />;
  }

  // Checking if we're on a subpage that requires different rendering
  const isProductConfig = location.pathname.includes('/products/configure/');
  const isProductEdit = location.pathname.includes('/products/edit/') || location.pathname.includes('/products/new');
  const isOrderDetail = location.pathname.includes('/orders/') && !location.pathname.endsWith('/orders');

  if (isProductConfig || isProductEdit) {
    // Extract product ID from URL
    const pathParts = location.pathname.split('/');
    const productId = pathParts[pathParts.length - 1];

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6 bg-blue-600 text-white">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">
                {isProductConfig ? 'Product Configuration' : (isProductEdit && productId !== 'new' ? 'Edit Product' : 'Add New Product')}
              </h1>
              <Link to="/vendor/products" className="text-white hover:text-gray-200 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Back to Products
              </Link>
            </div>
          </div>
          <div className="p-6">
            {isProductConfig ? (
              <ProductConfigOptions productId={parseInt(productId)} />
            ) : (
              <ProductForm />
            )}
          </div>
        </div>
      </div>
    );
  }

  if (isOrderDetail) {
    return (
      <div className="container mx-auto px-4 py-8">
        <OrderDetail />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6 bg-blue-600 text-white">
          <h1 className="text-2xl font-bold">Vendor Portal</h1>
          <p>Manage your vendor profile and business information</p>
        </div>

        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center px-4 py-3 text-sm font-medium whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800 hover:border-gray-300'
                }`}
              >
                <span className={`mr-2 ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-500'}`}>
                  {tab.icon}
                </span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          <Routes>
            <Route path="products/*" element={<ProductCatalog />} />
            <Route path="orders/*" element={<OrderManagement />} />
            <Route path="*" element={
              tabs.find(tab => tab.id === activeTab)?.component
            } />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default VendorPortal;
