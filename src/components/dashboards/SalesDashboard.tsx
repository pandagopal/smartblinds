import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useNavigate, Navigate } from 'react-router-dom';
import { authService } from '../../services/authService';

// Import components
import QuotingInterface from '../sales/QuotingInterface';
import AppointmentCalendar from '../sales/AppointmentCalendar';
import CustomerManagement from '../sales/CustomerManagement';
import SalesReports from '../sales/SalesReports';

const SalesDashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || !authService.isSalesPerson()) {
      // For demo purposes, we'll skip this check since we don't have a login system yet
      // navigate('/signin');
      // return;
    }
    setUserInfo(currentUser || {
      name: 'Sarah Parker',
      employeeInfo: {
        territory: 'Northeast Region'
      }
    });
  }, [navigate]);

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
            <h2 className="text-2xl font-bold">Sales Portal</h2>
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

          {userInfo && (
            <div className="mb-6 pb-6 border-b border-gray-200">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-primary-red text-white flex items-center justify-center mr-3">
                  {userInfo.name?.charAt(0) || 'S'}
                </div>
                <div>
                  <div className="font-medium">{userInfo.name}</div>
                  <div className="text-sm text-gray-500">
                    {userInfo.employeeInfo?.territory || 'Sales Representative'}
                  </div>
                </div>
              </div>
            </div>
          )}

          <nav className="space-y-2">
            <NavLink
              to="/sales/dashboard"
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
              to="/sales/quotes"
              className={({ isActive }) =>
                `block px-4 py-2 rounded-md ${
                  isActive
                    ? 'bg-primary-red text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
              onClick={() => setSidebarOpen(false)}
            >
              Create Quotes
            </NavLink>
            <NavLink
              to="/sales/appointments"
              className={({ isActive }) =>
                `block px-4 py-2 rounded-md ${
                  isActive
                    ? 'bg-primary-red text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
              onClick={() => setSidebarOpen(false)}
            >
              Appointments
            </NavLink>
            <NavLink
              to="/sales/customers"
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
              to="/sales/reports"
              className={({ isActive }) =>
                `block px-4 py-2 rounded-md ${
                  isActive
                    ? 'bg-primary-red text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
              onClick={() => setSidebarOpen(false)}
            >
              Sales Reports
            </NavLink>
            <NavLink
              to="/sales/settings"
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
                Sales Dashboard
              </h1>
            </div>
            <div>
              <button
                onClick={() => navigate('/')}
                className="text-gray-700 hover:text-gray-900"
              >
                Exit Sales Portal
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route
              path="/"
              element={<Navigate to="/sales/dashboard" replace />}
            />
            <Route path="/dashboard" element={
              <div>
                <h2 className="text-xl font-semibold mb-4">Welcome to the Sales Dashboard</h2>
                <p className="text-gray-600 mb-6">This dashboard provides a summary of your sales performance and upcoming appointments.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="text-primary-red font-medium text-sm mb-1">Open Quotes</div>
                    <div className="text-2xl font-bold mb-2">24</div>
                    <div className="text-xs text-gray-500">12 require follow-up</div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="text-primary-red font-medium text-sm mb-1">Appointments Today</div>
                    <div className="text-2xl font-bold mb-2">3</div>
                    <div className="text-xs text-gray-500">Next: Johnson Residence at 2:00 PM</div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="text-primary-red font-medium text-sm mb-1">Monthly Sales</div>
                    <div className="text-2xl font-bold mb-2">$12,345</div>
                    <div className="text-xs text-gray-500">72% of monthly target</div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="text-primary-red font-medium text-sm mb-1">Conversion Rate</div>
                    <div className="text-2xl font-bold mb-2">68%</div>
                    <div className="text-xs text-gray-500">+5% over last month</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-gray-800">Recent Quotes</h3>
                      <NavLink
                        to="/sales/quotes"
                        className="text-sm text-primary-red hover:text-red-700"
                      >
                        View All
                      </NavLink>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                        <div>
                          <div className="font-medium">Johnson Family</div>
                          <div className="text-sm text-gray-500">3 items - Cellular Shades</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">$2,450.00</div>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Sent</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                        <div>
                          <div className="font-medium">Garcia Residence</div>
                          <div className="text-sm text-gray-500">6 items - Plantation Shutters</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">$3,200.00</div>
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Draft</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-gray-800">Upcoming Appointments</h3>
                      <NavLink
                        to="/sales/appointments"
                        className="text-sm text-primary-red hover:text-red-700"
                      >
                        View Calendar
                      </NavLink>
                    </div>
                    <div className="space-y-4">
                      <div className="border-l-4 border-blue-500 pl-4 py-2">
                        <div className="flex justify-between">
                          <div className="font-medium">Smith Residence</div>
                          <div className="text-sm text-gray-500">Today, 2:00 PM</div>
                        </div>
                        <div className="text-sm text-gray-600">Initial Consultation</div>
                      </div>
                      <div className="border-l-4 border-green-500 pl-4 py-2">
                        <div className="flex justify-between">
                          <div className="font-medium">Thompson Family</div>
                          <div className="text-sm text-gray-500">Tomorrow, 10:00 AM</div>
                        </div>
                        <div className="text-sm text-gray-600">Measurement</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            } />
            <Route path="/quotes" element={<QuotingInterface />} />
            <Route path="/quotes/new" element={<QuotingInterface isNew={true} />} />
            <Route path="/quotes/:id" element={<QuotingInterface />} />
            <Route path="/appointments" element={<AppointmentCalendar />} />
            <Route path="/customers/*" element={<CustomerManagement />} />
            <Route path="/reports" element={<SalesReports />} />
            <Route path="/settings" element={
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Settings</h2>
                <p className="text-gray-600">The settings page is under development.</p>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default SalesDashboard;
