import React, { useState, useEffect } from 'react';
import { SAMPLE_QUOTES, Quote } from '../../models/Customer';

type TimeRange = 'day' | 'week' | 'month' | 'quarter' | 'year';

interface SalesSummary {
  totalSales: number;
  quotesCreated: number;
  quotesAccepted: number;
  conversionRate: number;
  averageSaleValue: number;
}

interface TopProduct {
  productName: string;
  count: number;
  revenue: number;
}

const SalesReports: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [salesData, setSalesData] = useState<SalesSummary>({
    totalSales: 0,
    quotesCreated: 0,
    quotesAccepted: 0,
    conversionRate: 0,
    averageSaleValue: 0
  });
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<{month: string; sales: number}[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulating API call to get sales data
    setIsLoading(true);

    setTimeout(() => {
      // Filter quotes by time range
      const now = new Date();
      const filteredQuotes = SAMPLE_QUOTES.filter(quote => {
        const quoteDate = new Date(quote.date);

        switch (timeRange) {
          case 'day':
            return quoteDate.toDateString() === now.toDateString();
          case 'week':
            const weekAgo = new Date(now);
            weekAgo.setDate(now.getDate() - 7);
            return quoteDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(now);
            monthAgo.setMonth(now.getMonth() - 1);
            return quoteDate >= monthAgo;
          case 'quarter':
            const quarterAgo = new Date(now);
            quarterAgo.setMonth(now.getMonth() - 3);
            return quoteDate >= quarterAgo;
          case 'year':
            const yearAgo = new Date(now);
            yearAgo.setFullYear(now.getFullYear() - 1);
            return quoteDate >= yearAgo;
          default:
            return true;
        }
      });

      // Calculate sales summary
      const acceptedQuotes = filteredQuotes.filter(quote => quote.status === 'accepted');
      const totalSales = acceptedQuotes.reduce((sum, quote) => sum + quote.totalAmount, 0);

      setSalesData({
        totalSales,
        quotesCreated: filteredQuotes.length,
        quotesAccepted: acceptedQuotes.length,
        conversionRate: filteredQuotes.length > 0
          ? (acceptedQuotes.length / filteredQuotes.length) * 100
          : 0,
        averageSaleValue: acceptedQuotes.length > 0
          ? totalSales / acceptedQuotes.length
          : 0
      });

      // Generate top products
      const productMap = new Map<string, { count: number; revenue: number }>();

      // For each quote, extract products
      acceptedQuotes.forEach(quote => {
        quote.items.forEach(item => {
          const existing = productMap.get(item.productName);
          if (existing) {
            existing.count += item.quantity;
            existing.revenue += item.totalPrice;
          } else {
            productMap.set(item.productName, {
              count: item.quantity,
              revenue: item.totalPrice
            });
          }
        });
      });

      // Convert to array and sort by revenue
      const topProductsArray = Array.from(productMap.entries())
        .map(([productName, { count, revenue }]) => ({
          productName,
          count,
          revenue
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      setTopProducts(topProductsArray);

      // Generate monthly trend (last 6 months)
      const trend = [];

      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthYear = date.toLocaleDateString('default', { month: 'short', year: 'numeric' });

        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        const monthSales = acceptedQuotes
          .filter(quote => {
            const quoteDate = new Date(quote.date);
            return quoteDate >= monthStart && quoteDate <= monthEnd;
          })
          .reduce((sum, quote) => sum + quote.totalAmount, 0);

        trend.push({
          month: monthYear,
          sales: monthSales
        });
      }

      setMonthlyTrend(trend);
      setIsLoading(false);
    }, 500);
  }, [timeRange]);

  const getPerformanceIndicator = (value: number, targetValue: number): string => {
    const percentage = (value / targetValue) * 100;
    if (percentage >= 100) return 'text-green-500';
    if (percentage >= 75) return 'text-yellow-500';
    return 'text-red-500';
  };

  // These are sample target values - in a real app, these would come from the API
  const targetValues = {
    totalSales: 10000,
    quotesCreated: 20,
    quotesAccepted: 10,
    conversionRate: 50,
    averageSaleValue: 1000
  };

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4 md:mb-0">Sales Performance</h1>

        <div className="flex space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
            className="px-3 py-2 border border-gray-300 rounded focus:ring-primary-red focus:border-primary-red"
          >
            <option value="day">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button
            className="px-3 py-2 bg-primary-red text-white rounded hover:bg-red-700"
          >
            Download Report
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-red"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="text-gray-500 text-sm mb-1">Total Sales</h3>
              <div className="flex items-baseline">
                <span className={`text-2xl font-bold ${getPerformanceIndicator(salesData.totalSales, targetValues.totalSales)}`}>
                  ${salesData.totalSales.toLocaleString()}
                </span>
                <span className="text-xs ml-2 text-gray-500">
                  Target: ${targetValues.totalSales.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="text-gray-500 text-sm mb-1">Quotes Created</h3>
              <div className="flex items-baseline">
                <span className={`text-2xl font-bold ${getPerformanceIndicator(salesData.quotesCreated, targetValues.quotesCreated)}`}>
                  {salesData.quotesCreated}
                </span>
                <span className="text-xs ml-2 text-gray-500">
                  Target: {targetValues.quotesCreated}
                </span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="text-gray-500 text-sm mb-1">Quotes Accepted</h3>
              <div className="flex items-baseline">
                <span className={`text-2xl font-bold ${getPerformanceIndicator(salesData.quotesAccepted, targetValues.quotesAccepted)}`}>
                  {salesData.quotesAccepted}
                </span>
                <span className="text-xs ml-2 text-gray-500">
                  Target: {targetValues.quotesAccepted}
                </span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="text-gray-500 text-sm mb-1">Conversion Rate</h3>
              <div className="flex items-baseline">
                <span className={`text-2xl font-bold ${getPerformanceIndicator(salesData.conversionRate, targetValues.conversionRate)}`}>
                  {salesData.conversionRate.toFixed(1)}%
                </span>
                <span className="text-xs ml-2 text-gray-500">
                  Target: {targetValues.conversionRate}%
                </span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="text-gray-500 text-sm mb-1">Avg. Sale Value</h3>
              <div className="flex items-baseline">
                <span className={`text-2xl font-bold ${getPerformanceIndicator(salesData.averageSaleValue, targetValues.averageSaleValue)}`}>
                  ${salesData.averageSaleValue.toFixed(2)}
                </span>
                <span className="text-xs ml-2 text-gray-500">
                  Target: ${targetValues.averageSaleValue}
                </span>
              </div>
            </div>
          </div>

          {/* Monthly Sales Trend */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Monthly Sales Trend</h3>
            <div className="h-64">
              {/* This would normally be a chart component like Chart.js or Recharts */}
              {/* For now, we'll show a simple bar representation */}
              <div className="flex h-48 items-end justify-between">
                {monthlyTrend.map((data, index) => {
                  const maxSales = Math.max(...monthlyTrend.map(d => d.sales));
                  const height = maxSales > 0 ? (data.sales / maxSales) * 100 : 0;

                  return (
                    <div key={index} className="flex flex-col items-center justify-end flex-1">
                      <div
                        className="w-4/5 bg-primary-red rounded-t"
                        style={{ height: `${height}%` }}
                      ></div>
                      <div className="mt-2 text-xs text-gray-500">{data.month}</div>
                      <div className="text-xs font-medium">${data.sales.toLocaleString()}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Selling Products */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Top Selling Products</h3>
              {topProducts.length > 0 ? (
                <div className="space-y-4">
                  {topProducts.map((product, index) => (
                    <div key={index} className="flex justify-between items-center pb-2 border-b border-gray-100">
                      <div>
                        <div className="font-medium">{product.productName}</div>
                        <div className="text-sm text-gray-500">{product.count} units sold</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${product.revenue.toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No sales data available for the selected period.
                </div>
              )}
            </div>

            {/* Recent Quotes */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Recent Quotes</h3>
              {SAMPLE_QUOTES.length > 0 ? (
                <div className="space-y-4">
                  {SAMPLE_QUOTES.slice(0, 5).map((quote, index) => (
                    <div key={index} className="flex justify-between items-center pb-2 border-b border-gray-100">
                      <div>
                        <div className="font-medium">{quote.customerName}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(quote.date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${quote.totalAmount.toLocaleString()}</div>
                        <div className={`text-xs rounded-full px-2 py-0.5 inline-block ${
                          quote.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          quote.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                          quote.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No quotes available for the selected period.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesReports;
