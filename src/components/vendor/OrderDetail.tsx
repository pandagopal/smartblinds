import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getVendorOrderById, updateVendorOrderStatus, VendorOrder, VendorOrderStatus } from '../../services/vendorOrderService';
import ShippingManager from './ShippingManager';

const OrderDetail: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<VendorOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'production' | 'shipping'>('details');

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!orderId) {
        throw new Error('Order ID is required');
      }

      const orderData = await getVendorOrderById(orderId);
      setOrder(orderData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load order');
      console.error('Error loading order:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: 'details' | 'production' | 'shipping') => {
    setActiveTab(tab);
  };

  const handleStatusUpdate = async (newStatus: VendorOrderStatus) => {
    if (!order) return;

    try {
      await updateVendorOrderStatus(order.id, newStatus);
      loadOrder(); // Refresh order data
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status');
    }
  };

  const getStatusBadge = (status: VendorOrderStatus) => {
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
      <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusColor(status)}`}>
        {status}
      </span>
    );
  };

  // Determine next possible status for buttons
  const getNextStatuses = (currentStatus: VendorOrderStatus): VendorOrderStatus[] => {
    const statusFlow: Record<VendorOrderStatus, VendorOrderStatus[]> = {
      [VendorOrderStatus.ORDER_RECEIVED]: [VendorOrderStatus.IN_PRODUCTION],
      [VendorOrderStatus.IN_PRODUCTION]: [VendorOrderStatus.QUALITY_CHECK],
      [VendorOrderStatus.QUALITY_CHECK]: [VendorOrderStatus.SHIPPED],
      [VendorOrderStatus.SHIPPED]: [VendorOrderStatus.DELIVERED],
      [VendorOrderStatus.DELIVERED]: []
    };

    return statusFlow[currentStatus] || [];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <h3 className="text-lg font-medium text-red-800">Error</h3>
        <p className="mt-2 text-red-700">{error}</p>
        <button
          onClick={loadOrder}
          className="mt-3 bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-yellow-50 p-4 rounded-md">
        <h3 className="text-lg font-medium text-yellow-800">Order Not Found</h3>
        <p className="mt-2 text-yellow-700">The requested order could not be found or you don't have permission to view it.</p>
        <Link
          to="/vendor/orders"
          className="mt-3 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Return to Orders
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Order: {order.orderNumber}</h1>
          <p className="text-gray-600">
            {new Date(order.orderDate).toLocaleDateString()} •
            {order.items.length} product(s) •
            ${order.total.toFixed(2)}
          </p>
        </div>
        <Link
          to="/vendor/orders"
          className="mt-2 md:mt-0 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Orders
        </Link>
      </div>

      {/* Status Bar */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-wrap items-center justify-between">
          <div className="flex items-center mb-3 md:mb-0">
            <span className="font-medium text-gray-700 mr-3">Status:</span>
            {getStatusBadge(order.status)}
          </div>

          <div className="flex flex-wrap gap-2">
            {getNextStatuses(order.status).map(status => (
              <button
                key={status}
                onClick={() => handleStatusUpdate(status)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
              >
                Mark as {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => handleTabChange('details')}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === 'details'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              Order Details
            </button>
            <button
              onClick={() => handleTabChange('production')}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === 'production'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              Production Info
            </button>
            <button
              onClick={() => handleTabChange('shipping')}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === 'shipping'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              Shipping & Delivery
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow">
        {activeTab === 'details' && (
          <div className="p-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Order Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Order Information</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Order Number</p>
                      <p className="font-medium">{order.orderNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Order Date</p>
                      <p className="font-medium">{new Date(order.orderDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Manufacturing ID</p>
                      <p className="font-medium">{order.manufacturingId || 'Not Assigned'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Amount</p>
                      <p className="font-medium">${order.total.toFixed(2)}</p>
                    </div>
                  </div>
                  {order.customerNotes && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-500">Customer Notes</p>
                      <p className="mt-1 p-2 bg-white rounded border border-gray-200">{order.customerNotes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Customer & Shipping Information</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Ship To</p>
                    <p className="font-medium">{order.shippingAddress.name}</p>
                    <p className="text-sm text-gray-700">{order.shippingAddress.street}</p>
                    <p className="text-sm text-gray-700">
                      {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                    </p>
                    <p className="text-sm text-gray-700">{order.shippingAddress.country}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Shipping Method</p>
                    <p className="font-medium">{order.shippingMethod || 'Standard'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Ordered Items</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dimensions
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Options
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {order.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {item.image && (
                              <div className="flex-shrink-0 h-10 w-10 mr-4">
                                <img className="h-10 w-10 object-cover rounded" src={item.image} alt={item.productName} />
                              </div>
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">{item.productName}</div>
                              <div className="text-sm text-gray-500">Qty: {item.quantity}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {item.width}" × {item.height}"
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {Object.entries(item.options).map(([key, value]) => (
                              <div key={key} className="mb-1">
                                <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}: </span>
                                <span>{value}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          ${(item.price * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                        Subtotal:
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                        ${order.subtotal.toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                        Shipping:
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                        ${order.shippingCost.toFixed(2)}
                      </td>
                    </tr>
                    {order.discount && order.discount > 0 && (
                      <tr>
                        <td colSpan={3} className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                          Discount:
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-medium text-green-600">
                          -${order.discount.toFixed(2)}
                        </td>
                      </tr>
                    )}
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                        Tax:
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                        ${order.tax.toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                        Total:
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                        ${order.total.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'production' && (
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Production Information</h3>
            <div className="bg-yellow-50 border border-yellow-200 p-4 mb-6 rounded-md text-center">
              <p className="text-yellow-700">Production management features are coming soon.</p>
            </div>
            {/* Production Management Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-md p-4">
                <h4 className="font-medium text-gray-900 mb-2">Manufacturing Details</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Manufacturing ID:</span>
                    <span className="text-sm font-medium">{order.manufacturingId || 'Not assigned'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Production Status:</span>
                    <span className="text-sm font-medium">{order.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Assigned Batch:</span>
                    <span className="text-sm font-medium">Not assigned</span>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-md p-4">
                <h4 className="font-medium text-gray-900 mb-2">Quality Control</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">QC Inspector:</span>
                    <span className="text-sm font-medium">Not assigned</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">QC Status:</span>
                    <span className="text-sm font-medium">Pending</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">QC Date:</span>
                    <span className="text-sm font-medium">-</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'shipping' && (
          <ShippingManager
            orderId={order.id}
            onShippingUpdated={loadOrder}
          />
        )}
      </div>
    </div>
  );
};

export default OrderDetail;
