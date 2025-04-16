import apiClient from './apiClient';
import { authService } from './authService';
import { Order, OrderStatus, OrderItem } from './ordersService';

// Vendor-specific order statuses that are more specific to manufacturing
export enum VendorOrderStatus {
  ORDER_RECEIVED = 'Order Received',
  IN_PRODUCTION = 'In Production',
  QUALITY_CHECK = 'Quality Check',
  SHIPPED = 'Shipped',
  DELIVERED = 'Delivered'
}

// Map vendor statuses to general order statuses
const mapVendorStatusToOrderStatus = (vendorStatus: VendorOrderStatus): OrderStatus => {
  switch (vendorStatus) {
    case VendorOrderStatus.ORDER_RECEIVED:
      return OrderStatus.PROCESSING;
    case VendorOrderStatus.IN_PRODUCTION:
      return OrderStatus.PROCESSING;
    case VendorOrderStatus.QUALITY_CHECK:
      return OrderStatus.PROCESSING;
    case VendorOrderStatus.SHIPPED:
      return OrderStatus.SHIPPED;
    case VendorOrderStatus.DELIVERED:
      return OrderStatus.DELIVERED;
    default:
      return OrderStatus.PROCESSING;
  }
};

// Extended order interface with vendor-specific properties
export interface VendorOrder extends Omit<Order, 'status'> {
  status: VendorOrderStatus;
  vendorId: string;
  manufacturingId?: string;
  productionFiles?: ProductionFile[];
  vendorNotes?: string;
  customerNotes?: string;
  internalNotes?: string;
  splitOrders?: string[]; // IDs of related split orders
  parentOrderId?: string; // ID of the parent order if this is a split order
}

export interface ProductionFile {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  uploadDate: Date;
  description?: string;
}

// Mock database for vendor orders
const VENDOR_ORDERS_DB: VendorOrder[] = [
  {
    id: 'order1',
    userId: 'user1',
    vendorId: 'vendor1',
    orderNumber: 'SB-1001',
    orderDate: new Date('2024-03-01T10:15:00'),
    status: VendorOrderStatus.DELIVERED,
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
    trackingUrl: 'https://www.ups.com/track?tracknum=1Z999AA10123456784',
    manufacturingId: 'MFG-1001',
    productionFiles: [
      {
        id: 'file1',
        fileName: 'order1_cutsheet.pdf',
        fileUrl: '/files/order1_cutsheet.pdf',
        fileType: 'application/pdf',
        uploadDate: new Date('2024-03-02T09:30:00'),
        description: 'Cutting specifications sheet'
      },
      {
        id: 'file2',
        fileName: 'order1_barcode.png',
        fileUrl: '/files/order1_barcode.png',
        fileType: 'image/png',
        uploadDate: new Date('2024-03-02T09:35:00'),
        description: 'Product barcode'
      }
    ],
    customerNotes: 'Please deliver to back door'
  },
  {
    id: 'order2',
    userId: 'user1',
    vendorId: 'vendor1',
    orderNumber: 'SB-1002',
    orderDate: new Date('2024-03-15T14:30:00'),
    status: VendorOrderStatus.SHIPPED,
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
    trackingUrl: 'https://tools.usps.com/go/TrackConfirmAction?qtc_tLabels1=9400111202555842761523',
    manufacturingId: 'MFG-1002',
    vendorNotes: 'Special packaging required',
    internalNotes: 'Priority customer'
  },
  {
    id: 'order3',
    userId: 'user1',
    vendorId: 'vendor1',
    orderNumber: 'SB-1003',
    orderDate: new Date('2024-04-01T09:45:00'),
    status: VendorOrderStatus.IN_PRODUCTION,
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
    paymentStatus: 'paid',
    manufacturingId: 'MFG-1003'
  },
  {
    id: 'order4',
    userId: 'user2',
    vendorId: 'vendor1',
    orderNumber: 'SB-1004',
    orderDate: new Date('2024-04-05T11:20:00'),
    status: VendorOrderStatus.ORDER_RECEIVED,
    items: [
      {
        id: 'item5',
        productId: 'product-5',
        productName: 'Vertical Blinds',
        price: 219.99,
        quantity: 1,
        width: 72,
        height: 84,
        options: {
          color: 'gray',
          controlType: 'wand',
          openingDirection: 'left'
        },
        image: 'https://ext.same-assets.com/2035588304/9876543210.jpeg'
      }
    ],
    shippingAddress: {
      name: 'Jane Smith',
      street: '456 Oak Ave',
      city: 'Othertown',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    shippingMethod: 'Standard',
    shippingCost: 15.99,
    subtotal: 219.99,
    tax: 19.80,
    total: 255.78,
    estimatedDeliveryDate: new Date('2024-04-15'),
    paymentMethod: 'Credit Card',
    paymentStatus: 'paid',
    customerNotes: 'Please call before delivery'
  },
  {
    id: 'order5',
    userId: 'user3',
    vendorId: 'vendor1',
    orderNumber: 'SB-1005',
    orderDate: new Date('2024-04-06T15:10:00'),
    status: VendorOrderStatus.QUALITY_CHECK,
    items: [
      {
        id: 'item6',
        productId: 'product-6',
        productName: 'Roman Shades',
        price: 249.99,
        quantity: 2,
        width: 48,
        height: 60,
        options: {
          color: 'beige',
          fabric: 'linen',
          lining: 'thermal'
        },
        image: 'https://ext.same-assets.com/2035588304/1357924680.jpeg'
      }
    ],
    shippingAddress: {
      name: 'Robert Johnson',
      street: '789 Maple Dr',
      city: 'Sometown',
      state: 'TX',
      zipCode: '75001',
      country: 'USA'
    },
    shippingMethod: 'Express',
    shippingCost: 22.99,
    subtotal: 499.98,
    tax: 41.25,
    total: 564.22,
    estimatedDeliveryDate: new Date('2024-04-12'),
    paymentMethod: 'PayPal',
    paymentStatus: 'paid',
    manufacturingId: 'MFG-1005',
    productionFiles: [
      {
        id: 'file3',
        fileName: 'order5_specifications.pdf',
        fileUrl: '/files/order5_specifications.pdf',
        fileType: 'application/pdf',
        uploadDate: new Date('2024-04-07T10:15:00'),
        description: 'Roman shade specifications'
      }
    ]
  }
];

/**
 * Get all orders assigned to the vendor
 */
export const getVendorOrders = async (filters?: {
  status?: VendorOrderStatus;
  productId?: string;
  region?: string;
}): Promise<VendorOrder[]> => {
  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  // Verify user is a vendor
  if (!currentUser.roles?.includes('vendor')) {
    throw new Error('Access denied: Vendor role required');
  }

  return apiClient.get<VendorOrder[]>(
    '/vendor/orders',
    filters || {},
    async () => {
      // Mock fallback implementation
      await new Promise(resolve => setTimeout(resolve, 600)); // Simulate API delay

      // Get orders assigned to this vendor
      let orders = VENDOR_ORDERS_DB.filter(order => order.vendorId === currentUser.id);

      // Apply filters if provided
      if (filters) {
        if (filters.status) {
          orders = orders.filter(order => order.status === filters.status);
        }
        if (filters.productId) {
          orders = orders.filter(order =>
            order.items.some(item => item.productId === filters.productId)
          );
        }
        if (filters.region) {
          orders = orders.filter(order =>
            order.shippingAddress.state === filters.region ||
            order.shippingAddress.zipCode.startsWith(filters.region)
          );
        }
      }

      // Sort by most recent first
      return orders.sort((a, b) => b.orderDate.getTime() - a.orderDate.getTime());
    }
  );
};

/**
 * Get a specific vendor order by ID
 */
export const getVendorOrderById = async (orderId: string): Promise<VendorOrder> => {
  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  // Verify user is a vendor
  if (!currentUser.roles?.includes('vendor')) {
    throw new Error('Access denied: Vendor role required');
  }

  return apiClient.get<VendorOrder>(
    `/vendor/orders/${orderId}`,
    {},
    async () => {
      // Mock fallback implementation
      await new Promise(resolve => setTimeout(resolve, 400)); // Simulate API delay

      // Find order in mock database
      const order = VENDOR_ORDERS_DB.find(o => o.id === orderId && o.vendorId === currentUser.id);

      if (!order) {
        throw new Error(`Order with ID ${orderId} not found or not assigned to this vendor`);
      }

      return order;
    }
  );
};

/**
 * Update the status of a vendor order
 */
export const updateVendorOrderStatus = async (
  orderId: string,
  status: VendorOrderStatus,
  notes?: string
): Promise<VendorOrder> => {
  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  // Verify user is a vendor
  if (!currentUser.roles?.includes('vendor')) {
    throw new Error('Access denied: Vendor role required');
  }

  return apiClient.put<VendorOrder>(
    `/vendor/orders/${orderId}/status`,
    { status, notes },
    async () => {
      // Mock fallback implementation
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay

      // Find order in mock database
      const orderIndex = VENDOR_ORDERS_DB.findIndex(o => o.id === orderId && o.vendorId === currentUser.id);

      if (orderIndex === -1) {
        throw new Error(`Order with ID ${orderId} not found or not assigned to this vendor`);
      }

      // Update order status
      VENDOR_ORDERS_DB[orderIndex].status = status;

      // Add notes if provided
      if (notes) {
        VENDOR_ORDERS_DB[orderIndex].vendorNotes = notes;
      }

      return VENDOR_ORDERS_DB[orderIndex];
    }
  );
};

/**
 * Set manufacturing ID for an order
 */
export const setManufacturingId = async (
  orderId: string,
  manufacturingId: string
): Promise<VendorOrder> => {
  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  // Verify user is a vendor
  if (!currentUser.roles?.includes('vendor')) {
    throw new Error('Access denied: Vendor role required');
  }

  return apiClient.put<VendorOrder>(
    `/vendor/orders/${orderId}/manufacturing-id`,
    { manufacturingId },
    async () => {
      // Mock fallback implementation
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay

      // Find order in mock database
      const orderIndex = VENDOR_ORDERS_DB.findIndex(o => o.id === orderId && o.vendorId === currentUser.id);

      if (orderIndex === -1) {
        throw new Error(`Order with ID ${orderId} not found or not assigned to this vendor`);
      }

      // Update manufacturing ID
      VENDOR_ORDERS_DB[orderIndex].manufacturingId = manufacturingId;

      return VENDOR_ORDERS_DB[orderIndex];
    }
  );
};

/**
 * Update the estimated delivery date for an order
 */
export const updateDeliveryDate = async (
  orderId: string,
  estimatedDeliveryDate: Date
): Promise<VendorOrder> => {
  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  // Verify user is a vendor
  if (!currentUser.roles?.includes('vendor')) {
    throw new Error('Access denied: Vendor role required');
  }

  return apiClient.put<VendorOrder>(
    `/vendor/orders/${orderId}/delivery-date`,
    { estimatedDeliveryDate },
    async () => {
      // Mock fallback implementation
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay

      // Find order in mock database
      const orderIndex = VENDOR_ORDERS_DB.findIndex(o => o.id === orderId && o.vendorId === currentUser.id);

      if (orderIndex === -1) {
        throw new Error(`Order with ID ${orderId} not found or not assigned to this vendor`);
      }

      // Update estimated delivery date
      VENDOR_ORDERS_DB[orderIndex].estimatedDeliveryDate = estimatedDeliveryDate;

      return VENDOR_ORDERS_DB[orderIndex];
    }
  );
};

/**
 * Add a production file to an order
 */
export const addProductionFile = async (
  orderId: string,
  file: Omit<ProductionFile, 'id' | 'uploadDate'>
): Promise<VendorOrder> => {
  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  // Verify user is a vendor
  if (!currentUser.roles?.includes('vendor')) {
    throw new Error('Access denied: Vendor role required');
  }

  return apiClient.post<VendorOrder>(
    `/vendor/orders/${orderId}/production-files`,
    file,
    async () => {
      // Mock fallback implementation
      await new Promise(resolve => setTimeout(resolve, 600)); // Simulate API delay

      // Find order in mock database
      const orderIndex = VENDOR_ORDERS_DB.findIndex(o => o.id === orderId && o.vendorId === currentUser.id);

      if (orderIndex === -1) {
        throw new Error(`Order with ID ${orderId} not found or not assigned to this vendor`);
      }

      // Add production file
      const newFile: ProductionFile = {
        id: `file${Date.now()}`,
        uploadDate: new Date(),
        ...file
      };

      if (!VENDOR_ORDERS_DB[orderIndex].productionFiles) {
        VENDOR_ORDERS_DB[orderIndex].productionFiles = [];
      }

      VENDOR_ORDERS_DB[orderIndex].productionFiles?.push(newFile);

      return VENDOR_ORDERS_DB[orderIndex];
    }
  );
};

/**
 * Split an order into separate orders
 */
export const splitOrder = async (
  orderId: string,
  itemSplits: {
    itemId: string,
    splitQuantity: number
  }[]
): Promise<VendorOrder[]> => {
  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  // Verify user is a vendor
  if (!currentUser.roles?.includes('vendor')) {
    throw new Error('Access denied: Vendor role required');
  }

  return apiClient.post<VendorOrder[]>(
    `/vendor/orders/${orderId}/split`,
    { itemSplits },
    async () => {
      // Mock fallback implementation
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay

      // Find order in mock database
      const orderIndex = VENDOR_ORDERS_DB.findIndex(o => o.id === orderId && o.vendorId === currentUser.id);

      if (orderIndex === -1) {
        throw new Error(`Order with ID ${orderId} not found or not assigned to this vendor`);
      }

      const originalOrder = VENDOR_ORDERS_DB[orderIndex];
      const newOrders: VendorOrder[] = [];

      // For each split item
      for (const split of itemSplits) {
        const itemIndex = originalOrder.items.findIndex(item => item.id === split.itemId);

        if (itemIndex === -1 || originalOrder.items[itemIndex].quantity <= split.splitQuantity) {
          throw new Error(`Cannot split item with ID ${split.itemId}: Invalid quantity`);
        }

        // Create a new order with the split item
        const newOrder: VendorOrder = {
          ...JSON.parse(JSON.stringify(originalOrder)), // Deep copy
          id: `order${Date.now()}-${newOrders.length + 1}`,
          orderNumber: `${originalOrder.orderNumber}-S${newOrders.length + 1}`,
          parentOrderId: originalOrder.id,
          items: [
            {
              ...originalOrder.items[itemIndex],
              quantity: split.splitQuantity
            }
          ],
          subtotal: originalOrder.items[itemIndex].price * split.splitQuantity,
          total: (originalOrder.items[itemIndex].price * split.splitQuantity) +
                (originalOrder.tax * (split.splitQuantity / originalOrder.items[itemIndex].quantity)) +
                (originalOrder.shippingCost / originalOrder.items.length)
        };

        newOrders.push(newOrder);

        // Update original item quantity
        originalOrder.items[itemIndex].quantity -= split.splitQuantity;
      }

      // Update original order subtotal and total
      originalOrder.subtotal = originalOrder.items.reduce(
        (sum, item) => sum + (item.price * item.quantity),
        0
      );

      // Approximate tax recalculation
      const taxRate = originalOrder.tax / (originalOrder.subtotal + originalOrder.tax - originalOrder.shippingCost);
      originalOrder.tax = originalOrder.subtotal * taxRate;
      originalOrder.total = originalOrder.subtotal + originalOrder.tax + originalOrder.shippingCost;

      // Set splitOrders reference
      originalOrder.splitOrders = newOrders.map(order => order.id);

      // Add new orders to mock database
      VENDOR_ORDERS_DB.push(...newOrders);

      // Return all orders involved
      return [originalOrder, ...newOrders];
    }
  );
};

/**
 * Add tracking information to an order
 */
export const addTrackingInfo = async (
  orderId: string,
  trackingNumber: string,
  trackingUrl?: string,
  carrier?: string
): Promise<VendorOrder> => {
  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  // Verify user is a vendor
  if (!currentUser.roles?.includes('vendor')) {
    throw new Error('Access denied: Vendor role required');
  }

  return apiClient.put<VendorOrder>(
    `/vendor/orders/${orderId}/tracking`,
    { trackingNumber, trackingUrl, carrier },
    async () => {
      // Mock fallback implementation
      await new Promise(resolve => setTimeout(resolve, 400)); // Simulate API delay

      // Find order in mock database
      const orderIndex = VENDOR_ORDERS_DB.findIndex(o => o.id === orderId && o.vendorId === currentUser.id);

      if (orderIndex === -1) {
        throw new Error(`Order with ID ${orderId} not found or not assigned to this vendor`);
      }

      // Update tracking info
      VENDOR_ORDERS_DB[orderIndex].trackingNumber = trackingNumber;
      if (trackingUrl) {
        VENDOR_ORDERS_DB[orderIndex].trackingUrl = trackingUrl;
      }

      // If shipping update, change status
      if (VENDOR_ORDERS_DB[orderIndex].status !== VendorOrderStatus.SHIPPED &&
          VENDOR_ORDERS_DB[orderIndex].status !== VendorOrderStatus.DELIVERED) {
        VENDOR_ORDERS_DB[orderIndex].status = VendorOrderStatus.SHIPPED;
      }

      return VENDOR_ORDERS_DB[orderIndex];
    }
  );
};
