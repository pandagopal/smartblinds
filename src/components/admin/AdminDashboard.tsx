import React, { useState } from 'react';
import { Routes, Route, NavLink, useNavigate, Navigate } from 'react-router-dom';
import VendorManagement from './VendorManagement';
import VendorDetails from './VendorDetails';
import ShippingDashboard from './ShippingDashboard';
import BatchShipping from './BatchShipping';

const AdminDashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`bg-white shadow-lg ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-auto md:h-auto`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Admin Portal</h2>
            <button
              className="text-gray-600 md:hidden"
              onClick={toggleSidebar}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>
          <nav className="space-y-2">
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) =>
                `block px-4 py-2 rounded-md ${
                  isActive
                    ? 'bg-primary-red text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
              onClick={() => setSidebarOpen(false)}
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/admin/orders"
              className={({ isActive }) =>
                `block px-4 py-2 rounded-md ${
                  isActive
                    ? 'bg-primary-red text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
              onClick={() => setSidebarOpen(false)}
            >
              Orders
            </NavLink>
            <NavLink
              to="/admin/products"
              className={({ isActive }) =>
                `block px-4 py-2 rounded-md ${
                  isActive
                    ? 'bg-primary-red text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
              onClick={() => setSidebarOpen(false)}
            >
              Products
            </NavLink>
            <NavLink
              to="/admin/vendors"
              className={({ isActive }) =>
                `block px-4 py-2 rounded-md ${
                  isActive
                    ? 'bg-primary-red text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
              onClick={() => setSidebarOpen(false)}
            >
              Vendors
            </NavLink>
            <NavLink
              to="/admin/customers"
              className={({ isActive }) =>
                `block px-4 py-2 rounded-md ${
                  isActive
                    ? 'bg-primary-red text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
              onClick={() => setSidebarOpen(false)}
            >
              Customers
            </NavLink>
            <div className="py-1 border-b border-gray-200"></div>
            <NavLink
              to="/admin/shipping-dashboard"
              className={({ isActive }) =>
                `block px-4 py-2 rounded-md ${
                  isActive
                    ? 'bg-primary-red text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
              onClick={() => setSidebarOpen(false)}
            >
              Shipping Dashboard
            </NavLink>
            <NavLink
              to="/admin/batch-shipping"
              className={({ isActive }) =>
                `block px-4 py-2 rounded-md ${
                  isActive
                    ? 'bg-primary-red text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
              onClick={() => setSidebarOpen(false)}
            >
              Batch Shipping
            </NavLink>
            <NavLink
              to="/admin/shipments"
              className={({ isActive }) =>
                `block px-4 py-2 rounded-md ${
                  isActive
                    ? 'bg-primary-red text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
              onClick={() => setSidebarOpen(false)}
            >
              All Shipments
            </NavLink>
            <NavLink
              to="/admin/shipping-exceptions"
              className={({ isActive }) =>
                `block px-4 py-2 rounded-md ${
                  isActive
                    ? 'bg-primary-red text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
              onClick={() => setSidebarOpen(false)}
            >
              Shipping Exceptions
            </NavLink>
            <div className="py-1 border-b border-gray-200"></div>
            <NavLink
              to="/admin/reports"
              className={({ isActive }) =>
                `block px-4 py-2 rounded-md ${
                  isActive
                    ? 'bg-primary-red text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
              onClick={() => setSidebarOpen(false)}
            >
              Reports
            </NavLink>
            <NavLink
              to="/admin/settings"
              className={({ isActive }) =>
                `block px-4 py-2 rounded-md ${
                  isActive
                    ? 'bg-primary-red text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
              onClick={() => setSidebarOpen(false)}
            >
              Settings
            </NavLink>
          </nav>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {/* Top header */}
        <header className="bg-white shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center">
              <button
                className="text-gray-600 md:hidden mr-4"
                onClick={toggleSidebar}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  ></path>
                </svg>
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                Admin Dashboard
              </h1>
            </div>
            <div>
              <button
                onClick={() => navigate('/')}
                className="text-gray-700 hover:text-gray-900"
              >
                Exit Admin
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route
              path="/"
              element={<Navigate to="/admin/dashboard" replace />}
            />
            <Route path="/dashboard" element={<div>Dashboard Content</div>} />
            <Route path="/orders" element={<div>Orders Management</div>} />
            <Route path="/products" element={<div>Products Management</div>} />
            <Route path="/vendors" element={<VendorManagement />} />
            <Route path="/vendors/:id" element={<VendorDetails />} />
            <Route path="/customers" element={<div>Customers Management</div>} />
            <Route path="/reports" element={<div>Reports</div>} />
            <Route path="/settings" element={<div>Settings</div>} />

            {/* Shipping Routes */}
            <Route path="/shipping-dashboard" element={<ShippingDashboard />} />
            <Route path="/batch-shipping" element={<BatchShipping />} />
            <Route path="/shipments" element={<div>All Shipments</div>} />
            <Route path="/shipping-exceptions" element={<div>Shipping Exceptions</div>} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
