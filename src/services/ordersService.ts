/**
 * Orders Service
 *
 * This service manages customer orders with database integration
 */
import { authService } from './authService';
import apiClient from './apiClient';
import { Product } from '../models/Product';

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELED = 'canceled'
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  width?: number;
  height?: number;
  options: Record<string, string>;
  image?: string;
}

export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  orderDate: Date;
  status: OrderStatus;
  items: OrderItem[];
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  shippingMethod: string;
  shippingCost: number;
  subtotal: number;
  tax: number;
  discount?: number;
  total: number;
  estimatedDeliveryDate?: Date;
  paymentMethod: string;
  paymentStatus: 'paid' | 'pending' | 'failed';
  trackingNumber?: string;
  trackingUrl?: string;
  notes?: string;
}

// Sample tracking events data structure
export interface TrackingEvent {
  date: Date;
  location: string;
  status: string;
  description: string;
}

export interface OrderTracking {
  orderId: string;
  orderNumber: string;
  carrier: string;
  trackingNumber: string;
  trackingUrl: string;
  status: string;
  estimatedDelivery: Date;
  events: TrackingEvent[];
}

// Mock database for orders
const ORDERS_DB: Order[] = [
  {
    id: 'order1',
    userId: 'user1',
    orderNumber: 'SB-1001',
    orderDate: new Date('2024-03-01T10:15:00'),
    status: OrderStatus.DELIVERED,
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
      name: 'John Doe',
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
    estimatedDeliveryDate: new Date('2024-03-10'),
    paymentMethod: 'Credit Card',
    paymentStatus: 'paid',
    trackingNumber: '1Z999AA10123456784',
    trackingUrl: 'https://www.ups.com/track?tracknum=1Z999AA10123456784'
  },
  {
    id: 'order2',
    userId: 'user1',
    orderNumber: 'SB-1002',
    orderDate: new Date('2024-03-15T14:30:00'),
    status: OrderStatus.SHIPPED,
    items: [
      {
        id: 'item2',
        productId: 'product-2',
        productName: 'Premium Wood Blinds',
        price: 189.99,
        quantity: 1,
        width: 42,
        height: 60,
        options: {
          color: 'oak',
          slatSize: '2-inch',
          controlType: 'standard'
        },
        image: 'https://ext.same-assets.com/2035588304/4222638957.jpeg'
      }
    ],
    shippingAddress: {
      name: 'John Doe',
      street: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      zipCode: '90210',
      country: 'USA'
    },
    shippingMethod: 'Express',
    shippingCost: 19.99,
    subtotal: 189.99,
    tax: 15.96,
    total: 225.94,
    estimatedDeliveryDate: new Date('2024-03-20'),
    paymentMethod: 'PayPal',
    paymentStatus: 'paid',
    trackingNumber: '9400111202555842761523',
    trackingUrl: 'https://tools.usps.com/go/TrackConfirmAction?qtc_tLabels1=9400111202555842761523'
  },
  {
    id: 'order3',
    userId: 'user1',
    orderNumber: 'SB-1003',
    orderDate: new Date('2024-04-01T09:45:00'),
    status: OrderStatus.PROCESSING,
    items: [
      {
        id: 'item3',
        productId: 'product-3',
        productName: 'Blackout Roller Shades',
        price: 159.99,
        quantity: 3,
        width: 30,
        height: 72,
        options: {
          color: 'navy',
          opacity: 'blackout',
          controlType: 'motorized'
        },
        image: 'https://ext.same-assets.com/2035588304/3481927610.jpeg'
      },
      {
        id: 'item4',
        productId: 'product-4',
        productName: 'Faux Wood Blinds',
        price: 89.99,
        quantity: 1,
        width: 24,
        height: 36,
        options: {
          color: 'white',
          slatSize: '2-inch',
          controlType: 'cordless'
        },
        image: '/images/faux-wood-blinds.jpg'
      }
    ],
    shippingAddress: {
      name: 'John Doe',
      street: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      zipCode: '90210',
      country: 'USA'
    },
    shippingMethod: 'Standard',
    shippingCost: 14.99,
    subtotal: 569.96,
    tax: 47.88,
    total: 632.83,
    estimatedDeliveryDate: new Date('2024-04-10'),
    paymentMethod: 'Credit Card',
    paymentStatus: 'paid'
  }
];

// Mock database for tracking data
const TRACKING_DB: Record<string, OrderTracking> = {
  'order1': {
    orderId: 'order1',
    orderNumber: 'SB-1001',
    carrier: 'UPS',
    trackingNumber: '1Z999AA10123456784',
    trackingUrl: 'https://www.ups.com/track?tracknum=1Z999AA10123456784',
    status: 'Delivered',
    estimatedDelivery: new Date('2024-03-10'),
    events: [
      {
        date: new Date('2024-03-10T14:23:00'),
        location: 'Anytown, CA',
        status: 'Delivered',
        description: 'Package delivered to recipient address'
      },
      {
        date: new Date('2024-03-10T08:12:00'),
        location: 'Anytown, CA',
        status: 'Out for Delivery',
        description: 'Out for delivery with courier'
      },
      {
        date: new Date('2024-03-09T19:45:00'),
        location: 'Anytown Distribution Center, CA',
        status: 'In Transit',
        description: 'Arrived at local facility'
      },
      {
        date: new Date('2024-03-07T22:30:00'),
        location: 'Denver, CO',
        status: 'In Transit',
        description: 'Departed regional facility'
      },
      {
        date: new Date('2024-03-05T10:15:00'),
        location: 'Chicago, IL',
        status: 'In Transit',
        description: 'Arrived at regional facility'
      },
      {
        date: new Date('2024-03-03T15:45:00'),
        location: 'Shipping Partner Facility',
        status: 'In Transit',
        description: 'Package picked up'
      },
      {
        date: new Date('2024-03-02T11:20:00'),
        location: 'Shipping Partner Facility',
        status: 'Label Created',
        description: 'Shipping label created'
      }
    ]
  },
  'order2': {
    orderId: 'order2',
    orderNumber: 'SB-1002',
    carrier: 'USPS',
    trackingNumber: '9400111202555842761523',
    trackingUrl: 'https://tools.usps.com/go/TrackConfirmAction?qtc_tLabels1=9400111202555842761523',
    status: 'In Transit',
    estimatedDelivery: new Date('2024-03-20'),
    events: [
      {
        date: new Date('2024-03-18T15:30:00'),
        location: 'Regional Distribution Center, CA',
        status: 'In Transit',
        description: 'Arrived at regional facility'
      },
      {
        date: new Date('2024-03-17T09:45:00'),
        location: 'Phoenix, AZ',
        status: 'In Transit',
        description: 'Departed regional facility'
      },
      {
        date: new Date('2024-03-16T12:20:00'),
        location: 'Shipping Partner Facility',
        status: 'In Transit',
        description: 'Package processed'
      },
      {
        date: new Date('2024-03-15T16:30:00'),
        location: 'Shipping Partner Facility',
        status: 'Label Created',
        description: 'Shipping label created'
      }
    ]
  }
};

/**
 * Get all orders for the current user from the API
 */
export const getOrders = async (): Promise<Order[]> => {
  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  return apiClient.get<Order[]>(
    `/orders`,
    {},
    async () => {
      // Mock fallback implementation
      await new Promise(resolve => setTimeout(resolve, 600)); // Simulate API delay

      // Filter orders by user ID
      return ORDERS_DB
        .filter(order => order.userId === currentUser.id)
        .sort((a, b) => b.orderDate.getTime() - a.orderDate.getTime()); // Sort by most recent first
    }
  );
};

/**
 * Get a specific order by ID from the API
 */
export const getOrderById = async (orderId: string): Promise<Order> => {
  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  return apiClient.get<Order>(
    `/orders/${orderId}`,
    {},
    async () => {
      // Mock fallback implementation
      await new Promise(resolve => setTimeout(resolve, 400)); // Simulate API delay

      // Find order in mock database
      const order = ORDERS_DB.find(o => o.id === orderId && o.userId === currentUser.id);

      if (!order) {
        throw new Error(`Order with ID ${orderId} not found`);
      }

      return order;
    }
  );
};

/**
 * Get tracking information for an order from the API
 */
export const getOrderTracking = async (orderId: string): Promise<OrderTracking> => {
  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  return apiClient.get<OrderTracking>(
    `/orders/${orderId}/tracking`,
    {},
    async () => {
      // Mock fallback implementation
      await new Promise(resolve => setTimeout(resolve, 700)); // Simulate API delay

      // Check if the order exists and belongs to the current user
      const order = ORDERS_DB.find(o => o.id === orderId && o.userId === currentUser.id);

      if (!order) {
        throw new Error(`Order with ID ${orderId} not found`);
      }

      // Get tracking info from mock database
      const tracking = TRACKING_DB[orderId];

      if (!tracking) {
        // If no tracking info exists, create a basic one
        return {
          orderId,
          orderNumber: order.orderNumber,
          carrier: 'Unknown',
          trackingNumber: order.trackingNumber || 'Not available yet',
          trackingUrl: order.trackingUrl || '#',
          status: 'Processing',
          estimatedDelivery: order.estimatedDeliveryDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          events: [
            {
              date: order.orderDate,
              location: 'Processing Facility',
              status: 'Order Received',
              description: 'Your order has been received and is being processed.'
            }
          ]
        };
      }

      return tracking;
    }
  );
};

/**
 * Cancel an order via the API
 */
export const cancelOrder = async (orderId: string, reason: string): Promise<Order> => {
  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  return apiClient.post<Order>(
    `/orders/${orderId}/cancel`,
    { reason },
    async () => {
      // Mock fallback implementation
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay

      // Find order in mock database
      const orderIndex = ORDERS_DB.findIndex(o => o.id === orderId && o.userId === currentUser.id);

      if (orderIndex === -1) {
        throw new Error(`Order with ID ${orderId} not found`);
      }

      // Check if the order can be canceled (only pending or processing orders)
      if (![OrderStatus.PENDING, OrderStatus.PROCESSING].includes(ORDERS_DB[orderIndex].status)) {
        throw new Error(`Cannot cancel order with status ${ORDERS_DB[orderIndex].status}`);
      }

      // Update order status
      ORDERS_DB[orderIndex].status = OrderStatus.CANCELED;
      ORDERS_DB[orderIndex].notes = `Canceled by customer. Reason: ${reason}`;

      return ORDERS_DB[orderIndex];
    }
  );
};

/**
 * Place a new order via the API
 */
export const placeOrder = async (orderData: Omit<Order, 'id' | 'userId' | 'orderNumber' | 'orderDate' | 'paymentStatus'>): Promise<Order> => {
  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  return apiClient.post<Order>(
    `/orders`,
    orderData,
    async () => {
      // Mock fallback implementation
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay

      // Generate a new order number (simple implementation for mock)
      const orderNumber = `SB-${1000 + ORDERS_DB.length + 1}`;

      // Create the new order
      const newOrder: Order = {
        id: `order${Date.now()}`,
        userId: currentUser.id,
        orderNumber,
        orderDate: new Date(),
        status: OrderStatus.PENDING,
        paymentStatus: 'paid',
        ...orderData
      };

      // Add to mock database
      ORDERS_DB.push(newOrder);

      return newOrder;
    }
  );
};
