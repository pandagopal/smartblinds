import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Order, OrderStatus } from '../services/ordersService';
import { Shipment, ShippingStatus } from '../services/shippingService';

// Mock data - in real application, would fetch from API
const order: Order = {
  id: 'order1',
  userId: 'user1',
  orderNumber: 'SB-2303151001',
  orderDate: new Date('2023-03-15'),
  status: OrderStatus.SHIPPED,
  items: [
    {
      id: 'item1',
      productId: 'product-1',
      productName: 'Deluxe Cellular Shades',
      price: 129.99,
      quantity: 2,
      width: 36,
      height: 48,
      options: {
        color: 'white',
        opacity: 'light-filtering',
        controlType: 'cordless'
      },
      image: 'https://ext.same-assets.com/2035588304/3063881347.jpeg'
    }
  ],
  shippingAddress: {
    name: 'John Smith',
    street: '123 Main St',
    city: 'Anytown',
    state: 'CA',
    zipCode: '90210',
    country: 'USA'
  },
  shippingMethod: 'Standard',
  shippingCost: 12.99,
  subtotal: 259.98,
  tax: 21.84,
  discount: 25.00,
  total: 269.81,
  estimatedDeliveryDate: new Date('2023-03-25'),
  paymentMethod: 'Credit Card',
  paymentStatus: 'paid',
  trackingNumber: '1Z999AA10123456784',
  trackingUrl: 'https://www.ups.com/track?tracknum=1Z999AA10123456784'
};

// Mock shipments data - in real application, would fetch from API
const shipments: Shipment[] = [
  {
    id: 'shipment1',
    orderId: 'order1',
    carrier: 'UPS',
    serviceLevel: 'Ground',
    trackingNumber: '1Z999AA10123456784',
    trackingUrl: 'https://www.ups.com/track?tracknum=1Z999AA10123456784',
    shippingDate: new Date('2023-03-18'),
    estimatedDeliveryDate: new Date('2023-03-25'),
    status: ShippingStatus.IN_TRANSIT,
    isReturn: false,
    damagedReported: false,
    events: [
      {
        eventDate: new Date('2023-03-18T09:15:00'),
        location: 'Los Angeles, CA',
        description: 'Shipment picked up',
        status: 'in_transit'
      },
      {
        eventDate: new Date('2023-03-19T08:30:00'),
        location: 'Phoenix, AZ',
        description: 'Arrived at UPS facility',
        status: 'in_transit'
      },
      {
        eventDate: new Date('2023-03-20T12:45:00'),
        location: 'Dallas, TX',
        description: 'Departed UPS facility',
        status: 'in_transit'
      }
    ],
    notes: []
  }
];

const OrderTrackingPage: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const navigate = useNavigate();
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [orderShipments, setOrderShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API fetch for order and shipments
    const fetchOrderAndShipments = () => {
      setLoading(true);

      // Simulate API delay
      setTimeout(() => {
        try {
          // In real app, this would be an API call that fetches based on orderNumber
          if (orderNumber && orderNumber.toUpperCase() === order.orderNumber) {
            setCurrentOrder(order);
            setOrderShipments(shipments);
            setError(null);
          } else {
            setError('Order not found. Please check the order number and try again.');
            setCurrentOrder(null);
            setOrderShipments([]);
          }
        } catch (err) {
          setError('Failed to load order information. Please try again later.');
          console.error('Error fetching order:', err);
        } finally {
          setLoading(false);
        }
      }, 800); // Simulate network delay
    };

    if (orderNumber) {
      fetchOrderAndShipments();
    } else {
      setLoading(false);
    }
  }, [orderNumber]);

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'bg-blue-100 text-blue-800';
      case OrderStatus.PROCESSING:
        return 'bg-yellow-100 text-yellow-800';
      case OrderStatus.SHIPPED:
        return 'bg-green-100 text-green-800';
      case OrderStatus.DELIVERED:
        return 'bg-gray-100 text-gray-800';
      case OrderStatus.CANCELED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getShipmentStatusColor = (status: ShippingStatus) => {
    switch (status) {
      case ShippingStatus.PENDING:
        return 'bg-gray-100 text-gray-800';
      case ShippingStatus.CREATED:
        return 'bg-blue-100 text-blue-800';
      case ShippingStatus.IN_TRANSIT:
        return 'bg-yellow-100 text-yellow-800';
      case ShippingStatus.DELIVERED:
        return 'bg-green-100 text-green-800';
      case ShippingStatus.EXCEPTION:
        return 'bg-red-100 text-red-800';
      case ShippingStatus.RETURNED:
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const viewShipmentDetails = (shipmentId: string) => {
    navigate(`/account/shipments/${shipmentId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!orderNumber) {
    return (
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h1 className="text-2xl font-bold mb-6">Track Your Order</h1>

          <div className="max-w-md mx-auto">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const input = e.currentTarget.elements.namedItem('orderNumber') as HTMLInputElement;
                if (input.value.trim()) {
                  navigate(`/track-order/${input.value.trim()}`);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Order Number
                </label>
                <input
                  type="text"
                  id="orderNumber"
                  name="orderNumber"
                  placeholder="Enter your order number (e.g. SB-2303151001)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Track Order
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Have an account? <Link to="/account/orders" className="text-blue-600 hover:text-blue-800">View all your orders</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <div className="bg-red-50 p-6 rounded-lg shadow">
          <h1 className="text-xl font-bold text-red-800 mb-4">Order Tracking Error</h1>
          <p className="text-red-700 mb-6">{error}</p>
          <div className="flex space-x-4">
            <button
              onClick={() => navigate('/track-order')}
              className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded hover:bg-gray-50"
            >
              Try Another Order Number
            </button>
            <Link
              to="/contact-us"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!currentOrder) {
    return (
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <div className="bg-yellow-50 p-6 rounded-lg shadow">
          <h1 className="text-xl font-bold text-yellow-800 mb-4">Order Not Found</h1>
          <p className="text-yellow-700 mb-6">We couldn't find an order with the number {orderNumber}. Please check the order number and try again.</p>
          <button
            onClick={() => navigate('/track-order')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Back to Order Tracking
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Order: {currentOrder.orderNumber}</h1>
            <p className="text-gray-600">
              Placed on {new Date(currentOrder.orderDate).toLocaleDateString()}
            </p>
          </div>
          <div className="mt-2 md:mt-0">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentOrder.status)}`}>
              {currentOrder.status}
            </span>
          </div>
        </div>

        <div className="border-b border-gray-200 mb-6 pb-6">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Shipping Address</h3>
              <div className="bg-gray-50 p-4 rounded-md text-gray-700">
                <p className="font-medium">{currentOrder.shippingAddress.name}</p>
                <p>{currentOrder.shippingAddress.street}</p>
                <p>
                  {currentOrder.shippingAddress.city}, {currentOrder.shippingAddress.state} {currentOrder.shippingAddress.zipCode}
                </p>
                <p>{currentOrder.shippingAddress.country}</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Order Details</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Subtotal:</span>
                  <span>${currentOrder.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Shipping:</span>
                  <span>${currentOrder.shippingCost.toFixed(2)}</span>
                </div>
                {currentOrder.discount > 0 && (
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Discount:</span>
                    <span className="text-green-600">-${currentOrder.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Tax:</span>
                  <span>${currentOrder.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold pt-2 border-t border-gray-200">
                  <span>Total:</span>
                  <span>${currentOrder.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Shipments Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Shipments</h2>
          {orderShipments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tracking
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Carrier
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Shipping Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orderShipments.map((shipment) => (
                    <tr key={shipment.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {shipment.trackingNumber || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {shipment.carrier} {shipment.serviceLevel}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getShipmentStatusColor(shipment.status)}`}>
                          {shipment.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {shipment.shippingDate ? new Date(shipment.shippingDate).toLocaleDateString() : 'Pending'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => viewShipmentDetails(shipment.id!)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-gray-50 p-6 rounded-md text-center">
              <p className="text-gray-500">No shipments have been created for this order yet.</p>
            </div>
          )}
        </div>

        {/* Items Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Items</h2>
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
                    Quantity
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentOrder.items.map((item) => (
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
                          <div className="text-xs text-gray-500">
                            {Object.entries(item.options)
                              .map(([key, value]) => `${key}: ${value}`)
                              .join(' | ')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.width}" × {item.height}"
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      ${(item.price * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-600">
              Questions about your order?
              <Link to="/contact-us" className="ml-2 text-blue-600 hover:text-blue-800">
                Contact Customer Support
              </Link>
            </p>
          </div>
          <Link
            to="/track-order"
            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
          >
            Track Another Order
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;
