import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { getUserProfile } from '../../services/userService';
import { getOrders, OrderStatus } from '../../services/ordersService';
import { getMeasurements } from '../../services/measurementsService';
import { getSupportTickets, SupportTicketStatus } from '../../services/supportService';
import { getFavorites } from '../../services/favoritesService';
import { getCart } from '../../services/cartService';

const CustomerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Load all dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Get current user
        const user = authService.getCurrentUser();
        setUserData(user);

        if (!user) {
          setIsLoading(false);
          return;
        }

        // Load data in parallel
        const [profileData, ordersData, measurementsData, ticketsData, favoritesData, cartData] = await Promise.all([
          getUserProfile().catch(() => null),
          getOrders().catch(() => []),
          getMeasurements().catch(() => []),
          getSupportTickets().catch(() => []),
          getFavorites().catch(() => []),
          getCart()
        ]);

        setUserProfile(profileData);
        setRecentOrders(ordersData.slice(0, 3)); // Only show most recent 3
        setMeasurements(measurementsData.slice(0, 3)); // Only show most recent 3
        setSupportTickets(ticketsData.filter(ticket =>
          ticket.status !== SupportTicketStatus.CLOSED).slice(0, 2)); // Only show active ones
        setFavorites(favoritesData.slice(0, 4)); // Only show first 4
        setCartItemCount(cartData.items.reduce((sum, item) => sum + item.quantity, 0));
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Failed to load some dashboard components. Please refresh to try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Get status badge styling based on order status
  const getStatusBadgeClass = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PROCESSING:
        return 'bg-blue-100 text-blue-800';
      case OrderStatus.SHIPPED:
        return 'bg-purple-100 text-purple-800';
      case OrderStatus.DELIVERED:
        return 'bg-green-100 text-green-800';
      case OrderStatus.CANCELED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format date to display nicely
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-red"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6 bg-primary-red text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-2xl font-bold">Customer Dashboard</h1>
              <p>Welcome back, {userProfile?.firstName || userData?.name || 'Customer'}!</p>
            </div>

            {userProfile && (
              <div className="flex items-center mt-4 md:mt-0">
                {userProfile.profileImage && (
                  <img
                    src={userProfile.profileImage}
                    alt="Profile"
                    className="w-10 h-10 rounded-full border-2 border-white mr-3"
                  />
                )}
                <div className="text-sm">
                  <p>Last login: {userProfile.lastLogin ? formatDate(userProfile.lastLogin) : 'Never'}</p>
                  <Link to="/account/settings" className="text-white underline hover:no-underline">
                    Edit Profile
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dashboard Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-gray-200 border-b border-gray-200">
          <div className="p-4 text-center">
            <p className="text-2xl font-bold text-primary-red">
              {recentOrders.length}
            </p>
            <p className="text-sm text-gray-600">Recent Orders</p>
          </div>
          <div className="p-4 text-center">
            <p className="text-2xl font-bold text-primary-red">
              {measurements.length}
            </p>
            <p className="text-sm text-gray-600">Saved Measurements</p>
          </div>
          <div className="p-4 text-center">
            <p className="text-2xl font-bold text-primary-red">
              {favorites.length}
            </p>
            <p className="text-sm text-gray-600">Favorites</p>
          </div>
          <div className="p-4 text-center">
            <p className="text-2xl font-bold text-primary-red">
              {cartItemCount}
            </p>
            <p className="text-sm text-gray-600">Cart Items</p>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Recent Orders */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 h-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Recent Orders</h2>
                <Link to="/account/orders" className="text-primary-red hover:underline text-sm">
                  View All
                </Link>
              </div>

              {recentOrders.length > 0 ? (
                <div className="space-y-4">
                  {recentOrders.map(order => (
                    <div key={order.id} className="border border-gray-100 rounded-md p-3 hover:bg-gray-50">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium">{order.orderNumber}</p>
                          <p className="text-xs text-gray-500">{formatDate(order.orderDate)}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeClass(order.status)}`}>
                          {order.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">
                          {order.items.length} {order.items.length === 1 ? 'item' : 'items'} • ${order.total.toFixed(2)}
                        </p>
                      </div>
                      <div className="mt-3 text-right">
                        <Link
                          to={`/account/orders/${order.id}`}
                          className="text-xs text-primary-red hover:underline"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-md">
                  <p className="text-gray-500 text-sm mb-4">You have no recent orders.</p>
                  <Link to="/products" className="text-primary-red hover:underline text-sm">
                    Shop now
                  </Link>
                </div>
              )}
            </div>

            {/* Saved Measurements */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 h-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Saved Measurements</h2>
                <Link to="/account/measurements" className="text-primary-red hover:underline text-sm">
                  View All
                </Link>
              </div>

              {measurements.length > 0 ? (
                <div className="space-y-4">
                  {measurements.map(measurement => (
                    <div key={measurement.id} className="border border-gray-100 rounded-md p-3 hover:bg-gray-50">
                      <p className="font-medium">{measurement.name}</p>
                      <p className="text-xs text-gray-500">{measurement.room}</p>
                      <div className="flex justify-between mt-2">
                        <span className="text-sm text-gray-600">Width: {measurement.width}</span>
                        <span className="text-sm text-gray-600">Height: {measurement.height}</span>
                      </div>
                      <div className="mt-3 text-right">
                        <Link
                          to={`/product/configure/product-1?width=${measurement.width}&height=${measurement.height}`}
                          className="text-xs text-primary-red hover:underline"
                        >
                          Use for Order
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-md">
                  <p className="text-gray-500 text-sm mb-4">No saved measurements found.</p>
                  <Link to="/measure-install" className="text-primary-red hover:underline text-sm">
                    Learn to measure
                  </Link>
                </div>
              )}
            </div>

            {/* Support & Account */}
            <div className="space-y-6">
              {/* Support Tickets */}
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Support</h2>
                  <Link to="/account/support" className="text-primary-red hover:underline text-sm">
                    View All
                  </Link>
                </div>

                {supportTickets.length > 0 ? (
                  <div className="space-y-3">
                    {supportTickets.map(ticket => (
                      <div key={ticket.id} className="border border-gray-100 rounded-md p-3 hover:bg-gray-50">
                        <div className="flex justify-between">
                          <p className="font-medium text-sm">{ticket.subject}</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            ticket.status === SupportTicketStatus.OPEN ? 'bg-blue-100 text-blue-800' :
                            ticket.status === SupportTicketStatus.IN_PROGRESS ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {ticket.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{formatDate(ticket.updatedAt)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 bg-gray-50 rounded-md">
                    <p className="text-gray-500 text-sm">No active support tickets.</p>
                  </div>
                )}

                <div className="mt-4">
                  <button
                    onClick={() => navigate('/account/support/new')}
                    className="w-full px-4 py-2 bg-primary-red text-white text-sm rounded-md hover:bg-red-700 transition"
                  >
                    Create Support Ticket
                  </button>
                </div>
              </div>

              {/* Account Details */}
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h2 className="text-lg font-semibold mb-4">Account Details</h2>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Name:</span> {userProfile?.name || userData?.name}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Email:</span> {userProfile?.email || userData?.email}
                  </p>
                  {userProfile?.phoneNumber && (
                    <p className="text-sm">
                      <span className="font-medium">Phone:</span> {userProfile.phoneNumber}
                    </p>
                  )}
                  <p className="text-sm">
                    <span className="font-medium">Account Since:</span> {userProfile?.createdAt ? formatDate(userProfile.createdAt) : 'N/A'}
                  </p>
                </div>
                <div className="mt-4">
                  <Link
                    to="/account/settings"
                    className="text-primary-red hover:underline text-sm flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Update details
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link to="/products" className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg text-center transition">
                <div className="text-primary-red mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <span className="text-sm font-medium">Shop Products</span>
              </Link>

              <Link to="/account/favorites" className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg text-center transition">
                <div className="text-primary-red mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <span className="text-sm font-medium">Favorites</span>
              </Link>

              <Link to="/order-tracking" className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg text-center transition">
                <div className="text-primary-red mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <span className="text-sm font-medium">Track Orders</span>
              </Link>

              <Link to="/create-estimate" className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg text-center transition">
                <div className="text-primary-red mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-sm font-medium">Get Estimate</span>
              </Link>
            </div>
          </div>

          {/* Favorites Preview */}
          {favorites.length > 0 && (
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Your Favorites</h2>
                <Link to="/account/favorites" className="text-primary-red hover:underline text-sm">
                  View All
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {favorites.map(favorite => (
                  <div key={favorite.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition">
                    <div className="aspect-w-1 aspect-h-1 bg-gray-100">
                      {favorite.thumbnail ? (
                        <img
                          src={favorite.thumbnail}
                          alt={favorite.productTitle}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-medium truncate">{favorite.productTitle}</p>
                      <p className="text-xs text-gray-500">{favorite.colorName}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {favorite.width}" × {favorite.height}"
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
