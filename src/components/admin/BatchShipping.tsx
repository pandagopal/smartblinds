import React, { useState, useEffect } from 'react';
import {
  getShippingRates,
  generateLabel,
  CarrierType,
  LabelRequest,
  LabelResponse
} from '../../services/carrierApiService';
import { getShipments } from '../../services/shippingService';
import { adminService } from '../../services/adminService';

interface Order {
  id: string;
  orderNumber: string;
  orderDate: Date;
  customer: {
    name: string;
    email: string;
  };
  shippingAddress: {
    name: string;
    company?: string;
    street1: string;
    street2?: string;
    city: string;
    stateCode: string;
    postalCode: string;
    countryCode: string;
    phone: string;
    isResidential: boolean;
  };
  items: {
    id: string;
    productName: string;
    quantity: number;
    width: number;
    height: number;
    weight: number;
  }[];
  status: string;
  total: number;
}

interface BatchItem {
  order: Order;
  selected: boolean;
  carrier: CarrierType;
  service: string;
  packageType: string;
  dimensions: {
    length: number;
    width: number;
    height: number;
    weight: number;
    unit: 'imperial' | 'metric';
  };
  signature: 'required' | 'not_required' | 'adult';
  labelResponse?: LabelResponse;
  isProcessing: boolean;
  error?: string;
}

const BatchShipping: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('Processing');
  const [dateFilter, setDateFilter] = useState({ from: '', to: '' });
  const [successCount, setSuccessCount] = useState(0);
  const [failureCount, setFailureCount] = useState(0);
  const [defaultShipFrom, setDefaultShipFrom] = useState({
    name: 'SmartBlinds Inc.',
    company: 'SmartBlinds',
    street1: '123 Warehouse Dr',
    city: 'Indianapolis',
    stateCode: 'IN',
    postalCode: '46201',
    countryCode: 'US',
    phone: '800-555-1234',
    email: 'shipping@smartblinds.com'
  });

  useEffect(() => {
    loadOrders();
  }, [statusFilter, dateFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build filter parameters
      const filters: Record<string, any> = {
        status: statusFilter
      };

      if (dateFilter.from) {
        filters.from = dateFilter.from;
      }

      if (dateFilter.to) {
        filters.to = dateFilter.to;
      }

      // Get orders that need shipping
      const ordersData = await adminService.getOrders(filters);

      // Get existing shipments to exclude orders that already have shipments
      const shipments = await getShipments();
      const ordersWithShipments = new Set(shipments.map(s => s.orderId));

      // Filter out orders that already have shipments
      const filteredOrders = ordersData.filter(order => !ordersWithShipments.has(order.id));

      setOrders(filteredOrders);

      // Initialize batch items
      const items: BatchItem[] = filteredOrders.map(order => {
        // Calculate total package weight from items
        const totalWeight = order.items.reduce((sum, item) => sum + (item.weight * item.quantity), 0);

        // Create a batch item for the order
        return {
          order,
          selected: false,
          carrier: CarrierType.UPS,
          service: 'UPS Ground',
          packageType: 'Package',
          dimensions: {
            length: 12,
            width: 12,
            height: 12,
            weight: totalWeight || 2, // Default weight if no item weights
            unit: 'imperial'
          },
          signature: 'not_required',
          isProcessing: false
        };
      });

      setBatchItems(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectAll = (selected: boolean) => {
    setBatchItems(batchItems.map(item => ({ ...item, selected })));
  };

  const toggleSelectItem = (index: number, selected: boolean) => {
    const newItems = [...batchItems];
    newItems[index].selected = selected;
    setBatchItems(newItems);
  };

  const updateItemField = (index: number, field: string, value: any) => {
    const newItems = [...batchItems];
    (newItems[index] as any)[field] = value;
    setBatchItems(newItems);
  };

  const processSelected = async () => {
    const selectedItems = batchItems.filter(item => item.selected);

    if (selectedItems.length === 0) {
      setError('No items selected for processing');
      return;
    }

    try {
      setProcessing(true);
      setSuccessCount(0);
      setFailureCount(0);

      // Process each selected item one by one
      const promises = selectedItems.map(async (item, originalIndex) => {
        const index = batchItems.findIndex(bi => bi.order.id === item.order.id);

        if (index === -1) return;

        // Mark as processing
        setBatchItems(prev => {
          const newItems = [...prev];
          newItems[index].isProcessing = true;
          newItems[index].error = undefined;
          return newItems;
        });

        try {
          // Create label request
          const labelRequest: LabelRequest = {
            carrier: item.carrier,
            service: item.service,
            shipFrom: {
              ...defaultShipFrom
            },
            shipTo: {
              name: item.order.shippingAddress.name,
              company: item.order.shippingAddress.company,
              street1: item.order.shippingAddress.street1,
              street2: item.order.shippingAddress.street2,
              city: item.order.shippingAddress.city,
              stateCode: item.order.shippingAddress.stateCode,
              postalCode: item.order.shippingAddress.postalCode,
              countryCode: item.order.shippingAddress.countryCode,
              phone: item.order.shippingAddress.phone,
              isResidential: item.order.shippingAddress.isResidential
            },
            packages: [{
              dimensions: item.dimensions,
              description: `Order ${item.order.orderNumber}`
            }],
            packageType: item.packageType,
            signature: item.signature,
            orderId: item.order.id
          };

          // Generate label
          const response = await generateLabel(labelRequest);

          // Update item with label response
          setBatchItems(prev => {
            const newItems = [...prev];
            newItems[index].labelResponse = response;
            newItems[index].isProcessing = false;
            return newItems;
          });

          setSuccessCount(prev => prev + 1);
        } catch (err) {
          // Handle error
          const errorMessage = err instanceof Error ? err.message : 'Error processing shipment';

          setBatchItems(prev => {
            const newItems = [...prev];
            newItems[index].isProcessing = false;
            newItems[index].error = errorMessage;
            return newItems;
          });

          setFailureCount(prev => prev + 1);
        }
      });

      await Promise.all(promises);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process shipments');
      console.error('Error processing shipments:', err);
    } finally {
      setProcessing(false);
    }
  };

  const printLabels = () => {
    // Get all labels that were generated
    const labels = batchItems
      .filter(item => item.labelResponse?.labelUrl)
      .map(item => item.labelResponse!.labelUrl);

    if (labels.length === 0) {
      setError('No labels available to print');
      return;
    }

    // Open each label in a new window
    labels.forEach(labelUrl => {
      window.open(labelUrl, '_blank');
    });
  };

  if (loading) {
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
          <h1 className="text-2xl font-bold">Batch Shipping</h1>
          <p className="text-gray-600">
            Process multiple shipments at once
          </p>
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

      {/* Filters */}
      <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold mb-3">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Ready to Ship">Ready to Ship</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Date
            </label>
            <input
              type="date"
              value={dateFilter.from}
              onChange={(e) => setDateFilter({ ...dateFilter, from: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To Date
            </label>
            <input
              type="date"
              value={dateFilter.to}
              onChange={(e) => setDateFilter({ ...dateFilter, to: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={loadOrders}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Processing Status */}
      {processing && (
        <div className="mb-6 p-3 bg-blue-100 text-blue-700 rounded">
          <p>Processing shipments... {successCount} completed, {failureCount} failed</p>
        </div>
      )}

      {/* Batch Actions */}
      <div className="mb-6 bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => toggleSelectAll(true)}
            className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Select All
          </button>
          <button
            onClick={() => toggleSelectAll(false)}
            className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Deselect All
          </button>
          <button
            onClick={processSelected}
            disabled={processing || batchItems.filter(item => item.selected).length === 0}
            className={`px-3 py-1 ${
              processing || batchItems.filter(item => item.selected).length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            } rounded`}
          >
            Process Selected
          </button>
          <button
            onClick={printLabels}
            disabled={batchItems.filter(item => item.labelResponse?.labelUrl).length === 0}
            className={`px-3 py-1 ${
              batchItems.filter(item => item.labelResponse?.labelUrl).length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            } rounded`}
          >
            Print Labels
          </button>
        </div>

        <div className="text-sm text-gray-600 mb-2">
          {batchItems.length} orders ready to ship
        </div>
      </div>

      {/* Batch Items Table */}
      {batchItems.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={batchItems.every(item => item.selected)}
                    onChange={(e) => toggleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ship To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Carrier & Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Package
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {batchItems.map((item, index) => (
                <tr key={item.order.id} className={`${item.isProcessing ? 'bg-blue-50' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={(e) => toggleSelectItem(index, e.target.checked)}
                      disabled={item.isProcessing || !!item.labelResponse}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {item.order.orderNumber}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(item.order.orderDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {item.order.customer.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.order.customer.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {item.order.shippingAddress.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.order.shippingAddress.street1}, {item.order.shippingAddress.city}, {item.order.shippingAddress.stateCode}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.labelResponse ? (
                      <div className="text-sm text-gray-900">
                        {item.carrier} - {item.service}
                      </div>
                    ) : (
                      <div className="flex flex-col space-y-2">
                        <select
                          value={item.carrier}
                          onChange={(e) => updateItemField(index, 'carrier', e.target.value)}
                          disabled={item.isProcessing || !!item.labelResponse}
                          className="p-1 text-sm border border-gray-300 rounded"
                        >
                          <option value={CarrierType.UPS}>UPS</option>
                          <option value={CarrierType.FEDEX}>FedEx</option>
                          <option value={CarrierType.USPS}>USPS</option>
                          <option value={CarrierType.DHL}>DHL</option>
                        </select>
                        <select
                          value={item.service}
                          onChange={(e) => updateItemField(index, 'service', e.target.value)}
                          disabled={item.isProcessing || !!item.labelResponse}
                          className="p-1 text-sm border border-gray-300 rounded"
                        >
                          {item.carrier === CarrierType.UPS && (
                            <>
                              <option value="UPS Ground">UPS Ground</option>
                              <option value="UPS 3 Day Select">UPS 3 Day Select</option>
                              <option value="UPS 2nd Day Air">UPS 2nd Day Air</option>
                              <option value="UPS Next Day Air">UPS Next Day Air</option>
                            </>
                          )}
                          {item.carrier === CarrierType.FEDEX && (
                            <>
                              <option value="FedEx Ground">FedEx Ground</option>
                              <option value="FedEx Express Saver">FedEx Express Saver</option>
                              <option value="FedEx 2Day">FedEx 2Day</option>
                              <option value="FedEx Priority Overnight">FedEx Priority Overnight</option>
                            </>
                          )}
                          {item.carrier === CarrierType.USPS && (
                            <>
                              <option value="USPS Priority Mail">USPS Priority Mail</option>
                              <option value="USPS First Class">USPS First Class</option>
                              <option value="USPS Priority Mail Express">USPS Priority Mail Express</option>
                            </>
                          )}
                          {item.carrier === CarrierType.DHL && (
                            <>
                              <option value="DHL Express">DHL Express</option>
                            </>
                          )}
                        </select>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.labelResponse ? (
                      <div className="text-sm text-gray-900">
                        {item.dimensions.length}×{item.dimensions.width}×{item.dimensions.height}, {item.dimensions.weight} lbs
                      </div>
                    ) : (
                      <div className="flex flex-col space-y-2">
                        <div className="flex space-x-1">
                          <input
                            type="number"
                            value={item.dimensions.length}
                            onChange={(e) => {
                              const dimensions = { ...item.dimensions, length: Number(e.target.value) };
                              updateItemField(index, 'dimensions', dimensions);
                            }}
                            disabled={item.isProcessing || !!item.labelResponse}
                            className="p-1 text-sm border border-gray-300 rounded w-14"
                            min="1"
                          />
                          <span className="text-sm">×</span>
                          <input
                            type="number"
                            value={item.dimensions.width}
                            onChange={(e) => {
                              const dimensions = { ...item.dimensions, width: Number(e.target.value) };
                              updateItemField(index, 'dimensions', dimensions);
                            }}
                            disabled={item.isProcessing || !!item.labelResponse}
                            className="p-1 text-sm border border-gray-300 rounded w-14"
                            min="1"
                          />
                          <span className="text-sm">×</span>
                          <input
                            type="number"
                            value={item.dimensions.height}
                            onChange={(e) => {
                              const dimensions = { ...item.dimensions, height: Number(e.target.value) };
                              updateItemField(index, 'dimensions', dimensions);
                            }}
                            disabled={item.isProcessing || !!item.labelResponse}
                            className="p-1 text-sm border border-gray-300 rounded w-14"
                            min="1"
                          />
                        </div>
                        <div className="flex items-center">
                          <input
                            type="number"
                            value={item.dimensions.weight}
                            onChange={(e) => {
                              const dimensions = { ...item.dimensions, weight: Number(e.target.value) };
                              updateItemField(index, 'dimensions', dimensions);
                            }}
                            disabled={item.isProcessing || !!item.labelResponse}
                            className="p-1 text-sm border border-gray-300 rounded w-20"
                            min="0.1"
                            step="0.1"
                          />
                          <span className="text-sm ml-1">lbs</span>
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.isProcessing && (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-600 mr-2"></div>
                        <span className="text-sm text-blue-600">Processing...</span>
                      </div>
                    )}
                    {item.error && (
                      <div className="text-sm text-red-600">
                        Error: {item.error}
                      </div>
                    )}
                    {item.labelResponse && (
                      <div className="flex flex-col">
                        <span className="text-sm text-green-600 font-medium">
                          Label Generated
                        </span>
                        <a
                          href={item.labelResponse.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          {item.labelResponse.trackingNumber}
                        </a>
                        <a
                          href={item.labelResponse.labelUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          View Label
                        </a>
                      </div>
                    )}
                    {!item.isProcessing && !item.error && !item.labelResponse && (
                      <span className="text-sm text-gray-500">Not processed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-12 text-center bg-gray-50 rounded-lg border border-gray-200">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No Orders Found</h3>
          <p className="text-gray-500 mb-4">
            There are no orders matching your filter criteria or all orders already have shipments.
          </p>
          <button
            onClick={loadOrders}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
      )}
    </div>
  );
};

export default BatchShipping;
