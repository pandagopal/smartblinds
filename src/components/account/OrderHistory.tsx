import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface OrderItem {
  id: string;
  productName: string;
  price: number;
  quantity: number;
  image: string;
  options: Record<string, string>;
}

interface Order {
  id: string;
  orderNumber: string;
  date: Date;
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  total: number;
  items: OrderItem[];
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDelivery?: Date;
}

interface OrderHistoryProps {
  userId: string;
}

// Mock order data
const mockOrders: Order[] = [
  {
    id: 'order1',
    orderNumber: '10057429',
    date: new Date('2024-03-15'),
    status: 'Delivered',
    total: 345.98,
    trackingNumber: '1Z9999999999999999',
    trackingUrl: 'https://www.ups.com/track?loc=en_US&tracknum=1Z9999999999999999',
    estimatedDelivery: new Date('2024-03-22'),
    items: [
      {
        id: 'item1',
        productName: 'Energy-Efficient Cellular Shades',
        price: 199.98,
        quantity: 1,
        image: 'https://www.sunburstshutters.com/corporate/uploads/grabercellularshades22.jpg',
        options: {
          'Color': 'White',
          'Mount Type': 'Inside Mount',
          'Cell Type': 'Double Cell',
          'Control Type': 'Cordless'
        }
      },
      {
        id: 'item2',
        productName: 'Premium Faux Wood Blinds',
        price: 146.00,
        quantity: 2,
        image: 'https://www.blinds.com/product-images/d1a27513-bfda-e611-9468-0a986990730e.jpg',
        options: {
          'Color': 'Espresso',
          'Mount Type': 'Outside Mount',
          'Control Type': 'Standard Cord'
        }
      }
    ]
  },
  {
    id: 'order2',
    orderNumber: '10057891',
    date: new Date('2024-01-28'),
    status: 'Delivered',
    total: 278.50,
    trackingNumber: '1Z9999999999999998',
    trackingUrl: 'https://www.ups.com/track?loc=en_US&tracknum=1Z9999999999999998',
    estimatedDelivery: new Date('2024-02-05'),
    items: [
      {
        id: 'item3',
        productName: 'Premium Day/Night Cellular Shades',
        price: 278.50,
        quantity: 1,
        image: 'https://cdn11.bigcommerce.com/s-9mn6q7egz3/images/stencil/1280x1280/products/120/1037/CellularDayNightHoneycomb_SatinWhite_ClosedBottom__62348.1594414881.jpg',
        options: {
          'Color': 'White/White',
          'Mount Type': 'Inside Mount',
          'Control Type': 'Cordless',
          'Operating System': 'Top Down/Bottom Up'
        }
      }
    ]
  },
  {
    id: 'order3',
    orderNumber: '10058192',
    date: new Date('2024-04-03'),
    status: 'Processing',
    total: 199.99,
    estimatedDelivery: new Date('2024-04-15'),
    items: [
      {
        id: 'item4',
        productName: 'Cordless Light Filtering Cellular Shades',
        price: 99.99,
        quantity: 2,
        image: 'https://m.media-amazon.com/images/I/71XLgwznQuL.jpg',
        options: {
          'Color': 'Cream',
          'Mount Type': 'Inside Mount',
          'Width Options': '30-36 inches'
        }
      }
    ]
  }
];

const OrderHistory: React.FC<OrderHistoryProps> = ({ userId }) => {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [orders] = useState<Order[]>(mockOrders);

  const toggleOrderDetails = (orderId: string) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'Processing':
        return 'bg-blue-100 text-blue-800';
      case 'Shipped':
        return 'bg-yellow-100 text-yellow-800';
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Order History</h2>
      </div>

      {orders.length === 0 ? (
        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <p className="text-lg text-gray-600 mb-4">You haven't placed any orders yet.</p>
          <Link to="/" className="px-6 py-2 bg-primary-red text-white rounded-md inline-block hover:bg-red-700 transition">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Order Header */}
              <div className="bg-gray-50 p-4 border-b border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <span className="block text-sm text-gray-500">Order #</span>
                    <span className="font-medium">{order.orderNumber}</span>
                  </div>
                  <div>
                    <span className="block text-sm text-gray-500">Order Date</span>
                    <span className="font-medium">{order.date.toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="block text-sm text-gray-500">Total</span>
                    <span className="font-medium">${order.total.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="block text-sm text-gray-500">Status</span>
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4">
                  <button
                    onClick={() => toggleOrderDetails(order.id)}
                    className="text-sm text-primary-red hover:text-red-700 font-medium focus:outline-none"
                  >
                    {expandedOrder === order.id ? 'Hide Details' : 'View Details'}
                  </button>
                  {order.status === 'Shipped' && order.trackingNumber && (
                    <a
                      href={order.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm bg-primary-red text-white px-3 py-1 rounded hover:bg-red-700 transition"
                    >
                      Track Package
                    </a>
                  )}
                </div>
              </div>

              {/* Order Details */}
              {expandedOrder === order.id && (
                <div className="p-4">
                  {/* Shipping Information */}
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-2">Shipping Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Estimated Delivery</p>
                        <p className="font-medium">
                          {order.estimatedDelivery
                            ? order.estimatedDelivery.toLocaleDateString()
                            : 'To be determined'}
                        </p>
                      </div>
                      {order.trackingNumber && (
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Tracking Number</p>
                          <p className="font-medium">{order.trackingNumber}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Items */}
                  <h3 className="text-lg font-medium mb-2">Items</h3>
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex flex-col md:flex-row border-b border-gray-200 pb-4">
                        <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                          <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
                        </div>
                        <div className="md:ml-4 flex-grow mt-2 md:mt-0">
                          <h4 className="font-medium text-gray-900">{item.productName}</h4>
                          <div className="flex flex-wrap gap-x-4 mt-1">
                            <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                            <p className="text-sm text-gray-600">Price: ${item.price.toFixed(2)}</p>
                          </div>
                          <div className="mt-2">
                            <h5 className="text-xs text-gray-500 mb-1">Options</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 text-xs text-gray-700">
                              {Object.entries(item.options).map(([key, value]) => (
                                <div key={key}>
                                  <span className="font-medium">{key}:</span> {value}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="mt-6 flex justify-end space-x-4">
                    {order.status === 'Delivered' && (
                      <button className="text-sm border border-primary-red text-primary-red px-3 py-1 rounded hover:bg-red-50 transition">
                        Leave a Review
                      </button>
                    )}
                    <button className="text-sm bg-gray-200 text-gray-800 px-3 py-1 rounded hover:bg-gray-300 transition">
                      Reorder
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
