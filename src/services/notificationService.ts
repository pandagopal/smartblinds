/**
 * Notification Service
 *
 * Provides functions for retrieving and managing user notifications
 */
import apiClient from './apiClient';
import { authService } from './authService';

export interface NotificationPreference {
  id: string;
  name: string;
  description: string;
  inAppEnabled: boolean;
  emailEnabled: boolean;
}

export interface Notification {
  id: string;
  title: string;
  content: string;
  type: string;
  sourceType: 'order' | 'inventory' | 'question' | 'system' | 'other';
  sourceId?: string;
  createdAt: Date;
  isRead: boolean;
  readAt?: Date;
}

/**
 * Get user's notifications with pagination
 *
 * @param page Page number
 * @param limit Items per page
 * @param readFilter Optional filter for read status
 */
export const getNotifications = async (
  page: number = 1,
  limit: number = 10,
  readFilter?: 'read' | 'unread'
): Promise<{ notifications: Notification[], pagination: any }> => {
  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  // Build query parameters
  const params: any = { page, limit };
  if (readFilter === 'read') {
    params.read = 'true';
  } else if (readFilter === 'unread') {
    params.read = 'false';
  }

  const response = await apiClient.get<any>(
    '/notifications',
    params,
    async () => {
      // Mock data for fallback
      await new Promise(resolve => setTimeout(resolve, 500));

      // Return mock notifications
      return {
        success: true,
        count: 3,
        pagination: {
          page,
          limit,
          total: 3,
          pages: 1
        },
        data: getMockNotifications(readFilter)
      };
    }
  );

  // Process dates for notification objects
  const notifications = response.data.map((notification: any) => ({
    ...notification,
    createdAt: new Date(notification.createdAt),
    readAt: notification.readAt ? new Date(notification.readAt) : undefined
  }));

  return {
    notifications,
    pagination: response.pagination
  };
};

/**
 * Get unread notification count
 */
export const getUnreadCount = async (): Promise<number> => {
  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    return 0;
  }

  const response = await apiClient.get<any>(
    '/notifications/unread-count',
    {},
    async () => {
      // Mock data for fallback
      await new Promise(resolve => setTimeout(resolve, 300));
      return {
        success: true,
        data: { count: 2 }
      };
    }
  );

  return response.data.count;
};

/**
 * Get a specific notification
 */
export const getNotification = async (id: string): Promise<Notification> => {
  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  const response = await apiClient.get<any>(
    `/notifications/${id}`,
    {},
    async () => {
      // Mock data for fallback
      await new Promise(resolve => setTimeout(resolve, 400));

      // Find the notification in mock data
      const allMockNotifications = getMockNotifications();
      const mockNotification = allMockNotifications.find(n => n.id === id);

      if (!mockNotification) {
        throw new Error(`Notification with ID ${id} not found`);
      }

      return {
        success: true,
        data: {
          ...mockNotification,
          isRead: true, // Mark as read when viewed
          readAt: new Date()
        }
      };
    }
  );

  // Process dates
  return {
    ...response.data,
    createdAt: new Date(response.data.createdAt),
    readAt: response.data.readAt ? new Date(response.data.readAt) : undefined
  };
};

/**
 * Mark a notification as read
 */
export const markAsRead = async (id: string): Promise<boolean> => {
  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  const response = await apiClient.put<any>(
    `/notifications/${id}/read`,
    {},
    async () => {
      // Mock data for fallback
      await new Promise(resolve => setTimeout(resolve, 300));
      return {
        success: true,
        data: { message: 'Notification marked as read' }
      };
    }
  );

  return response.success;
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (): Promise<number> => {
  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  const response = await apiClient.put<any>(
    '/notifications/read-all',
    {},
    async () => {
      // Mock data for fallback
      await new Promise(resolve => setTimeout(resolve, 400));
      return {
        success: true,
        data: { message: '2 notifications marked as read' }
      };
    }
  );

  // Extract the count from the message
  const countMatch = response.data.message.match(/^(\d+)/);
  return countMatch ? parseInt(countMatch[1], 10) : 0;
};

/**
 * Get user notification preferences
 */
export const getNotificationPreferences = async (): Promise<NotificationPreference[]> => {
  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  const response = await apiClient.get<any>(
    '/notifications/preferences',
    {},
    async () => {
      // Mock data for fallback
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        success: true,
        data: [
          {
            id: 'pref1',
            name: 'new_order',
            description: 'Notification when a new order is placed',
            inAppEnabled: true,
            emailEnabled: true
          },
          {
            id: 'pref2',
            name: 'order_status_update',
            description: 'Notification when order status changes',
            inAppEnabled: true,
            emailEnabled: true
          },
          {
            id: 'pref3',
            name: 'low_inventory',
            description: 'Alert when inventory levels are low',
            inAppEnabled: true,
            emailEnabled: false
          }
        ]
      };
    }
  );

  return response.data;
};

/**
 * Update user notification preferences
 */
export const updateNotificationPreferences = async (
  preferences: Array<{id: string, inAppEnabled?: boolean, emailEnabled?: boolean}>
): Promise<boolean> => {
  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  const response = await apiClient.put<any>(
    '/notifications/preferences',
    { preferences },
    async () => {
      // Mock data for fallback
      await new Promise(resolve => setTimeout(resolve, 600));
      return {
        success: true,
        data: preferences.map(pref => ({
          id: pref.id,
          success: true,
          data: {
            inAppEnabled: pref.inAppEnabled !== undefined ? pref.inAppEnabled : true,
            emailEnabled: pref.emailEnabled !== undefined ? pref.emailEnabled : true
          }
        }))
      };
    }
  );

  return response.success;
};

/**
 * Generate mock notifications for development/testing
 */
const getMockNotifications = (readFilter?: 'read' | 'unread'): Notification[] => {
  const mockNotifications: Notification[] = [
    {
      id: 'notif1',
      title: 'New Order #SB-1001',
      content: 'A new order #SB-1001 has been placed and requires processing.',
      type: 'new_order',
      sourceType: 'order',
      sourceId: 'order1',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      isRead: false
    },
    {
      id: 'notif2',
      title: 'Order Status Update: #SB-1002',
      content: 'Your order #SB-1002 status has been updated to: Shipped',
      type: 'order_status_update',
      sourceType: 'order',
      sourceId: 'order2',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      isRead: true,
      readAt: new Date(Date.now() - 23 * 60 * 60 * 1000)
    },
    {
      id: 'notif3',
      title: 'Low Inventory Alert: Premium Hardwood Blinds',
      content: 'Low inventory alert for Premium Hardwood Blinds - Basswood - White. Current level: 5',
      type: 'low_inventory',
      sourceType: 'inventory',
      sourceId: 'inv1',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      isRead: false
    }
  ];

  // Filter by read status if requested
  if (readFilter === 'read') {
    return mockNotifications.filter(n => n.isRead);
  } else if (readFilter === 'unread') {
    return mockNotifications.filter(n => !n.isRead);
  }

  return mockNotifications;
};
