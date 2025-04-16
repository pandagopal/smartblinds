/**
 * Vendor Analytics Service
 *
 * Provides data and insights for the vendor dashboard analytics
 * Connects to database for real-time and historical analytics
 */

import apiClient from './apiClient';
import { authService } from './authService';
import { VendorOrderStatus } from './vendorOrderService';

// Types for analytics data
export interface SalesOverview {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  salesByDay?: { date: string; revenue: number; orders: number }[];
  comparisonWithPrevious?: {
    revenueChange: number;
    ordersChange: number;
    aovChange: number;
  };
}

export interface ProductPerformance {
  productId: string;
  productName: string;
  unitsSold: number;
  revenue: number;
  margin: number;
  returnRate: number;
  avgRating: number;
}

export interface InventoryForecast {
  materialId: string;
  materialName: string;
  currentStock: number;
  reorderPoint: number;
  forecastDepleted: Date;
  suggestedReorder: number;
  historicalUsage: { month: string; usage: number }[];
}

export interface OrderStatusSummary {
  status: VendorOrderStatus;
  count: number;
  percentage: number;
  value: number;
}

export interface LeadTimePerformance {
  averageLeadTime: number; // in days
  targetLeadTime: number;
  leadTimeByProduct: { productId: string; productName: string; averageLeadTime: number }[];
  leadTimeByMonth: { month: string; averageLeadTime: number }[];
  onTimeDeliveryRate: number;
}

export interface VendorAnalytics {
  salesOverview: SalesOverview;
  topProducts: ProductPerformance[];
  worstPerformers: ProductPerformance[];
  highMarginProducts: ProductPerformance[];
  inventoryForecasts: InventoryForecast[];
  orderStatusSummary: OrderStatusSummary[];
  leadTimePerformance: LeadTimePerformance;
}

// Time period for analytics queries
export type TimePeriod = 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

// Analytics filter options
export interface AnalyticsFilters {
  startDate?: Date;
  endDate?: Date;
  period?: TimePeriod;
  productIds?: string[];
  productCategories?: string[];
  minimumOrders?: number;
}

/**
 * Get a comprehensive vendor analytics dashboard data
 */
export const getVendorAnalytics = async (filters: AnalyticsFilters = {}): Promise<VendorAnalytics> => {
  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  // Verify user is a vendor
  if (!currentUser.roles?.includes('vendor')) {
    throw new Error('Access denied: Vendor role required');
  }

  return apiClient.get<VendorAnalytics>(
    '/vendor/analytics',
    filters,
    async () => {
      // Mock fallback implementation
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay

      // Generate date-based analytics with real dates
      const today = new Date();
      const startDate = filters.startDate || new Date(today.setMonth(today.getMonth() - 1));
      const endDate = filters.endDate || new Date();

      // Generate daily data points for the specified period
      const dailyData = generateDailyData(startDate, endDate);

      // Calculate totals and averages
      const totalRevenue = dailyData.reduce((sum, day) => sum + day.revenue, 0);
      const totalOrders = dailyData.reduce((sum, day) => sum + day.orders, 0);
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Previous period comparison (for showing growth/decline)
      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const prevStartDate = new Date(startDate);
      prevStartDate.setDate(prevStartDate.getDate() - daysDiff);
      const prevEndDate = new Date(startDate);
      prevEndDate.setDate(prevEndDate.getDate() - 1);

      const prevPeriodData = generateDailyData(prevStartDate, prevEndDate);
      const prevTotalRevenue = prevPeriodData.reduce((sum, day) => sum + day.revenue, 0);
      const prevTotalOrders = prevPeriodData.reduce((sum, day) => sum + day.orders, 0);
      const prevAverageOrderValue = prevTotalOrders > 0 ? prevTotalRevenue / prevTotalOrders : 0;

      // Calculate percentage changes
      const revenueChange = prevTotalRevenue > 0
        ? ((totalRevenue - prevTotalRevenue) / prevTotalRevenue) * 100
        : 100;
      const ordersChange = prevTotalOrders > 0
        ? ((totalOrders - prevTotalOrders) / prevTotalOrders) * 100
        : 100;
      const aovChange = prevAverageOrderValue > 0
        ? ((averageOrderValue - prevAverageOrderValue) / prevAverageOrderValue) * 100
        : 0;

      // Generate product performance data
      const productPerformanceData = generateProductPerformanceData(filters);

      // Sort products by different metrics
      const topProducts = [...productPerformanceData]
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      const worstPerformers = [...productPerformanceData]
        .sort((a, b) => b.returnRate - a.returnRate)
        .slice(0, 5);

      const highMarginProducts = [...productPerformanceData]
        .sort((a, b) => b.margin - a.margin)
        .slice(0, 5);

      // Generate inventory forecasts
      const inventoryForecasts = generateInventoryForecasts();

      // Generate order status summary
      const orderStatusSummary = generateOrderStatusSummary();

      // Generate lead time performance
      const leadTimePerformance = generateLeadTimePerformance();

      return {
        salesOverview: {
          totalRevenue,
          totalOrders,
          averageOrderValue,
          period: determinePeriod(startDate, endDate),
          salesByDay: dailyData,
          comparisonWithPrevious: {
            revenueChange,
            ordersChange,
            aovChange
          }
        },
        topProducts,
        worstPerformers,
        highMarginProducts,
        inventoryForecasts,
        orderStatusSummary,
        leadTimePerformance
      };
    }
  );
};

/**
 * Get detailed sales data for a specific period
 */
export const getSalesData = async (filters: AnalyticsFilters = {}): Promise<SalesOverview> => {
  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  // Verify user is a vendor
  if (!currentUser.roles?.includes('vendor')) {
    throw new Error('Access denied: Vendor role required');
  }

  return apiClient.get<SalesOverview>(
    '/vendor/analytics/sales',
    filters,
    async () => {
      // Mock fallback implementation
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay

      // Generate date-based analytics with real dates
      const today = new Date();
      const startDate = filters.startDate || new Date(today.setMonth(today.getMonth() - 1));
      const endDate = filters.endDate || new Date();

      // Generate daily data points for the specified period
      const dailyData = generateDailyData(startDate, endDate);

      // Calculate totals and averages
      const totalRevenue = dailyData.reduce((sum, day) => sum + day.revenue, 0);
      const totalOrders = dailyData.reduce((sum, day) => sum + day.orders, 0);
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Previous period comparison
      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const prevStartDate = new Date(startDate);
      prevStartDate.setDate(prevStartDate.getDate() - daysDiff);
      const prevEndDate = new Date(startDate);
      prevEndDate.setDate(prevEndDate.getDate() - 1);

      const prevPeriodData = generateDailyData(prevStartDate, prevEndDate);
      const prevTotalRevenue = prevPeriodData.reduce((sum, day) => sum + day.revenue, 0);
      const prevTotalOrders = prevPeriodData.reduce((sum, day) => sum + day.orders, 0);
      const prevAverageOrderValue = prevTotalOrders > 0 ? prevTotalRevenue / prevTotalOrders : 0;

      // Calculate percentage changes
      const revenueChange = prevTotalRevenue > 0
        ? ((totalRevenue - prevTotalRevenue) / prevTotalRevenue) * 100
        : 100;
      const ordersChange = prevTotalOrders > 0
        ? ((totalOrders - prevTotalOrders) / prevTotalOrders) * 100
        : 100;
      const aovChange = prevAverageOrderValue > 0
        ? ((averageOrderValue - prevAverageOrderValue) / prevAverageOrderValue) * 100
        : 0;

      return {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        period: determinePeriod(startDate, endDate),
        salesByDay: dailyData,
        comparisonWithPrevious: {
          revenueChange,
          ordersChange,
          aovChange
        }
      };
    }
  );
};

/**
 * Get detailed product performance data
 */
export const getProductPerformance = async (filters: AnalyticsFilters = {}): Promise<ProductPerformance[]> => {
  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  // Verify user is a vendor
  if (!currentUser.roles?.includes('vendor')) {
    throw new Error('Access denied: Vendor role required');
  }

  return apiClient.get<ProductPerformance[]>(
    '/vendor/analytics/products',
    filters,
    async () => {
      // Mock fallback implementation
      await new Promise(resolve => setTimeout(resolve, 600)); // Simulate API delay

      return generateProductPerformanceData(filters);
    }
  );
};

/**
 * Get inventory forecast data
 */
export const getInventoryForecasts = async (): Promise<InventoryForecast[]> => {
  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  // Verify user is a vendor
  if (!currentUser.roles?.includes('vendor')) {
    throw new Error('Access denied: Vendor role required');
  }

  return apiClient.get<InventoryForecast[]>(
    '/vendor/analytics/inventory',
    {},
    async () => {
      // Mock fallback implementation
      await new Promise(resolve => setTimeout(resolve, 700)); // Simulate API delay

      return generateInventoryForecasts();
    }
  );
};

/**
 * Get order status summary
 */
export const getOrderStatusSummary = async (): Promise<OrderStatusSummary[]> => {
  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  // Verify user is a vendor
  if (!currentUser.roles?.includes('vendor')) {
    throw new Error('Access denied: Vendor role required');
  }

  return apiClient.get<OrderStatusSummary[]>(
    '/vendor/analytics/order-status',
    {},
    async () => {
      // Mock fallback implementation
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay

      return generateOrderStatusSummary();
    }
  );
};

/**
 * Get lead time performance data
 */
export const getLeadTimePerformance = async (filters: AnalyticsFilters = {}): Promise<LeadTimePerformance> => {
  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  // Verify user is a vendor
  if (!currentUser.roles?.includes('vendor')) {
    throw new Error('Access denied: Vendor role required');
  }

  return apiClient.get<LeadTimePerformance>(
    '/vendor/analytics/lead-time',
    filters,
    async () => {
      // Mock fallback implementation
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay

      return generateLeadTimePerformance();
    }
  );
};

// Helper functions for generating analytics data

/**
 * Determine the period based on start and end dates
 */
function determinePeriod(startDate: Date, endDate: Date): 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' {
  const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  if (daysDiff <= 7) return 'daily';
  if (daysDiff <= 31) return 'weekly';
  if (daysDiff <= 90) return 'monthly';
  if (daysDiff <= 365) return 'quarterly';
  return 'yearly';
}

/**
 * Generate daily sales data between two dates
 */
function generateDailyData(startDate: Date, endDate: Date) {
  const dailyData = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    // Generate somewhat realistic data with weekday patterns
    const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 6 = Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Weekends typically have fewer orders but higher values
    const orderBaseline = isWeekend ? 3 : 5;
    const orderRandomness = isWeekend ? 2 : 4;
    const orders = Math.max(0, Math.floor(orderBaseline + Math.random() * orderRandomness));

    // Higher average order value on weekends
    const aovBaseline = isWeekend ? 300 : 220;
    const aovRandomness = isWeekend ? 200 : 150;
    const averageOrderValue = aovBaseline + Math.random() * aovRandomness;

    // Calculate daily revenue
    const revenue = orders * averageOrderValue;

    dailyData.push({
      date: currentDate.toISOString().split('T')[0],
      revenue: parseFloat(revenue.toFixed(2)),
      orders
    });

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dailyData;
}

/**
 * Generate product performance data
 */
function generateProductPerformanceData(filters: AnalyticsFilters = {}): ProductPerformance[] {
  // Product types to generate data for
  const productTypes = [
    { name: 'Faux Wood Blinds', baseMargin: 0.55, basePrice: 129.99 },
    { name: 'Cellular Shades', baseMargin: 0.62, basePrice: 149.99 },
    { name: 'Roller Shades', baseMargin: 0.58, basePrice: 99.99 },
    { name: 'Roman Shades', baseMargin: 0.65, basePrice: 189.99 },
    { name: 'Vertical Blinds', baseMargin: 0.52, basePrice: 159.99 },
    { name: 'Wood Blinds', baseMargin: 0.60, basePrice: 179.99 },
    { name: 'Solar Shades', baseMargin: 0.63, basePrice: 139.99 },
    { name: 'Sheer Shades', baseMargin: 0.61, basePrice: 169.99 },
    { name: 'Mini Blinds', baseMargin: 0.48, basePrice: 79.99 },
    { name: 'Plantation Shutters', baseMargin: 0.70, basePrice: 249.99 },
    { name: 'Honeycomb Shades', baseMargin: 0.59, basePrice: 159.99 },
    { name: 'Bamboo Shades', baseMargin: 0.57, basePrice: 129.99 }
  ];

  // Generate realistic product performance data
  return productTypes.map((product, index) => {
    // Vary units sold between products
    const unitsSold = Math.floor(15 + Math.random() * 50);

    // Calculate revenue (adding variety in unit pricing)
    const priceVariance = (Math.random() * 0.2) - 0.1; // -10% to +10%
    const adjustedPrice = product.basePrice * (1 + priceVariance);
    const revenue = unitsSold * adjustedPrice;

    // Vary margins slightly
    const marginVariance = (Math.random() * 0.1) - 0.05; // -5% to +5%
    const margin = Math.min(0.85, Math.max(0.35, product.baseMargin + marginVariance));

    // Generate return rate (higher for certain products)
    let baseReturnRate = 0.02; // 2% base return rate
    if (product.name.includes('Mini')) baseReturnRate = 0.05; // Higher for mini blinds
    if (product.name.includes('Vertical')) baseReturnRate = 0.04; // Higher for vertical blinds

    const returnRateVariance = (Math.random() * 0.02); // 0% to +2%
    const returnRate = baseReturnRate + returnRateVariance;

    // Generate average rating (inversely related to return rate)
    const baseRating = 4.5 - (returnRate * 10);
    const ratingVariance = (Math.random() * 0.5) - 0.25; // -0.25 to +0.25
    const avgRating = Math.min(5, Math.max(1, baseRating + ratingVariance));

    return {
      productId: `product-${index + 1}`,
      productName: product.name,
      unitsSold,
      revenue: parseFloat(revenue.toFixed(2)),
      margin: parseFloat(margin.toFixed(2)),
      returnRate: parseFloat(returnRate.toFixed(3)),
      avgRating: parseFloat(avgRating.toFixed(1))
    };
  });
}

/**
 * Generate inventory forecast data
 */
function generateInventoryForecasts(): InventoryForecast[] {
  const materials = [
    { id: 'mat-1', name: 'White Faux Wood Slats' },
    { id: 'mat-2', name: 'Oak Veneer' },
    { id: 'mat-3', name: 'Light Filtering Fabric - White' },
    { id: 'mat-4', name: 'Blackout Fabric - Beige' },
    { id: 'mat-5', name: 'Aluminum Rails - White' },
    { id: 'mat-6', name: 'Bamboo Cords' },
    { id: 'mat-7', name: 'Chain Control Mechanisms' },
    { id: 'mat-8', name: 'Motor Components' }
  ];

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  // Current date for calculations
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();

  return materials.map(material => {
    // Generate current stock
    const currentStock = Math.floor(500 + Math.random() * 2000);

    // Generate reorder point (lower for some materials to show urgency)
    const isLowStock = material.id === 'mat-3' || material.id === 'mat-7';
    const reorderPoint = isLowStock ?
      Math.floor(400 + Math.random() * 200) :
      Math.floor(300 + Math.random() * 200);

    // Generate usage history (with seasonal patterns)
    const historicalUsage = months.map((month, index) => {
      // Seasonal pattern: higher in spring/summer (months 3-8)
      const seasonalFactor = (index >= 3 && index <= 8) ? 1.3 : 0.85;

      // Random monthly variation
      const randomFactor = 0.7 + (Math.random() * 0.6); // 0.7 to 1.3

      // Base usage
      const baseUsage = 100 + Math.random() * 300;

      // Combined usage with seasonal and random factors
      const usage = Math.floor(baseUsage * seasonalFactor * randomFactor);

      return { month, usage };
    });

    // Calculate average monthly usage from historical data
    const avgMonthlyUsage = historicalUsage.reduce((sum, month) => sum + month.usage, 0) / 12;

    // Calculate depletion date
    let daysUntilDepleted = 30;
    if (currentStock > reorderPoint) {
      const excessStock = currentStock - reorderPoint;
      const dailyUsage = avgMonthlyUsage / 30;
      daysUntilDepleted = Math.floor(excessStock / dailyUsage);
    }

    const depletionDate = new Date(currentDate);
    depletionDate.setDate(depletionDate.getDate() + daysUntilDepleted);

    // Calculate suggested reorder (3 months of average usage)
    const suggestedReorder = Math.ceil(avgMonthlyUsage * 3);

    return {
      materialId: material.id,
      materialName: material.name,
      currentStock,
      reorderPoint,
      forecastDepleted: depletionDate,
      suggestedReorder,
      historicalUsage: historicalUsage
    };
  });
}

/**
 * Generate order status summary
 */
function generateOrderStatusSummary(): OrderStatusSummary[] {
  // Define base counts for each status
  const baseCounts = {
    [VendorOrderStatus.ORDER_RECEIVED]: 12,
    [VendorOrderStatus.IN_PRODUCTION]: 28,
    [VendorOrderStatus.QUALITY_CHECK]: 8,
    [VendorOrderStatus.SHIPPED]: 18,
    [VendorOrderStatus.DELIVERED]: 142
  };

  // Add randomness to counts
  const statusCounts = Object.entries(baseCounts).map(([status, count]) => ({
    status: status as VendorOrderStatus,
    count: Math.max(0, Math.floor(count + (Math.random() * count * 0.2) - (count * 0.1))) // ±10% randomness
  }));

  // Calculate total count for percentages
  const totalCount = statusCounts.reduce((sum, status) => sum + status.count, 0);

  // Generate average values for each status
  const avgValues = {
    [VendorOrderStatus.ORDER_RECEIVED]: 185,
    [VendorOrderStatus.IN_PRODUCTION]: 220,
    [VendorOrderStatus.QUALITY_CHECK]: 195,
    [VendorOrderStatus.SHIPPED]: 205,
    [VendorOrderStatus.DELIVERED]: 190
  };

  // Complete the summary with percentages and values
  return statusCounts.map(status => {
    const percentage = totalCount > 0 ? (status.count / totalCount) * 100 : 0;

    // Add some randomness to the average values
    const baseValue = avgValues[status.status];
    const valueVariance = (Math.random() * 60) - 30; // ±$30 variance
    const avgOrderValue = baseValue + valueVariance;
    const value = status.count * avgOrderValue;

    return {
      status: status.status,
      count: status.count,
      percentage: parseFloat(percentage.toFixed(1)),
      value: parseFloat(value.toFixed(2))
    };
  });
}

/**
 * Generate lead time performance data
 */
function generateLeadTimePerformance(): LeadTimePerformance {
  // Define target lead time
  const targetLeadTime = 14; // 14 days

  // Generate average lead time (slightly above or below target)
  const leadTimeVariance = (Math.random() * 6) - 3; // ±3 days
  const averageLeadTime = targetLeadTime + leadTimeVariance;

  // Generate lead time by product
  const products = [
    { id: 'product-1', name: 'Faux Wood Blinds' },
    { id: 'product-2', name: 'Cellular Shades' },
    { id: 'product-3', name: 'Roller Shades' },
    { id: 'product-4', name: 'Roman Shades' },
    { id: 'product-5', name: 'Vertical Blinds' },
    { id: 'product-6', name: 'Wood Blinds' }
  ];

  const leadTimeByProduct = products.map(product => {
    // Some products have better or worse lead times
    let baseLeadTime = targetLeadTime;
    if (product.name.includes('Wood')) baseLeadTime += 2; // Wood products take longer
    if (product.name.includes('Roller')) baseLeadTime -= 3; // Roller shades are faster

    // Add randomness
    const leadTimeVar = (Math.random() * 4) - 2; // ±2 days

    return {
      productId: product.id,
      productName: product.name,
      averageLeadTime: parseFloat((baseLeadTime + leadTimeVar).toFixed(1))
    };
  });

  // Generate lead time by month (showing improvement trend)
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const currentMonth = new Date().getMonth();
  const leadTimeByMonth = [];

  // Generate past months' data
  for (let i = 0; i < 12; i++) {
    const monthIndex = (currentMonth - 11 + i) % 12;
    const month = months[monthIndex];

    // Show a general trend of improvement over the year
    // Start with higher lead times that gradually improve
    const monthsAgo = 11 - i;
    const improvementFactor = monthsAgo * 0.4; // 0.4 days improvement per month
    const baseLeadTime = targetLeadTime + improvementFactor;

    // Add seasonal effects (busy seasons have higher lead times)
    const isHighSeason = monthIndex >= 3 && monthIndex <= 7; // Spring/Summer
    const seasonalFactor = isHighSeason ? 2 : 0;

    // Add randomness
    const randomVariance = (Math.random() * 2) - 1; // ±1 day

    leadTimeByMonth.push({
      month,
      averageLeadTime: parseFloat((baseLeadTime + seasonalFactor + randomVariance).toFixed(1))
    });
  }

  // Calculate on-time delivery rate
  const onTimeVariance = (Math.random() * 10) - 5; // ±5%
  const onTimeDeliveryRate = Math.min(99, Math.max(75, 88 + onTimeVariance));

  return {
    averageLeadTime: parseFloat(averageLeadTime.toFixed(1)),
    targetLeadTime,
    leadTimeByProduct,
    leadTimeByMonth,
    onTimeDeliveryRate: parseFloat(onTimeDeliveryRate.toFixed(1))
  };
}
