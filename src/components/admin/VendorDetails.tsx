import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';

interface VendorDetails {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  isListingActive: boolean;
  profileImage: string;
  createdAt: string;
  vendorInfo: {
    businessName: string;
    businessDescription: string;
    website: string;
    isVerified: boolean;
    categories: string[];
    joinDate: string;
  };
  stats: {
    productCount: number;
    orderCount: number;
    totalRevenue: number;
  };
}

const VendorDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [vendor, setVendor] = useState<VendorDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVendorDetails = async () => {
      try {
        setLoading(true);
        const data = await adminService.getVendorDetails(Number(id));
        setVendor(data);
      } catch (err) {
        console.error('Failed to fetch vendor details:', err);
        setError('Failed to fetch vendor details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchVendorDetails();
    }
  }, [id]);

  const handleStatusToggle = async () => {
    if (!vendor) return;

    try {
      setActionLoading(true);
      await adminService.updateVendorStatus(vendor.id, !vendor.isActive);
      setVendor({ ...vendor, isActive: !vendor.isActive });
      setActionSuccess(`Vendor account ${!vendor.isActive ? 'activated' : 'deactivated'} successfully`);

      setTimeout(() => {
        setActionSuccess('');
      }, 3000);
    } catch (err) {
      console.error('Failed to update vendor status:', err);
      setError('Failed to update vendor status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleListingStatusToggle = async () => {
    if (!vendor) return;

    try {
      setActionLoading(true);
      await adminService.updateVendorListingStatus(vendor.id, !vendor.isListingActive);
      setVendor({ ...vendor, isListingActive: !vendor.isListingActive });
      setActionSuccess(`Vendor product listings ${!vendor.isListingActive ? 'enabled' : 'disabled'} successfully`);

      setTimeout(() => {
        setActionSuccess('');
      }, 3000);
    } catch (err) {
      console.error('Failed to update vendor listing status:', err);
      setError('Failed to update vendor listing status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerificationToggle = async () => {
    if (!vendor) return;

    try {
      setActionLoading(true);
      await adminService.updateVendorVerification(vendor.id, !vendor.vendorInfo.isVerified);
      setVendor({
        ...vendor,
        vendorInfo: {
          ...vendor.vendorInfo,
          isVerified: !vendor.vendorInfo.isVerified
        }
      });
      setActionSuccess(`Vendor ${!vendor.vendorInfo.isVerified ? 'verified' : 'unverified'} successfully`);

      setTimeout(() => {
        setActionSuccess('');
      }, 3000);
    } catch (err) {
      console.error('Failed to update vendor verification:', err);
      setError('Failed to update vendor verification');
    } finally {
      setActionLoading(false);
    }
  };

  const handleImpersonate = async () => {
    if (!vendor) return;

    try {
      setActionLoading(true);
      const impersonateData = await adminService.impersonateVendor(vendor.id);
      // Store the impersonation token and redirect to vendor dashboard
      localStorage.setItem('impersonationToken', impersonateData.token);
      localStorage.setItem('impersonatedVendor', JSON.stringify(impersonateData.vendor));
      navigate('/vendor/dashboard');
    } catch (err) {
      console.error('Failed to impersonate vendor:', err);
      setError('Failed to impersonate vendor');
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-md">
          <p>{error}</p>
          <Link to="/admin/vendors" className="mt-4 inline-block bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md">
            Back to Vendors
          </Link>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="container p-6">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-6 py-4 rounded-md">
          <p>Vendor not found</p>
          <Link to="/admin/vendors" className="mt-4 inline-block bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-md">
            Back to Vendors
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container p-6">
      {/* Alert message on success */}
      {actionSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{actionSuccess}</span>
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <div className="mb-6 flex items-center text-sm text-gray-500">
        <Link to="/admin" className="hover:text-purple-600">Dashboard</Link>
        <span className="mx-2">/</span>
        <Link to="/admin/vendors" className="hover:text-purple-600">Vendors</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">{vendor.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vendor Profile Card */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6 bg-purple-700 text-white flex justify-between items-center">
            <h1 className="text-xl font-bold">Vendor Profile</h1>
            <div className="flex space-x-2">
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                vendor.isActive ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
              }`}>
                {vendor.isActive ? 'Active' : 'Inactive'}
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                vendor.isListingActive ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-800'
              }`}>
                {vendor.isListingActive ? 'Listed' : 'Unlisted'}
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="flex items-center mb-6">
              <div className="flex-shrink-0 h-20 w-20 rounded-full bg-purple-200 flex items-center justify-center text-purple-600 text-2xl font-bold">
                {vendor.profileImage ? (
                  <img src={vendor.profileImage} alt={vendor.name} className="h-20 w-20 rounded-full object-cover" />
                ) : (
                  vendor.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-bold text-gray-900">{vendor.name}</h2>
                <div className="mt-1 text-sm text-gray-500">
                  {vendor.vendorInfo?.businessName || 'No business name'}
                </div>
                <div className={`mt-2 px-2 py-1 rounded-full text-xs font-medium inline-block ${
                  vendor.vendorInfo?.isVerified
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {vendor.vendorInfo?.isVerified ? 'Verified Vendor' : 'Unverified Vendor'}
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Contact Information</h3>
                <div className="mt-2 grid grid-cols-1 gap-2">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-900">{vendor.email}</span>
                  </div>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-gray-900">{vendor.phone || 'No phone number'}</span>
                  </div>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    {vendor.vendorInfo?.website ? (
                      <a
                        href={vendor.vendorInfo.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {vendor.vendorInfo.website.replace(/^https?:\/\//, '')}
                      </a>
                    ) : (
                      <span className="text-gray-500">No website</span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Account Details</h3>
                <div className="mt-2 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Member Since:</span>
                    <span className="text-sm text-gray-900">
                      {new Date(vendor.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Role:</span>
                    <span className="text-sm font-medium px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                      {vendor.role}
                    </span>
                  </div>
                </div>
              </div>

              {/* Admin Actions */}
              <div className="border-t pt-4 mt-4">
                <h3 className="text-sm font-medium text-gray-800 mb-4">Admin Actions</h3>
                <div className="flex flex-col space-y-3">
                  <button
                    onClick={handleStatusToggle}
                    disabled={actionLoading}
                    className={`px-4 py-2 rounded-md text-white font-medium ${
                      vendor.isActive
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-green-600 hover:bg-green-700'
                    } ${actionLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {actionLoading ? 'Processing...' : (vendor.isActive ? 'Deactivate Account' : 'Activate Account')}
                  </button>

                  <button
                    onClick={handleListingStatusToggle}
                    disabled={actionLoading}
                    className={`px-4 py-2 rounded-md text-white font-medium ${
                      vendor.isListingActive
                        ? 'bg-gray-600 hover:bg-gray-700'
                        : 'bg-blue-600 hover:bg-blue-700'
                    } ${actionLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {actionLoading
                      ? 'Processing...'
                      : (vendor.isListingActive ? 'Hide Products from Listings' : 'Show Products in Listings')}
                  </button>

                  <button
                    onClick={handleVerificationToggle}
                    disabled={actionLoading}
                    className={`px-4 py-2 rounded-md text-white font-medium ${
                      vendor.vendorInfo?.isVerified
                        ? 'bg-yellow-600 hover:bg-yellow-700'
                        : 'bg-green-600 hover:bg-green-700'
                    } ${actionLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {actionLoading
                      ? 'Processing...'
                      : (vendor.vendorInfo?.isVerified ? 'Remove Verification' : 'Verify Vendor')}
                  </button>

                  <button
                    onClick={handleImpersonate}
                    disabled={actionLoading || !vendor.isActive}
                    className={`px-4 py-2 rounded-md text-white font-medium bg-blue-600 hover:bg-blue-700 ${
                      (actionLoading || !vendor.isActive) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {actionLoading ? 'Processing...' : 'Impersonate Vendor'}
                  </button>

                  {!vendor.isActive && (
                    <p className="text-sm text-red-500 mt-2">
                      Note: You cannot impersonate an inactive vendor.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Vendor Stats and Additional Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Business Overview */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-6 bg-purple-700 text-white">
              <h2 className="text-xl font-bold">Business Overview</h2>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-medium mb-3">About the Business</h3>
              <p className="text-gray-700 mb-6">
                {vendor.vendorInfo?.businessDescription || 'No business description provided.'}
              </p>

              {vendor.vendorInfo?.categories && vendor.vendorInfo.categories.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Categories</h4>
                  <div className="flex flex-wrap gap-2">
                    {vendor.vendorInfo.categories.map((category, index) => (
                      <span key={index} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-800">
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Products</p>
                  <p className="text-xl font-bold">{vendor.stats.productCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Orders</p>
                  <p className="text-xl font-bold">{vendor.stats.orderCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Revenue</p>
                  <p className="text-xl font-bold">${vendor.stats.totalRevenue.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Important Notice about Listing Status */}
          <div className={`bg-white p-6 rounded-lg shadow-md border-l-4 ${
            vendor.isListingActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-500 bg-gray-50'
          }`}>
            <div className="flex items-start">
              <div className={`p-2 rounded-full ${
                vendor.isListingActive
                  ? 'bg-blue-200 text-blue-700'
                  : 'bg-gray-200 text-gray-700'
              } mr-4`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Product Listing Status: {vendor.isListingActive ? 'Visible' : 'Hidden'}</h3>
                <p className="text-gray-700">
                  {vendor.isListingActive
                    ? `This vendor's products are currently visible to customers on the storefront. Their products will appear in product listings, search results, and category pages.`
                    : `This vendor's products are currently hidden from customers. Their products will not appear in product listings, search results, or category pages.`}
                </p>
                <button
                  onClick={handleListingStatusToggle}
                  disabled={actionLoading}
                  className={`mt-4 px-4 py-2 rounded-md text-white font-medium ${
                    vendor.isListingActive
                      ? 'bg-gray-600 hover:bg-gray-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  } ${actionLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {actionLoading
                    ? 'Processing...'
                    : (vendor.isListingActive ? 'Hide Products from Listings' : 'Show Products in Listings')}
                </button>
              </div>
            </div>
          </div>

          {/* Action Links */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium mb-4">Related Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                to={`/admin/vendors/${vendor.id}/products`}
                className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-md"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                <span>View Vendor Products</span>
              </Link>
              <Link
                to={`/admin/vendors/${vendor.id}/orders`}
                className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-md"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span>View Vendor Orders</span>
              </Link>
              <Link
                to={`/admin/vendors/${vendor.id}/reports`}
                className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-md"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Generate Reports</span>
              </Link>
              <Link
                to={`/admin/vendors/${vendor.id}/communications`}
                className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-md"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <span>Communication History</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDetails;
