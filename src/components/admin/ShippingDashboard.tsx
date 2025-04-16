import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getShipments, Shipment, ShippingStatus } from '../../services/shippingService';

interface ShippingMetrics {
  totalShipments: number;
  pendingShipments: number;
  inTransitShipments: number;
  deliveredShipments: number;
  exceptionShipments: number;
  returnedShipments: number;
  averageDeliveryDays: number;
  shipmentsByCarrier: Record<string, number>;
  shipmentsByDayOfWeek: number[];
  recentExceptions: Shipment[];
}

const ShippingDashboard: React.FC = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [metrics, setMetrics] = useState<ShippingMetrics>({
    totalShipments: 0,
    pendingShipments: 0,
    inTransitShipments: 0,
    deliveredShipments: 0,
    exceptionShipments: 0,
    returnedShipments: 0,
    averageDeliveryDays: 0,
    shipmentsByCarrier: {},
    shipmentsByDayOfWeek: [0, 0, 0, 0, 0, 0, 0],
    recentExceptions: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), // Last 30 days
    to: new Date().toISOString().slice(0, 10)
  });

  useEffect(() => {
    loadShipments();
  }, [dateRange]);

  const loadShipments = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get shipments from selected date range
      const shipmentsData = await getShipments({
        from: dateRange.from,
        to: dateRange.to
      });

      setShipments(shipmentsData);
      calculateMetrics(shipmentsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load shipments');
      console.error('Error loading shipments:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (shipmentsData: Shipment[]) => {
    // Count shipments by status
    const pendingShipments = shipmentsData.filter(s =>
      s.status === ShippingStatus.PENDING || s.status === ShippingStatus.CREATED
    ).length;

    const inTransitShipments = shipmentsData.filter(s =>
      s.status === ShippingStatus.IN_TRANSIT
    ).length;

    const deliveredShipments = shipmentsData.filter(s =>
      s.status === ShippingStatus.DELIVERED
    ).length;

    const exceptionShipments = shipmentsData.filter(s =>
      s.status === ShippingStatus.EXCEPTION
    ).length;

    const returnedShipments = shipmentsData.filter(s =>
      s.status === ShippingStatus.RETURNED
    ).length;

    // Calculate average delivery time
    const deliveredWithDates = shipmentsData.filter(s =>
      s.status === ShippingStatus.DELIVERED && s.shippingDate && s.actualDeliveryDate
    );

    let averageDeliveryDays = 0;
    if (deliveredWithDates.length > 0) {
      const totalDays = deliveredWithDates.reduce((total, shipment) => {
        const shippingDate = new Date(shipment.shippingDate!);
        const deliveryDate = new Date(shipment.actualDeliveryDate!);
        const days = Math.ceil((deliveryDate.getTime() - shippingDate.getTime()) / (1000 * 60 * 60 * 24));
        return total + days;
      }, 0);

      averageDeliveryDays = Math.round((totalDays / deliveredWithDates.length) * 10) / 10;
    }

    // Count shipments by carrier
    const shipmentsByCarrier: Record<string, number> = {};
    shipmentsData.forEach(shipment => {
      const carrier = shipment.carrier;
      shipmentsByCarrier[carrier] = (shipmentsByCarrier[carrier] || 0) + 1;
    });

    // Count shipments by day of week
    const shipmentsByDayOfWeek = [0, 0, 0, 0, 0, 0, 0]; // Sun, Mon, Tue, Wed, Thu, Fri, Sat
    shipmentsData.forEach(shipment => {
      if (shipment.shippingDate) {
        const dayOfWeek = new Date(shipment.shippingDate).getDay();
        shipmentsByDayOfWeek[dayOfWeek]++;
      }
    });

    // Get recent exceptions
    const recentExceptions = shipmentsData
      .filter(s => s.status === ShippingStatus.EXCEPTION)
      .sort((a, b) => {
        const aDate = a.updatedAt || a.createdAt || new Date();
        const bDate = b.updatedAt || b.createdAt || new Date();
        return new Date(bDate).getTime() - new Date(aDate).getTime();
      })
      .slice(0, 5);

    setMetrics({
      totalShipments: shipmentsData.length,
      pendingShipments,
      inTransitShipments,
      deliveredShipments,
      exceptionShipments,
      returnedShipments,
      averageDeliveryDays,
      shipmentsByCarrier,
      shipmentsByDayOfWeek,
      recentExceptions
    });
  };

  // Helper function to get status badge
  const getStatusBadge = (status: ShippingStatus) => {
    const badgeClasses = {
      [ShippingStatus.PENDING]: 'bg-gray-100 text-gray-800',
      [ShippingStatus.CREATED]: 'bg-blue-100 text-blue-800',
      [ShippingStatus.IN_TRANSIT]: 'bg-yellow-100 text-yellow-800',
      [ShippingStatus.DELIVERED]: 'bg-green-100 text-green-800',
      [ShippingStatus.EXCEPTION]: 'bg-red-100 text-red-800',
      [ShippingStatus.RETURNED]: 'bg-purple-100 text-purple-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs ${badgeClasses[status]}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  if (loading && shipments.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Shipping Dashboard</h1>
          <p className="text-gray-600">
            Monitor and manage all shipping operations
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link
            to="/admin/batch-shipping"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Batch Shipping
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-100 text-red-700 rounded">
          <p>{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-sm text-red-800 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Date Range Filter */}
      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-3">Date Range</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From
            </label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To
            </label>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={loadShipments}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-3">Shipment Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Shipments</span>
              <span className="font-semibold">{metrics.totalShipments}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pending / Created</span>
              <span className="font-semibold">{metrics.pendingShipments}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">In Transit</span>
              <span className="font-semibold">{metrics.inTransitShipments}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Delivered</span>
              <span className="font-semibold">{metrics.deliveredShipments}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Exceptions</span>
              <span className="font-semibold text-red-600">{metrics.exceptionShipments}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Returns</span>
              <span className="font-semibold">{metrics.returnedShipments}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-3">Delivery Performance</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Avg. Delivery Time</span>
              <span className="font-semibold">{metrics.averageDeliveryDays} days</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">On-Time Delivery</span>
              <span className="font-semibold">
                {metrics.deliveredShipments > 0
                  ? Math.round(((metrics.deliveredShipments - metrics.exceptionShipments) / metrics.deliveredShipments) * 100)
                  : 0}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Exception Rate</span>
              <span className="font-semibold text-red-600">
                {metrics.totalShipments > 0
                  ? Math.round((metrics.exceptionShipments / metrics.totalShipments) * 100)
                  : 0}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Return Rate</span>
              <span className="font-semibold">
                {metrics.totalShipments > 0
                  ? Math.round((metrics.returnedShipments / metrics.totalShipments) * 100)
                  : 0}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-3">Carrier Breakdown</h3>
          <div className="space-y-3">
            {Object.entries(metrics.shipmentsByCarrier).map(([carrier, count]) => (
              <div key={carrier} className="flex justify-between items-center">
                <span className="text-gray-600">{carrier}</span>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Shipping Volume Chart */}
      <div className="mb-6 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold mb-3">Weekly Shipping Volume</h3>
        <div className="h-60">
          <div className="h-full flex items-end justify-between">
            {metrics.shipmentsByDayOfWeek.map((count, index) => (
              <div key={index} className="flex flex-col items-center">
                <div
                  className="w-10 bg-blue-500 rounded-t"
                  style={{
                    height: `${Math.max(5, count / Math.max(...metrics.shipmentsByDayOfWeek) * 180)}px`
                  }}
                ></div>
                <div className="mt-2 text-xs text-gray-600">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][index]}
                </div>
                <div className="text-xs font-medium">{count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Exceptions */}
      <div className="mb-6 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">Recent Exceptions</h3>
          <Link to="/admin/shipping-exceptions" className="text-blue-600 hover:underline text-sm">
            View All
          </Link>
        </div>

        {metrics.recentExceptions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tracking
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Carrier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Exception Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {metrics.recentExceptions.map((shipment) => (
                  <tr key={shipment.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={`/admin/orders/${shipment.orderId}`}
                        className="text-blue-600 hover:underline"
                      >
                        {shipment.orderId.slice(0, 8)}...
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {shipment.trackingNumber ? (
                        <a
                          href={shipment.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {shipment.trackingNumber}
                        </a>
                      ) : (
                        <span className="text-gray-500">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {shipment.carrier}
                    </td>
                    <td className="px-6 py-4">
                      {shipment.events && shipment.events.length > 0
                        ? (shipment.events.find(e => e.status === 'exception')?.description || 'Unknown exception')
                        : 'No details available'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(shipment.updatedAt || shipment.createdAt || '').toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6 bg-gray-50 rounded">
            <p className="text-gray-500">No exceptions in this time period</p>
          </div>
        )}
      </div>

      {/* Recent Shipments */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">Recent Shipments</h3>
          <Link to="/admin/shipments" className="text-blue-600 hover:underline text-sm">
            View All
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tracking
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Carrier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ship Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Est. Delivery
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {shipments.slice(0, 5).map((shipment) => (
                <tr key={shipment.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {shipment.trackingNumber ? (
                      <a
                        href={shipment.trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {shipment.trackingNumber}
                      </a>
                    ) : (
                      <span className="text-gray-500">Not available</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {shipment.carrier} - {shipment.serviceLevel}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(shipment.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {shipment.shippingDate
                      ? new Date(shipment.shippingDate).toLocaleDateString()
                      : 'Not shipped'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {shipment.estimatedDeliveryDate
                      ? new Date(shipment.estimatedDeliveryDate).toLocaleDateString()
                      : 'Not available'
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ShippingDashboard;
