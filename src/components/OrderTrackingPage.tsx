import React, { useState } from 'react';

const OrderTrackingPage: React.FC = () => {
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isTracking, setIsTracking] = useState(false);
  const [trackingInfo, setTrackingInfo] = useState<any>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!orderId.trim() || !email.trim()) {
      setErrorMessage('Please enter both order number and email address.');
      return;
    }

    // For demo purposes, show a sample tracking result
    setIsTracking(true);

    // Simulate API call delay
    setTimeout(() => {
      // Sample tracking data
      if (orderId.length >= 5) {
        setTrackingInfo({
          orderNumber: orderId,
          orderDate: '2023-11-15',
          status: 'In Production',
          estimatedDelivery: '2023-12-01',
          items: [
            {
              id: 1,
              name: 'Premium Wood Blinds - 2 inch Classic',
              quantity: 2,
              status: 'In Production',
              statusDate: '2023-11-18'
            },
            {
              id: 2,
              name: 'Cordless Cellular Shades - Light Filtering',
              quantity: 1,
              status: 'Awaiting Materials',
              statusDate: '2023-11-16'
            }
          ],
          shipping: {
            method: 'Standard Ground',
            carrier: 'FedEx',
            trackingNumber: '',
            address: '123 Main St, Anytown, USA 12345'
          },
          timeline: [
            { date: '2023-11-15', status: 'Order Placed', description: 'Your order has been received and payment confirmed.' },
            { date: '2023-11-16', status: 'Order Processing', description: 'Your order is being prepared for production.' },
            { date: '2023-11-18', status: 'In Production', description: 'Your custom window treatments are being manufactured.' }
          ]
        });
        setErrorMessage('');
      } else {
        setTrackingInfo(null);
        setErrorMessage('Order not found. Please check your order number and email address.');
      }
      setIsTracking(false);
    }, 1500);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Track Your Order</h1>

      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Enter Your Order Information</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-700 mb-1">Order Number</label>
              <input
                type="text"
                id="orderNumber"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-primary-red"
                placeholder="Example: ORD123456"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-primary-red"
                placeholder="The email used for your order"
              />
            </div>

            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              className="bg-primary-red hover:bg-red-700 text-white font-medium py-2 px-4 rounded transition-colors"
              disabled={isTracking}
            >
              {isTracking ? 'Finding Your Order...' : 'Track Order'}
            </button>
          </form>
        </div>
      </div>

      {trackingInfo && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
          <div className="bg-gray-50 p-4 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center">
              <div>
                <h2 className="text-xl font-semibold">Order #{trackingInfo.orderNumber}</h2>
                <p className="text-sm text-gray-600">Placed on {trackingInfo.orderDate}</p>
              </div>
              <div className="mt-2 md:mt-0">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {trackingInfo.status}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="mb-8">
              <h3 className="font-medium text-lg mb-4">Order Timeline</h3>
              <div className="relative">
                {trackingInfo.timeline.map((event: any, index: number) => (
                  <div key={index} className="flex mb-4 relative">
                    <div className="flex flex-col items-center mr-4">
                      <div className="w-3 h-3 bg-primary-red rounded-full z-10"></div>
                      {index < trackingInfo.timeline.length - 1 && (
                        <div className="h-full w-0.5 bg-gray-200 absolute top-3 bottom-0 left-1.5"></div>
                      )}
                    </div>
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center">
                        <p className="font-medium">{event.status}</p>
                        <span className="hidden sm:inline mx-2 text-gray-400">•</span>
                        <p className="text-sm text-gray-600">{event.date}</p>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                    </div>
                  </div>
                ))}

                <div className="flex mb-4 relative opacity-50">
                  <div className="flex flex-col items-center mr-4">
                    <div className="w-3 h-3 bg-gray-300 rounded-full z-10"></div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-400">Shipping</p>
                    <p className="text-sm text-gray-400 mt-1">Your order will be shipped once production is complete.</p>
                  </div>
                </div>

                <div className="flex relative opacity-50">
                  <div className="flex flex-col items-center mr-4">
                    <div className="w-3 h-3 bg-gray-300 rounded-full z-10"></div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-400">Delivered</p>
                    <p className="text-sm text-gray-400 mt-1">Estimated delivery: {trackingInfo.estimatedDelivery}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="font-medium text-lg mb-4">Order Items</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Qty
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {trackingInfo.items.map((item: any) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-800">{item.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-gray-800">{item.quantity}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-gray-800">
                            <div>{item.status}</div>
                            <div className="text-xs text-gray-500">{item.statusDate}</div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-lg mb-4">Shipping Information</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Shipping Address:</p>
                    <p className="text-sm text-gray-600">{trackingInfo.shipping.address}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Shipping Method:</p>
                    <p className="text-sm text-gray-600">{trackingInfo.shipping.method}</p>
                  </div>
                </div>

                {trackingInfo.shipping.trackingNumber ? (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700">Tracking Number:</p>
                    <p className="text-sm text-blue-600 hover:underline">
                      {trackingInfo.shipping.trackingNumber}
                    </p>
                  </div>
                ) : (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">
                      Tracking number will be available once your order ships.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Need Assistance?</h2>
          <p className="text-gray-600 mb-4">
            If you have any questions about your order or need help tracking it, our customer service team is here to help.
          </p>
          <div className="flex items-center mb-4">
            <svg className="w-5 h-5 text-primary-red mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
            <span className="text-gray-800 font-medium">Phone: (425) 222-1088</span>
          </div>
          <div className="flex items-center">
            <svg className="w-5 h-5 text-primary-red mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            <span className="text-gray-800 font-medium">Email: sales@smartblindshub.com</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;
