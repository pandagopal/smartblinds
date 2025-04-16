import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';

interface Vendor {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
  is_active: boolean;
  is_listing_active: boolean;
  vendor_info: {
    businessName: string;
    businessDescription: string;
    website: string;
    isVerified: boolean;
    categories: string[];
    joinDate: string;
  };
}

const VendorManagement: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState('');
  const [listingStatusFilter, setListingStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    total: 0
  });

  const navigate = useNavigate();

  // Fetch vendors with filters
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setLoading(true);
        const result = await adminService.getVendors(
          page,
          limit,
          search,
          statusFilter,
          verifiedFilter,
          listingStatusFilter
        );
        setVendors(result.vendors);
        setPagination(result.pagination);
      } catch (err) {
        setError('Failed to fetch vendors');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, [page, limit, search, statusFilter, verifiedFilter, listingStatusFilter]);

  // Handle account status toggle
  const handleStatusToggle = async (vendorId: number, currentStatus: boolean) => {
    try {
      await adminService.updateVendorStatus(vendorId, !currentStatus);
      // Update the local vendor list
      setVendors(vendors.map(vendor =>
        vendor.id === vendorId ? { ...vendor, is_active: !currentStatus } : vendor
      ));
    } catch (err) {
      console.error('Failed to update vendor status:', err);
      setError('Failed to update vendor status');
    }
  };

  // Handle listing status toggle
  const handleListingStatusToggle = async (vendorId: number, currentListingStatus: boolean) => {
    try {
      await adminService.updateVendorListingStatus(vendorId, !currentListingStatus);
      // Update the local vendor list
      setVendors(vendors.map(vendor =>
        vendor.id === vendorId ? { ...vendor, is_listing_active: !currentListingStatus } : vendor
      ));
    } catch (err) {
      console.error('Failed to update vendor listing status:', err);
      setError('Failed to update vendor listing status');
    }
  };

  // Handle verification toggle
  const handleVerificationToggle = async (vendorId: number, currentVerified: boolean) => {
    try {
      await adminService.updateVendorVerification(vendorId, !currentVerified);
      // Update the local vendor list
      setVendors(vendors.map(vendor =>
        vendor.id === vendorId ? {
          ...vendor,
          vendor_info: { ...vendor.vendor_info, isVerified: !currentVerified }
        } : vendor
      ));
    } catch (err) {
      console.error('Failed to update vendor verification:', err);
      setError('Failed to update vendor verification');
    }
  };

  // Handle impersonation
  const handleImpersonate = async (vendorId: number) => {
    try {
      const impersonateData = await adminService.impersonateVendor(vendorId);
      // Store the impersonation token and redirect to vendor dashboard
      localStorage.setItem('impersonationToken', impersonateData.token);
      localStorage.setItem('impersonatedVendor', JSON.stringify(impersonateData.vendor));
      navigate('/vendor/dashboard');
    } catch (err) {
      console.error('Failed to impersonate vendor:', err);
      setError('Failed to impersonate vendor');
    }
  };

  // Apply search filter
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="container p-6">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6 bg-purple-700 text-white">
          <h1 className="text-2xl font-bold">Vendor Management</h1>
          <p>View and manage all vendors on the platform</p>
        </div>

        <div className="p-6">
          {/* Filters */}
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <form onSubmit={handleSearch} className="flex">
                  <input
                    type="text"
                    placeholder="Search vendors..."
                    className="px-4 py-2 border border-gray-300 rounded-l-md w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="bg-purple-600 text-white px-4 py-2 rounded-r-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </form>
              </div>

              {/* Account Status Filter */}
              <div>
                <select
                  className="px-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">All Account Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Verification Filter */}
              <div>
                <select
                  className="px-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={verifiedFilter}
                  onChange={(e) => {
                    setVerifiedFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">All Verification</option>
                  <option value="verified">Verified</option>
                  <option value="unverified">Unverified</option>
                </select>
              </div>

              {/* Listing Status Filter */}
              <div>
                <select
                  className="px-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={listingStatusFilter}
                  onChange={(e) => {
                    setListingStatusFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">All Listing Status</option>
                  <option value="listed">Products Listed</option>
                  <option value="unlisted">Products Unlisted</option>
                </select>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {/* Vendor Table */}
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : vendors.length === 0 ? (
            <div className="bg-gray-50 p-6 text-center rounded-md">
              <p className="text-gray-500">No vendors found matching your filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vendor
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Business
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Account Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Listing Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Verification
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Join Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {vendors.map((vendor) => (
                    <tr key={vendor.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-200 flex items-center justify-center text-purple-600 font-bold">
                            {vendor.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{vendor.name}</div>
                            <div className="text-sm text-gray-500">{vendor.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{vendor.vendor_info?.businessName || 'N/A'}</div>
                        <div className="text-sm text-gray-500">
                          {vendor.vendor_info?.website ? (
                            <a href={vendor.vendor_info.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                              {vendor.vendor_info.website.replace(/^https?:\/\//, '')}
                            </a>
                          ) : 'No website'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleStatusToggle(vendor.id, vendor.is_active)}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            vendor.is_active
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                          title={vendor.is_active ? "Click to deactivate vendor account" : "Click to activate vendor account"}
                        >
                          {vendor.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleListingStatusToggle(vendor.id, vendor.is_listing_active)}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            vendor.is_listing_active
                              ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          }`}
                          title={vendor.is_listing_active ? "Products visible on website - Click to hide" : "Products hidden from website - Click to show"}
                        >
                          {vendor.is_listing_active ? 'Listed' : 'Unlisted'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleVerificationToggle(vendor.id, vendor.vendor_info?.isVerified || false)}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            vendor.vendor_info?.isVerified
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                          }`}
                        >
                          {vendor.vendor_info?.isVerified ? 'Verified' : 'Unverified'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(vendor.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex space-x-2 justify-end">
                          <Link
                            to={`/admin/vendors/${vendor.id}`}
                            className="text-purple-600 hover:text-purple-900 bg-purple-100 p-2 rounded-md"
                            title="View Details"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </Link>
                          <button
                            onClick={() => handleImpersonate(vendor.id)}
                            className="text-blue-600 hover:text-blue-900 bg-blue-100 p-2 rounded-md"
                            title="Impersonate Vendor"
                            disabled={!vendor.is_active}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && vendors.length > 0 && (
            <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    page === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === pagination.totalPages}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    page === pagination.totalPages ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(page * limit, pagination.total)}
                    </span>{' '}
                    of <span className="font-medium">{pagination.total}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                        page === 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Previous</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    {/* Page numbers logic */}
                    {Array.from({ length: Math.min(5, pagination.totalPages) }).map((_, i) => {
                      let pageNum;

                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }

                      if (pageNum > 0 && pageNum <= pagination.totalPages) {
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              page === pageNum
                                ? 'z-10 bg-purple-50 border-purple-500 text-purple-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      }
                      return null;
                    })}

                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === pagination.totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                        page === pagination.totalPages ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Next</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorManagement;
