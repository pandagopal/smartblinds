import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getOrders, Order, OrderStatus } from '../../services/ordersService';

const OrderHistory: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateSort, setDateSort] = useState<'newest' | 'oldest'>('newest');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  const ordersPerPage = 5;

  // Load orders data
  useEffect(() => {
    const loadOrders = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const ordersData = await getOrders();
        setOrders(ordersData);
        setFilteredOrders(ordersData);
      } catch (err) {
        console.error('Error loading orders:', err);
        setError('Failed to load order history. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, []);

  // Filter and sort orders when filter/sort options or search query changes
  useEffect(() => {
    let result = [...orders];

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(order => order.status === statusFilter);
    }

    // Apply search filter (case insensitive)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(order =>
        order.orderNumber.toLowerCase().includes(query) ||
        order.items.some(item => item.productName.toLowerCase().includes(query))
      );
    }

    // Apply sort
    result.sort((a, b) => {
      const dateA = new Date(a.orderDate).getTime();
      const dateB = new Date(b.orderDate).getTime();
      return dateSort === 'newest' ? dateB - dateA : dateA - dateB;
    });

    setFilteredOrders(result);
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [orders, statusFilter, dateSort, searchQuery]);

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Format date
  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get badge class based on order status
  const getStatusBadgeClass = (status: OrderStatus): string => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
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

  // Toggle order details expansion
  const toggleOrderDetails = (orderId: string) => {
    const newExpandedOrders = new Set(expandedOrders);
    if (newExpandedOrders.has(orderId)) {
      newExpandedOrders.delete(orderId);
    } else {
      newExpandedOrders.add(orderId);
    }
    setExpandedOrders(newExpandedOrders);
  };

  // Calculate pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-red"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Order History</h2>
        <Link
          to="/products"
          className="px-4 py-2 bg-primary-red text-white rounded-md hover:bg-red-700 transition"
        >
          Shop More Products
        </Link>
      </div>

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

      {/* Filters and search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            id="search"
            placeholder="Search by order number or product name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-primary-red focus:outline-none focus:ring-primary-red"
          />
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Order Status
          </label>
          <select
            id="status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-48 rounded-md border border-gray-300 p-2 text-sm focus:border-primary-red focus:outline-none focus:ring-primary-red"
          >
            <option value="all">All Statuses</option>
            <option value={OrderStatus.PENDING}>Pending</option>
            <option value={OrderStatus.PROCESSING}>Processing</option>
            <option value={OrderStatus.SHIPPED}>Shipped</option>
            <option value={OrderStatus.DELIVERED}>Delivered</option>
            <option value={OrderStatus.CANCELED}>Canceled</option>
          </select>
        </div>

        <div>
          <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
            Sort By
          </label>
          <select
            id="sort"
            value={dateSort}
            onChange={(e) => setDateSort(e.target.value as 'newest' | 'oldest')}
            className="w-full md:w-48 rounded-md border border-gray-300 p-2 text-sm focus:border-primary-red focus:outline-none focus:ring-primary-red"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Orders list */}
      {currentOrders.length > 0 ? (
        <div className="space-y-4">
          {currentOrders.map(order => (
            <div key={order.id} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Order header */}
              <div className="bg-gray-50 p-4 flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="mb-2 md:mb-0">
                  <p className="font-medium">Order #{order.orderNumber}</p>
                  <p className="text-sm text-gray-500">{formatDate(order.orderDate)}</p>
                </div>

                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                  <span className={`text-xs px-2 py-1 rounded-full inline-block ${getStatusBadgeClass(order.status)}`}>
                    {order.status.replace(/_/g, ' ')}
                  </span>

                  <span className="text-sm font-medium">{formatCurrency(order.total)}</span>

                  <button
                    onClick={() => toggleOrderDetails(order.id)}
                    className="text-primary-red hover:text-red-700 text-sm flex items-center"
                  >
                    {expandedOrders.has(order.id) ? 'Hide' : 'View'} Details
                    <svg
                      className={`ml-1 h-4 w-4 transition-transform ${expandedOrders.has(order.id) ? 'transform rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Order details (conditionally rendered) */}
              {expandedOrders.has(order.id) && (
                <div className="p-4 border-t border-gray-200">
                  {/* Order items */}
                  <div className="mb-4">
                    <h4 className="font-medium text-sm mb-2">Items</h4>
                    <div className="divide-y divide-gray-100">
                      {order.items.map(item => (
                        <div key={item.id} className="py-3 flex flex-col md:flex-row md:items-start">
                          <div className="md:w-20 md:h-20 bg-gray-100 rounded overflow-hidden mb-2 md:mb-0 md:mr-4 flex-shrink-0">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.productName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                          </div>

                          <div className="flex-1">
                            <p className="font-medium">{item.productName}</p>
                            <div className="text-sm text-gray-600 mt-1">
                              <p>Quantity: {item.quantity}</p>
                              {(item.width && item.height) && (
                                <p>Size: {item.width}" × {item.height}"</p>
                              )}

                              {/* Display selected options */}
                              {Object.entries(item.options).length > 0 && (
                                <div className="mt-1">
                                  <p className="text-xs text-gray-500">Options:</p>
                                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1">
                                    {Object.entries(item.options).map(([key, value]) => (
                                      <p key={key} className="text-xs">
                                        <span className="font-medium">{key}:</span> {value}
                                      </p>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="text-right mt-2 md:mt-0 md:ml-4 flex-shrink-0">
                            <p className="font-medium">{formatCurrency(item.price)}</p>
                            <Link
                              to={`/products/${item.productId}`}
                              className="text-primary-red hover:underline text-xs mt-1 inline-block"
                            >
                              View Product
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Shipping info */}
                    <div>
                      <h4 className="font-medium text-sm mb-2">Shipping Information</h4>
                      <div className="text-sm">
                        <p className="font-medium">{order.shippingAddress.name}</p>
                        <p>{order.shippingAddress.street}</p>
                        <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                        <p>{order.shippingAddress.country}</p>
                        <p className="mt-2">
                          <span className="font-medium">Shipping Method:</span> {order.shippingMethod}
                        </p>

                        {/* Tracking info if available */}
                        {order.trackingInfo && (
                          <div className="mt-2">
                            <p className="font-medium">Tracking Information</p>
                            <p>Carrier: {order.trackingInfo.carrier}</p>
                            <a
                              href={order.trackingInfo.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-red hover:underline inline-block mt-1"
                            >
                              Track: {order.trackingInfo.trackingNumber}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Order totals */}
                    <div>
                      <h4 className="font-medium text-sm mb-2">Order Summary</h4>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>{formatCurrency(order.subtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Shipping:</span>
                          <span>{formatCurrency(order.shippingCost)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tax:</span>
                          <span>{formatCurrency(order.tax)}</span>
                        </div>
                        {order.discount && order.discount > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>Discount:</span>
                            <span>-{formatCurrency(order.discount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-medium text-base pt-2 border-t border-gray-200 mt-2">
                          <span>Total:</span>
                          <span>{formatCurrency(order.total)}</span>
                        </div>
                      </div>

                      {/* Call to action buttons */}
                      <div className="mt-4 flex flex-col md:flex-row gap-2">
                        <a
                          href={`/account/orders/${order.id}/invoice`}
                          className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 text-center"
                        >
                          View Invoice
                        </a>
                        <Link
                          to={`/account/support/new?orderId=${order.id}`}
                          className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 text-center"
                        >
                          Get Help
                        </Link>
                        {(order.status === OrderStatus.PENDING || order.status === OrderStatus.PROCESSING) && (
                          <button
                            className="px-3 py-1.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded hover:bg-red-100 text-center"
                            onClick={() => {
                              if (window.confirm('Are you sure you want to cancel this order?')) {
                                // Implement cancel functionality with the orders service
                                alert('Order cancellation functionality will be implemented here');
                              }
                            }}
                          >
                            Cancel Order
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <svg
            className="mx-auto h-16 w-16 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No orders found</h3>
          {searchQuery || statusFilter !== 'all' ? (
            <p className="text-gray-500">
              Try adjusting your search or filter criteria
              <button
                className="ml-2 text-primary-red hover:text-red-700"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
              >
                Reset Filters
              </button>
            </p>
          ) : (
            <p className="text-gray-500 mb-4">You haven't placed any orders yet</p>
          )}
          {!searchQuery && statusFilter === 'all' && (
            <Link
              to="/products"
              className="inline-block px-4 py-2 bg-primary-red text-white rounded-md hover:bg-red-700 transition mt-4"
            >
              Start Shopping
            </Link>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <nav className="inline-flex shadow-sm rounded-md">
            <button
              onClick={() => paginate(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium
                ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'}`}
            >
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
              <button
                key={number}
                onClick={() => paginate(number)}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium
                  ${number === currentPage
                    ? 'z-10 border-primary-red text-primary-red'
                    : 'text-gray-700 hover:bg-gray-50'}`}
              >
                {number}
              </button>
            ))}

            <button
              onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium
                ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'}`}
            >
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
