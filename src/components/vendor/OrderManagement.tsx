import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getVendorOrders, VendorOrder, VendorOrderStatus } from '../../services/vendorOrderService';

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<VendorOrderStatus | 'all'>('all');
  const [regionFilter, setRegionFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date' | 'status' | 'id'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: any = {};
      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }

      const ordersData = await getVendorOrders(filters);
      setOrders(ordersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Apply search filter here
    loadOrders();
  };

  const handleSort = (column: 'date' | 'status' | 'id') => {
    if (sortBy === column) {
      // Toggle direction if clicking the same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('desc'); // Default to descending for new sort column
    }
  };

  const getSortedOrders = () => {
    // Filter orders by search term
    let filteredOrders = orders;
    if (searchTerm) {
      filteredOrders = orders.filter(order =>
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.manufacturingId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items.some(item => item.productName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by region if set
    if (regionFilter) {
      filteredOrders = filteredOrders.filter(order =>
        order.shippingAddress.state.toLowerCase() === regionFilter.toLowerCase() ||
        order.shippingAddress.zipCode.startsWith(regionFilter)
      );
    }

    // Sort orders
    return filteredOrders.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'date':
          comparison = new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime();
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'id':
          comparison = a.orderNumber.localeCompare(b.orderNumber);
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  };

  const getStatusColor = (status: VendorOrderStatus) => {
    switch (status) {
      case VendorOrderStatus.ORDER_RECEIVED:
        return 'bg-blue-100 text-blue-800';
      case VendorOrderStatus.IN_PRODUCTION:
        return 'bg-yellow-100 text-yellow-800';
      case VendorOrderStatus.QUALITY_CHECK:
        return 'bg-purple-100 text-purple-800';
      case VendorOrderStatus.SHIPPED:
        return 'bg-green-100 text-green-800';
      case VendorOrderStatus.DELIVERED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Order Management</h1>
        <Link
          to="/vendor/dashboard"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Dashboard
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 shadow mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as VendorOrderStatus | 'all')}
            >
              <option value="all">All Statuses</option>
              <option value={VendorOrderStatus.ORDER_RECEIVED}>Order Received</option>
              <option value={VendorOrderStatus.IN_PRODUCTION}>In Production</option>
              <option value={VendorOrderStatus.QUALITY_CHECK}>Quality Check</option>
              <option value={VendorOrderStatus.SHIPPED}>Shipped</option>
              <option value={VendorOrderStatus.DELIVERED}>Delivered</option>
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Region</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="State or ZIP code"
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
            />
          </div>

          <div className="flex-2 min-w-[300px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Orders</label>
            <form onSubmit={handleSearch} className="flex">
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Order #, Manufacturing ID, or Product"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="p-6 text-red-600 text-center">{error}</div>
        ) : getSortedOrders().length === 0 ? (
          <div className="p-6 text-gray-500 text-center">No orders found matching your criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('id')}
                  >
                    <div className="flex items-center">
                      Order #
                      {sortBy === 'id' && (
                        <span className="ml-1">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('date')}
                  >
                    <div className="flex items-center">
                      Date
                      {sortBy === 'date' && (
                        <span className="ml-1">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Products
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center">
                      Status
                      {sortBy === 'status' && (
                        <span className="ml-1">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Manufacturing ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getSortedOrders().map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.orderNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.shippingAddress.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="max-w-xs">
                        {order.items.map((item, index) => (
                          <div key={item.id} className={index !== 0 ? 'mt-1 pt-1 border-t border-gray-200' : ''}>
                            <span className="font-medium">{item.productName}</span>
                            <div className="text-xs">
                              {item.width}"W × {item.height}"H
                              {item.quantity > 1 && ` × ${item.quantity}`}
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.manufacturingId || 'Not assigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/vendor/orders/${order.id}`}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        View
                      </Link>
                      <Link
                        to={`/vendor/orders/${order.id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderManagement;
