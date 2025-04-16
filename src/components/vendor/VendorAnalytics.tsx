import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getVendorAnalytics,
  getSalesData,
  getProductPerformance,
  getInventoryForecasts,
  getOrderStatusSummary,
  getLeadTimePerformance,
  SalesOverview,
  ProductPerformance,
  InventoryForecast,
  OrderStatusSummary,
  LeadTimePerformance,
  AnalyticsFilters,
  TimePeriod
} from '../../services/vendorAnalyticsService';
import { VendorOrderStatus } from '../../services/vendorOrderService';

// Component for displaying sales overview
const SalesOverviewCard: React.FC<{ data: SalesOverview | null }> = ({ data }) => {
  if (!data) return null;

  // Function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Function to get change indicator with color
  const getChangeIndicator = (change: number) => {
    if (change > 0) {
      return <span className="text-green-600">↑ {change.toFixed(1)}%</span>;
    } else if (change < 0) {
      return <span className="text-red-600">↓ {Math.abs(change).toFixed(1)}%</span>;
    } else {
      return <span className="text-gray-600">—</span>;
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Sales Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="text-2xl font-bold">{formatCurrency(data.totalRevenue)}</p>
          {data.comparisonWithPrevious && (
            <p className="text-xs mt-1">
              vs previous: {getChangeIndicator(data.comparisonWithPrevious.revenueChange)}
            </p>
          )}
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="text-2xl font-bold">{data.totalOrders}</p>
          {data.comparisonWithPrevious && (
            <p className="text-xs mt-1">
              vs previous: {getChangeIndicator(data.comparisonWithPrevious.ordersChange)}
            </p>
          )}
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm text-gray-500">Average Order Value</p>
          <p className="text-2xl font-bold">{formatCurrency(data.averageOrderValue)}</p>
          {data.comparisonWithPrevious && (
            <p className="text-xs mt-1">
              vs previous: {getChangeIndicator(data.comparisonWithPrevious.aovChange)}
            </p>
          )}
        </div>
      </div>

      {data.salesByDay && data.salesByDay.length > 0 && (
        <div className="mt-4">
          <h3 className="text-md font-medium mb-2">Revenue Trend</h3>
          <div className="h-40 flex items-end space-x-1">
            {data.salesByDay.map((day, index) => {
              // Calculate relative height (max 100%)
              const maxRevenue = Math.max(...data.salesByDay!.map(d => d.revenue));
              const height = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;

              return (
                <div key={index} className="flex flex-col items-center" style={{ width: `${100 / data.salesByDay!.length}%` }}>
                  <div
                    className="w-full bg-blue-500 rounded-t"
                    style={{ height: `${Math.max(5, height)}%` }}
                    title={`${day.date}: ${formatCurrency(day.revenue)} (${day.orders} orders)`}
                  ></div>
                  {data.salesByDay!.length <= 14 && (
                    <span className="text-xs mt-1 transform -rotate-45 origin-top-left whitespace-nowrap">
                      {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// Component for displaying product performance data
const ProductPerformanceCard: React.FC<{
  title: string;
  products: ProductPerformance[];
  highlightField?: 'revenue' | 'margin' | 'returnRate';
}> = ({ title, products, highlightField = 'revenue' }) => {
  if (!products.length) return null;

  // Function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Function to format percentage
  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  // Get the color for the highlighter field
  const getHighlightColor = (product: ProductPerformance) => {
    if (highlightField === 'revenue') {
      return 'text-blue-600';
    } else if (highlightField === 'margin') {
      return 'text-green-600';
    } else if (highlightField === 'returnRate') {
      // For return rate, higher is worse, so inversed color logic
      return 'text-red-600';
    }
    return '';
  };

  // Get the value to display for the highlighted field
  const getHighlightValue = (product: ProductPerformance) => {
    if (highlightField === 'revenue') {
      return formatCurrency(product.revenue);
    } else if (highlightField === 'margin') {
      return formatPercentage(product.margin);
    } else if (highlightField === 'returnRate') {
      return formatPercentage(product.returnRate);
    }
    return '';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow h-full">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>

      <div className="space-y-4">
        {products.map((product) => (
          <div key={product.productId} className="border-b border-gray-100 pb-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{product.productName}</h3>
                <p className="text-sm text-gray-500">{product.unitsSold} units sold</p>
              </div>
              <div className={`font-semibold ${getHighlightColor(product)}`}>
                {getHighlightValue(product)}
              </div>
            </div>

            <div className="mt-2 flex justify-between text-xs text-gray-500">
              <span>Rating: {product.avgRating.toFixed(1)}/5.0</span>
              <span>Return Rate: {formatPercentage(product.returnRate)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-center">
        <Link to="/vendor/products" className="text-blue-600 hover:underline text-sm">
          View All Products
        </Link>
      </div>
    </div>
  );
};

// Component for displaying order status summary
const OrderStatusSummaryCard: React.FC<{ data: OrderStatusSummary[] }> = ({ data }) => {
  if (!data.length) return null;

  // Function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Calculate total for context
  const totalOrders = data.reduce((sum, status) => sum + status.count, 0);
  const totalValue = data.reduce((sum, status) => sum + status.value, 0);

  // Get status color class
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
    <div className="bg-white p-6 rounded-lg shadow h-full">
      <h2 className="text-xl font-semibold mb-4">Order Status Summary</h2>

      <div className="space-y-3">
        {data.map((status) => (
          <div key={status.status} className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className={`text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full ${getStatusColor(status.status)}`}>
                  {status.status}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block">
                  {status.count} orders ({status.percentage}%)
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-2 text-xs flex rounded bg-gray-200">
              <div style={{ width: `${status.percentage}%` }} className={getStatusColor(status.status).replace('text-', 'bg-').replace('bg-', 'bg-').replace('-100', '-500')}></div>
            </div>
            <div className="text-xs text-gray-500">
              Value: {formatCurrency(status.value)}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex justify-between">
          <div>
            <span className="text-sm text-gray-600">Total Orders</span>
            <p className="text-lg font-semibold">{totalOrders}</p>
          </div>
          <div className="text-right">
            <span className="text-sm text-gray-600">Total Value</span>
            <p className="text-lg font-semibold">{formatCurrency(totalValue)}</p>
          </div>
        </div>
        <div className="mt-3 text-center">
          <Link to="/vendor/orders" className="text-blue-600 hover:underline text-sm">
            View All Orders
          </Link>
        </div>
      </div>
    </div>
  );
};

// Component for displaying inventory forecasts
const InventoryForecastsCard: React.FC<{ data: InventoryForecast[] }> = ({ data }) => {
  if (!data.length) return null;

  // Function to format date
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return 'Overdue';
    } else if (diffDays === 1) {
      return 'Tomorrow';
    } else if (diffDays < 7) {
      return `${diffDays} days`;
    } else if (diffDays < 30) {
      return `${Math.floor(diffDays / 7)} weeks`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  // Function to get the urgency styling
  const getUrgencyStyle = (material: InventoryForecast) => {
    const daysUntilDepletion = Math.ceil((material.forecastDepleted.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilDepletion <= 0) {
      return 'bg-red-50 border-red-200 text-red-800';
    } else if (daysUntilDepletion <= 7) {
      return 'bg-orange-50 border-orange-200 text-orange-800';
    } else if (daysUntilDepletion <= 14) {
      return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    } else {
      return 'bg-green-50 border-green-200 text-green-800';
    }
  };

  // Filter materials that need attention (stock below reorder point)
  const criticalMaterials = data.filter(material => material.currentStock <= material.reorderPoint);

  return (
    <div className="bg-white p-6 rounded-lg shadow h-full">
      <h2 className="text-xl font-semibold mb-4">Inventory Forecasts</h2>

      {criticalMaterials.length > 0 && (
        <div className="mb-4">
          <h3 className="text-md font-medium mb-2 text-red-600">Critical Items</h3>
          <div className="space-y-3">
            {criticalMaterials.map((material) => (
              <div
                key={material.materialId}
                className={`border rounded-lg p-3 ${getUrgencyStyle(material)}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{material.materialName}</h4>
                    <p className="text-sm">Stock: {material.currentStock} units</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold">Depleted in: {formatDate(material.forecastDepleted)}</p>
                    <p className="text-xs">Reorder: {material.suggestedReorder} units</p>
                  </div>
                </div>
                {/* Stock level visualization */}
                <div className="mt-2 pt-1 relative">
                  <div className="overflow-hidden h-2 mb-1 text-xs flex rounded bg-gray-200">
                    <div
                      style={{ width: `${Math.min(100, (material.currentStock / material.reorderPoint) * 100)}%` }}
                      className={material.currentStock < material.reorderPoint ? 'bg-red-500' : 'bg-green-500'}
                    ></div>
                  </div>
                  <div className="absolute top-0 right-0 h-full">
                    <div className="h-3 border-l-2 border-gray-400" style={{ marginLeft: `${(material.reorderPoint / (material.reorderPoint * 1.5)) * 100}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <h3 className="text-md font-medium mb-2">All Materials</h3>
        {data
          .sort((a, b) => a.forecastDepleted.getTime() - b.forecastDepleted.getTime()) // Sort by depletion date
          .slice(0, 5) // Show only top 5
          .map((material) => (
            <div key={material.materialId} className="flex justify-between border-b border-gray-100 pb-2">
              <div>
                <p className="font-medium">{material.materialName}</p>
                <p className="text-xs text-gray-500">Stock: {material.currentStock} units</p>
              </div>
              <div className="text-right">
                <p className={`text-sm ${new Date() > material.forecastDepleted ? 'text-red-600 font-bold' : ''}`}>
                  {formatDate(material.forecastDepleted)}
                </p>
              </div>
            </div>
          ))
        }
      </div>

      <div className="mt-4 text-center">
        <Link to="/vendor/inventory" className="text-blue-600 hover:underline text-sm">
          Manage Inventory
        </Link>
      </div>
    </div>
  );
};

// Component for displaying lead time performance
const LeadTimePerformanceCard: React.FC<{ data: LeadTimePerformance | null }> = ({ data }) => {
  if (!data) return null;

  // Function to get color based on values
  const getPerformanceColor = (actual: number, target: number) => {
    const difference = actual - target;

    if (difference <= -2) {
      // 2 or more days ahead of target (good)
      return 'text-green-600';
    } else if (difference <= 0) {
      // On target or slightly ahead (good)
      return 'text-green-500';
    } else if (difference <= 2) {
      // Up to 2 days behind target (warning)
      return 'text-yellow-600';
    } else {
      // More than 2 days behind target (bad)
      return 'text-red-600';
    }
  };

  // Color for overall lead time
  const overallColor = getPerformanceColor(data.averageLeadTime, data.targetLeadTime);

  // Color for on-time delivery rate
  const getDeliveryRateColor = (rate: number) => {
    if (rate >= 95) return 'text-green-600';
    if (rate >= 90) return 'text-yellow-600';
    return 'text-red-600';
  };

  const deliveryRateColor = getDeliveryRateColor(data.onTimeDeliveryRate);

  return (
    <div className="bg-white p-6 rounded-lg shadow h-full">
      <h2 className="text-xl font-semibold mb-4">Lead Time Performance</h2>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-500">Average Lead Time</p>
          <div className="flex items-end">
            <p className={`text-2xl font-bold ${overallColor}`}>{data.averageLeadTime} days</p>
            <p className="text-xs text-gray-500 ml-2 mb-1">
              Target: {data.targetLeadTime} days
            </p>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-500">On-Time Delivery Rate</p>
          <p className={`text-2xl font-bold ${deliveryRateColor}`}>
            {data.onTimeDeliveryRate.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Lead Time by Month Trend */}
      {data.leadTimeByMonth && data.leadTimeByMonth.length > 0 && (
        <div className="mb-6">
          <h3 className="text-md font-medium mb-3">Lead Time Trend (By Month)</h3>
          <div className="h-40 flex items-end space-x-1">
            {data.leadTimeByMonth.map((month, index) => {
              // Calculate relative height (max 100%) - with some padding at the top
              const maxValue = Math.max(...data.leadTimeByMonth.map(m => m.averageLeadTime)) * 1.2;
              const height = maxValue > 0 ? (month.averageLeadTime / maxValue) * 100 : 0;

              // Color based on performance vs target
              const barColor = getPerformanceColor(month.averageLeadTime, data.targetLeadTime);

              return (
                <div key={index} className="flex flex-col items-center" style={{ width: `${100 / data.leadTimeByMonth.length}%` }}>
                  <div
                    className={`w-full rounded-t ${barColor.replace('text-', 'bg-')}`}
                    style={{ height: `${Math.max(5, height)}%` }}
                    title={`${month.month}: ${month.averageLeadTime} days`}
                  ></div>
                  <span className="text-xs mt-1 whitespace-nowrap" style={{ transform: 'rotate(-45deg)', transformOrigin: 'top left' }}>
                    {month.month}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Target line */}
          <div className="relative h-4 mt-6 border-t border-dashed border-gray-400">
            <span className="absolute right-0 top-0 transform -translate-y-1/2 bg-white px-1 text-xs text-gray-500">
              Target: {data.targetLeadTime} days
            </span>
          </div>
        </div>
      )}

      {/* Lead Time by Product */}
      {data.leadTimeByProduct && data.leadTimeByProduct.length > 0 && (
        <div>
          <h3 className="text-md font-medium mb-3">Lead Time by Product</h3>
          <div className="space-y-2">
            {data.leadTimeByProduct.map((product) => (
              <div key={product.productId} className="flex items-center">
                <div className="w-1/3 pr-2 truncate">
                  <span className="text-sm">{product.productName}</span>
                </div>
                <div className="w-2/3 relative">
                  <div className="flex h-6 items-center">
                    <div className="h-2 bg-gray-200 rounded w-full relative">
                      {/* Bar with gradient fill */}
                      <div
                        className={`h-2 rounded ${getPerformanceColor(product.averageLeadTime, data.targetLeadTime).replace('text-', 'bg-')}`}
                        style={{ width: `${Math.min(100, (product.averageLeadTime / (data.targetLeadTime * 2)) * 100)}%` }}
                      ></div>

                      {/* Target indicator */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-gray-800"
                        style={{ left: `${(data.targetLeadTime / (data.targetLeadTime * 2)) * 100}%` }}
                      >
                      </div>
                    </div>
                    <span className={`ml-2 text-xs font-semibold ${getPerformanceColor(product.averageLeadTime, data.targetLeadTime)}`}>
                      {product.averageLeadTime} days
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const VendorAnalytics: React.FC = () => {
  // State variables for analytics data
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [salesOverview, setSalesOverview] = useState<SalesOverview | null>(null);
  const [topProducts, setTopProducts] = useState<ProductPerformance[]>([]);
  const [worstPerformers, setWorstPerformers] = useState<ProductPerformance[]>([]);
  const [highMarginProducts, setHighMarginProducts] = useState<ProductPerformance[]>([]);
  const [inventoryForecasts, setInventoryForecasts] = useState<InventoryForecast[]>([]);
  const [orderStatusSummary, setOrderStatusSummary] = useState<OrderStatusSummary[]>([]);
  const [leadTimePerformance, setLeadTimePerformance] = useState<LeadTimePerformance | null>(null);

  // Filter state
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('month');
  const [dateRange, setDateRange] = useState<{startDate: Date, endDate: Date}>({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    endDate: new Date()
  });

  // Load analytics data on component mount
  useEffect(() => {
    loadAnalyticsData();
  }, [timePeriod, dateRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Prepare filters based on selected time period and date range
      const filters: AnalyticsFilters = {
        period: timePeriod,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      };

      // Load all analytics data in parallel
      const analytics = await getVendorAnalytics(filters);

      // Update state with received data
      setSalesOverview(analytics.salesOverview);
      setTopProducts(analytics.topProducts);
      setWorstPerformers(analytics.worstPerformers);
      setHighMarginProducts(analytics.highMarginProducts);
      setInventoryForecasts(analytics.inventoryForecasts);
      setOrderStatusSummary(analytics.orderStatusSummary);
      setLeadTimePerformance(analytics.leadTimePerformance);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics data');
      console.error('Error loading analytics data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle time period change
  const handlePeriodChange = (period: TimePeriod) => {
    setTimePeriod(period);

    // Adjust date range based on selected period
    const endDate = new Date();
    let startDate = new Date();

    switch (period) {
      case 'day':
        startDate.setDate(endDate.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        // 'custom' - keep existing date range
        return;
    }

    setDateRange({ startDate, endDate });
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="p-6 bg-red-50 text-red-600 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Error Loading Data</h2>
        <p>{error}</p>
        <button
          onClick={loadAnalyticsData}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Vendor Analytics Dashboard</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => handlePeriodChange('day')}
            className={`px-3 py-1 rounded text-sm ${timePeriod === 'day' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Day
          </button>
          <button
            onClick={() => handlePeriodChange('week')}
            className={`px-3 py-1 rounded text-sm ${timePeriod === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Week
          </button>
          <button
            onClick={() => handlePeriodChange('month')}
            className={`px-3 py-1 rounded text-sm ${timePeriod === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Month
          </button>
          <button
            onClick={() => handlePeriodChange('quarter')}
            className={`px-3 py-1 rounded text-sm ${timePeriod === 'quarter' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Quarter
          </button>
          <button
            onClick={() => handlePeriodChange('year')}
            className={`px-3 py-1 rounded text-sm ${timePeriod === 'year' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Year
          </button>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Overview - Takes up full width on first row */}
        <div className="lg:col-span-3">
          <SalesOverviewCard data={salesOverview} />
        </div>

        {/* Product Performance - Each takes 1/3 of the width */}
        <div>
          <ProductPerformanceCard
            title="Top Selling Products"
            products={topProducts}
            highlightField="revenue"
          />
        </div>
        <div>
          <ProductPerformanceCard
            title="High Margin Products"
            products={highMarginProducts}
            highlightField="margin"
          />
        </div>
        <div>
          <ProductPerformanceCard
            title="Return Rate Issues"
            products={worstPerformers}
            highlightField="returnRate"
          />
        </div>

        {/* Order Status and Inventory - Each takes half width on third row */}
        <div className="lg:col-span-2">
          <OrderStatusSummaryCard data={orderStatusSummary} />
        </div>
        <div>
          <InventoryForecastsCard data={inventoryForecasts} />
        </div>

        {/* Lead Time Performance - Takes up full width on fourth row */}
        <div className="lg:col-span-3">
          <LeadTimePerformanceCard data={leadTimePerformance} />
        </div>
      </div>
    </div>
  );
};

export default VendorAnalytics;
