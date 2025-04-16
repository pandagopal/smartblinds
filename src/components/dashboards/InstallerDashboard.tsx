import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useNavigate, Navigate } from 'react-router-dom';
import { authService } from '../../services/authService';

// Placeholder component for Installer Dashboard
const InstallerDashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || !authService.isInstaller()) {
      navigate('/signin');
      return;
    }
    setUserInfo(currentUser);
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
            <h2 className="text-2xl font-bold">Installer Portal</h2>
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
                  {userInfo.name?.charAt(0) || 'I'}
                </div>
                <div>
                  <div className="font-medium">{userInfo.name}</div>
                  <div className="text-sm text-gray-500">
                    {userInfo.employeeInfo?.serviceArea || 'Installer'}
                  </div>
                </div>
              </div>
            </div>
          )}

          <nav className="space-y-2">
            <NavLink
              to="/installer/dashboard"
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
              to="/installer/schedule"
              className={({ isActive }) =>
                `block px-4 py-2 rounded-md ${
                  isActive
                    ? 'bg-primary-red text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
              onClick={() => setSidebarOpen(false)}
            >
              Installation Schedule
            </NavLink>
            <NavLink
              to="/installer/jobs"
              className={({ isActive }) =>
                `block px-4 py-2 rounded-md ${
                  isActive
                    ? 'bg-primary-red text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
              onClick={() => setSidebarOpen(false)}
            >
              Jobs
            </NavLink>
            <NavLink
              to="/installer/completed"
              className={({ isActive }) =>
                `block px-4 py-2 rounded-md ${
                  isActive
                    ? 'bg-primary-red text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
              onClick={() => setSidebarOpen(false)}
            >
              Completed Installations
            </NavLink>
            <div className="py-1 border-b border-gray-200"></div>
            <NavLink
              to="/installer/settings"
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
                Installer Dashboard
              </h1>
            </div>
            <div>
              <button
                onClick={() => navigate('/')}
                className="text-gray-700 hover:text-gray-900"
              >
                Exit Installer Portal
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route
              path="/"
              element={<Navigate to="/installer/dashboard" replace />}
            />
            <Route path="/dashboard" element={
              <div>
                <h2 className="text-xl font-semibold mb-4">Welcome to the Installer Dashboard</h2>
                <p className="text-gray-600 mb-6">This dashboard provides a summary of your upcoming installations and completed jobs.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="text-primary-red font-medium text-sm mb-1">Jobs Today</div>
                    <div className="text-2xl font-bold mb-2">2</div>
                    <div className="text-xs text-gray-500">Next: Wilson Residence at 2:00 PM</div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="text-primary-red font-medium text-sm mb-1">This Week</div>
                    <div className="text-2xl font-bold mb-2">8</div>
                    <div className="text-xs text-gray-500">3 installations, 5 measurements</div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="text-primary-red font-medium text-sm mb-1">Completed This Month</div>
                    <div className="text-2xl font-bold mb-2">12</div>
                    <div className="text-xs text-gray-500">100% on-time completion</div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="text-primary-red font-medium text-sm mb-1">Customer Rating</div>
                    <div className="text-2xl font-bold mb-2">4.9/5</div>
                    <div className="text-xs text-gray-500">Based on 24 reviews</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Today's Schedule</h3>
                    <div className="space-y-4">
                      <div className="border-l-4 border-blue-500 pl-4 py-2">
                        <div className="font-medium">Wilson Residence</div>
                        <div className="text-sm text-gray-600">Measurement - 10:00 AM to 11:30 AM</div>
                        <div className="text-sm text-gray-600">123 Main St, Anytown</div>
                      </div>
                      <div className="border-l-4 border-green-500 pl-4 py-2">
                        <div className="font-medium">Thompson Residence</div>
                        <div className="text-sm text-gray-600">Installation - 2:00 PM to 5:00 PM</div>
                        <div className="text-sm text-gray-600">456 Oak Ave, Sometown</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Job Materials</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                        <div>
                          <div className="font-medium">Thompson Residence</div>
                          <div className="text-sm text-gray-600">3 Cellular Shades, 2 Roller Blinds</div>
                        </div>
                        <div>
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Ready for Pickup</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                        <div>
                          <div className="font-medium">Garcia Residence</div>
                          <div className="text-sm text-gray-600">6 Plantation Shutters</div>
                        </div>
                        <div>
                          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">In Production</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            } />
            <Route path="/schedule" element={<div>Installation Schedule</div>} />
            <Route path="/jobs" element={<div>Jobs</div>} />
            <Route path="/completed" element={<div>Completed Installations</div>} />
            <Route path="/settings" element={<div>Settings</div>} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default InstallerDashboard;
