import React, { useState, useEffect } from 'react';
import {
  createShipment,
  updateShipment,
  addTrackingEvent,
  ShippingStatus,
  CarrierService,
  Shipment,
  CreateShipmentRequest,
  generateTrackingUrl
} from '../../services/shippingService';
import { getVendorOrderById, VendorOrder } from '../../services/vendorOrderService';

interface ShippingManagerProps {
  orderId: string;
  onShippingUpdated?: () => void;
}

const ShippingManager: React.FC<ShippingManagerProps> = ({ orderId, onShippingUpdated }) => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [order, setOrder] = useState<VendorOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [shipmentData, setShipmentData] = useState<Partial<CreateShipmentRequest>>({
    carrier: 'UPS',
    serviceLevel: CarrierService.UPS_GROUND,
    handlingTimeDays: 1
  });
  const [trackingEvent, setTrackingEvent] = useState({
    eventDate: new Date(),
    description: '',
    status: 'in_transit',
    location: ''
  });
  const [showTrackingForm, setShowTrackingForm] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [packagingImages, setPackagingImages] = useState<File[]>([]);

  // Load order and shipments
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load order details
        const orderData = await getVendorOrderById(orderId);
        setOrder(orderData);

        // For demo purposes, we'll simulate getting shipments
        // In a real app, we would fetch from the API
        // const shipmentsData = await getShipmentsByOrderId(orderId);
        const shipmentsData: Shipment[] = []; // This would come from the API
        setShipments(shipmentsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load shipping data');
        console.error('Error loading shipping data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [orderId]);

  const handleCreateShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // If tracking number exists but URL doesn't, generate one
      if (shipmentData.trackingNumber && !shipmentData.trackingUrl && shipmentData.carrier) {
        shipmentData.trackingUrl = generateTrackingUrl(
          shipmentData.carrier,
          shipmentData.trackingNumber
        );
      }

      const newShipment = await createShipment(orderId, shipmentData as CreateShipmentRequest);
      setShipments([...shipments, newShipment]);
      setShowCreateForm(false);
      setShipmentData({
        carrier: 'UPS',
        serviceLevel: CarrierService.UPS_GROUND,
        handlingTimeDays: 1
      });
      if (onShippingUpdated) onShippingUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create shipment');
      console.error('Error creating shipment:', err);
    }
  };

  const handleAddTrackingEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShipment) return;

    try {
      const updatedShipment = await addTrackingEvent(selectedShipment.id!, trackingEvent);

      // Update the shipment in the list
      setShipments(shipments.map(s =>
        s.id === updatedShipment.id ? updatedShipment : s
      ));

      setShowTrackingForm(false);
      setTrackingEvent({
        eventDate: new Date(),
        description: '',
        status: 'in_transit',
        location: ''
      });
      setSelectedShipment(null);
      if (onShippingUpdated) onShippingUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add tracking event');
      console.error('Error adding tracking event:', err);
    }
  };

  const getStatusBadgeClass = (status: ShippingStatus) => {
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

  if (loading) {
    return (
      <div className="flex justify-center items-center p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Shipping & Logistics</h2>
        {!showCreateForm && shipments.length === 0 && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Create Shipment
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          <p>{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-sm text-red-800 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Create Shipment Form */}
      {showCreateForm && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Create New Shipment</h3>
          <form onSubmit={handleCreateShipment}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Carrier*
                </label>
                <select
                  value={shipmentData.carrier}
                  onChange={(e) => setShipmentData({ ...shipmentData, carrier: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                >
                  <option value="UPS">UPS</option>
                  <option value="FedEx">FedEx</option>
                  <option value="USPS">USPS</option>
                  <option value="DHL">DHL</option>
                  <option value="LTL Freight">LTL Freight</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Level*
                </label>
                <select
                  value={shipmentData.serviceLevel}
                  onChange={(e) => setShipmentData({ ...shipmentData, serviceLevel: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                >
                  {shipmentData.carrier === 'UPS' && (
                    <>
                      <option value={CarrierService.UPS_GROUND}>UPS Ground</option>
                      <option value={CarrierService.UPS_2DAY}>UPS 2-Day Air</option>
                      <option value={CarrierService.UPS_NEXT_DAY}>UPS Next Day Air</option>
                    </>
                  )}
                  {shipmentData.carrier === 'FedEx' && (
                    <>
                      <option value={CarrierService.FEDEX_GROUND}>FedEx Ground</option>
                      <option value={CarrierService.FEDEX_EXPRESS}>FedEx Express</option>
                      <option value={CarrierService.FEDEX_2DAY}>FedEx 2Day</option>
                    </>
                  )}
                  {shipmentData.carrier === 'USPS' && (
                    <>
                      <option value={CarrierService.USPS_PRIORITY}>USPS Priority Mail</option>
                      <option value={CarrierService.USPS_FIRST_CLASS}>USPS First Class</option>
                      <option value={CarrierService.USPS_EXPRESS}>USPS Priority Mail Express</option>
                    </>
                  )}
                  {shipmentData.carrier === 'DHL' && (
                    <option value={CarrierService.DHL_EXPRESS}>DHL Express</option>
                  )}
                  {shipmentData.carrier === 'LTL Freight' && (
                    <>
                      <option value={CarrierService.LTL_FREIGHT_STANDARD}>LTL Freight Standard</option>
                      <option value={CarrierService.LTL_FREIGHT_EXPEDITED}>LTL Freight Expedited</option>
                    </>
                  )}
                  {shipmentData.carrier === 'Other' && (
                    <option value="Custom Service">Custom Service</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tracking Number
                </label>
                <input
                  type="text"
                  value={shipmentData.trackingNumber || ''}
                  onChange={(e) => setShipmentData({ ...shipmentData, trackingNumber: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="e.g. 1Z999AA10123456784"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Handling Time (Days)
                </label>
                <input
                  type="number"
                  min="1"
                  value={shipmentData.handlingTimeDays || 1}
                  onChange={(e) => setShipmentData({ ...shipmentData, handlingTimeDays: parseInt(e.target.value) })}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Delivery Date
                </label>
                <input
                  type="date"
                  value={shipmentData.estimatedDeliveryDate ? new Date(shipmentData.estimatedDeliveryDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => setShipmentData({ ...shipmentData, estimatedDeliveryDate: new Date(e.target.value) })}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shipping Label URL
                </label>
                <input
                  type="text"
                  value={shipmentData.shippingLabelUrl || ''}
                  onChange={(e) => setShipmentData({ ...shipmentData, shippingLabelUrl: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="https://example.com/label.pdf"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Packaging Instructions
              </label>
              <textarea
                value={shipmentData.packagingInstructions || ''}
                onChange={(e) => setShipmentData({ ...shipmentData, packagingInstructions: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded"
                rows={3}
                placeholder="Special packaging requirements or handling instructions"
              ></textarea>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Create Shipment
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Shipments List */}
      {shipments.length > 0 ? (
        <div>
          <h3 className="text-lg font-semibold mb-3">Shipments</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Carrier/Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tracking
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {shipments.map((shipment) => (
                  <tr key={shipment.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {shipment.carrier}
                      </div>
                      <div className="text-sm text-gray-500">
                        {shipment.serviceLevel}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {shipment.trackingNumber ? (
                        <div>
                          <div className="text-sm text-gray-900">
                            {shipment.trackingNumber}
                          </div>
                          {shipment.trackingUrl && (
                            <a
                              href={shipment.trackingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-800"
                            >
                              Track Package
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">No tracking info</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(shipment.status)}`}>
                        {shipment.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {shipment.shippingDate
                          ? `Shipped: ${new Date(shipment.shippingDate).toLocaleDateString()}`
                          : 'Not shipped yet'
                        }
                      </div>
                      {shipment.estimatedDeliveryDate && (
                        <div className="text-sm text-gray-500">
                          Est. Delivery: {new Date(shipment.estimatedDeliveryDate).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedShipment(shipment);
                          setShowTrackingForm(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Add Update
                      </button>
                      <button
                        onClick={() => {
                          // Navigate to shipping detail page
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tracking Update Form */}
          {showTrackingForm && selectedShipment && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
                <h3 className="text-lg font-semibold mb-4">Add Tracking Update</h3>
                <form onSubmit={handleAddTrackingEvent}>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={trackingEvent.eventDate.toISOString().slice(0, 16)}
                      onChange={(e) => setTrackingEvent({
                        ...trackingEvent,
                        eventDate: new Date(e.target.value)
                      })}
                      className="w-full p-2 border border-gray-300 rounded"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      value={trackingEvent.location}
                      onChange={(e) => setTrackingEvent({
                        ...trackingEvent,
                        location: e.target.value
                      })}
                      className="w-full p-2 border border-gray-300 rounded"
                      placeholder="e.g. Memphis, TN"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={trackingEvent.status}
                      onChange={(e) => setTrackingEvent({
                        ...trackingEvent,
                        status: e.target.value
                      })}
                      className="w-full p-2 border border-gray-300 rounded"
                      required
                    >
                      <option value="in_transit">In Transit</option>
                      <option value="out_for_delivery">Out For Delivery</option>
                      <option value="delivered">Delivered</option>
                      <option value="exception">Exception/Issue</option>
                      <option value="returned">Returned</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description*
                    </label>
                    <textarea
                      value={trackingEvent.description}
                      onChange={(e) => setTrackingEvent({
                        ...trackingEvent,
                        description: e.target.value
                      })}
                      className="w-full p-2 border border-gray-300 rounded"
                      rows={3}
                      placeholder="e.g. Package arrived at local facility"
                      required
                    ></textarea>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowTrackingForm(false);
                        setSelectedShipment(null);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Add Update
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {!showCreateForm && (
            <div className="mt-4">
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Create Another Shipment
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gray-50 p-6 rounded border border-gray-200 flex flex-col items-center">
          <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No Shipments Created Yet</h3>
          <p className="text-gray-500 text-center mb-4">
            Create a shipment to generate tracking information and notify the customer.
          </p>
          {!showCreateForm && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Create First Shipment
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ShippingManager;
