import apiClient from './apiClient';
import { authService } from './authService';

export enum ActivityType {
  ORDER_STATUS_CHANGE = 'ORDER_STATUS_CHANGE',
  PRODUCT_PRICE_UPDATE = 'PRODUCT_PRICE_UPDATE',
  PRODUCT_CREATED = 'PRODUCT_CREATED',
  PRODUCT_UPDATED = 'PRODUCT_UPDATED',
  PRODUCT_DELETED = 'PRODUCT_DELETED',
  INVENTORY_UPDATED = 'INVENTORY_UPDATED',
  USER_ADDED = 'USER_ADDED',
  USER_REMOVED = 'USER_REMOVED',
  PERMISSION_CHANGED = 'PERMISSION_CHANGED',
  BULK_UPLOAD = 'BULK_UPLOAD',
  SETTINGS_CHANGED = 'SETTINGS_CHANGED',
  CHAT_MESSAGE_SENT = 'CHAT_MESSAGE_SENT'
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userEmail: string;
  activityType: ActivityType;
  description: string;
  details: Record<string, any>;
  ipAddress?: string;
  entityId?: string; // ID of affected entity (product, order, etc.)
  entityType?: string; // Type of entity (product, order, etc.)
}

export interface LogSearchParams {
  startDate?: Date;
  endDate?: Date;
  activityTypes?: ActivityType[];
  userId?: string;
  entityId?: string;
  entityType?: string;
  limit?: number;
  offset?: number;
}

/**
 * Create a new activity log entry
 */
export const createActivityLog = async (
  activityType: ActivityType,
  description: string,
  details: Record<string, any> = {},
  entityId?: string,
  entityType?: string
): Promise<ActivityLog> => {
  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  return apiClient.post<ActivityLog>(
    '/vendor/activity-logs',
    {
      activityType,
      description,
      details,
      entityId,
      entityType
    },
    async () => {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 300));

      return {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        userId: currentUser.id,
        userName: currentUser.name,
        userEmail: currentUser.email,
        activityType,
        description,
        details,
        entityId,
        entityType,
        ipAddress: '192.168.1.1' // Mock IP address
      };
    }
  );
};

/**
 * Get activity logs with optional filtering
 */
export const getActivityLogs = async (params: LogSearchParams = {}): Promise<ActivityLog[]> => {
  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  // Verify vendor status
  if (currentUser.role !== 'vendor' && currentUser.role !== 'admin') {
    throw new Error('Access denied: Vendor or Admin role required');
  }

  return apiClient.get<ActivityLog[]>(
    '/vendor/activity-logs',
    params,
    async () => {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 500));

      // Generate random logs
      const logs: ActivityLog[] = [];
      const now = new Date();
      const activityTypes = Object.values(ActivityType);

      // Generate 50 random logs
      for (let i = 0; i < 50; i++) {
        const randomDate = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);
        const randomActivityType = activityTypes[Math.floor(Math.random() * activityTypes.length)];

        let description = '';
        let details = {};
        let entityId = '';
        let entityType = '';

        switch (randomActivityType) {
          case ActivityType.ORDER_STATUS_CHANGE:
            entityId = `order-${1000 + Math.floor(Math.random() * 1000)}`;
            entityType = 'order';
            const oldStatus = ['pending', 'processing', 'shipped'][Math.floor(Math.random() * 3)];
            const newStatus = ['processing', 'shipped', 'delivered'][Math.floor(Math.random() * 3)];
            description = `Changed order status from ${oldStatus} to ${newStatus}`;
            details = { oldStatus, newStatus, orderId: entityId };
            break;

          case ActivityType.PRODUCT_PRICE_UPDATE:
            entityId = `product-${1000 + Math.floor(Math.random() * 1000)}`;
            entityType = 'product';
            const oldPrice = Math.floor(Math.random() * 100) + 50;
            const newPrice = Math.floor(Math.random() * 100) + 50;
            description = `Updated product price from $${oldPrice} to $${newPrice}`;
            details = { oldPrice, newPrice, productId: entityId };
            break;

          case ActivityType.USER_ADDED:
            entityId = `user-${1000 + Math.floor(Math.random() * 1000)}`;
            entityType = 'user';
            const role = ['factory-manager', 'customer-support', 'admin'][Math.floor(Math.random() * 3)];
            description = `Added new team member with ${role} role`;
            details = { role, email: `user${Math.floor(Math.random() * 1000)}@example.com` };
            break;

          default:
            description = `Performed ${randomActivityType.toLowerCase().replace('_', ' ')}`;
            details = { actionType: randomActivityType };
        }

        logs.push({
          id: `log-${i}`,
          timestamp: randomDate.toISOString(),
          userId: currentUser.id,
          userName: currentUser.name,
          userEmail: currentUser.email,
          activityType: randomActivityType,
          description,
          details,
          entityId,
          entityType,
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`
        });
      }

      // Sort by timestamp (newest first)
      logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      // Apply filters
      let filteredLogs = logs;

      if (params.startDate) {
        filteredLogs = filteredLogs.filter(log =>
          new Date(log.timestamp) >= params.startDate!
        );
      }

      if (params.endDate) {
        filteredLogs = filteredLogs.filter(log =>
          new Date(log.timestamp) <= params.endDate!
        );
      }

      if (params.activityTypes && params.activityTypes.length > 0) {
        filteredLogs = filteredLogs.filter(log =>
          params.activityTypes!.includes(log.activityType)
        );
      }

      if (params.userId) {
        filteredLogs = filteredLogs.filter(log =>
          log.userId === params.userId
        );
      }

      if (params.entityId) {
        filteredLogs = filteredLogs.filter(log =>
          log.entityId === params.entityId
        );
      }

      if (params.entityType) {
        filteredLogs = filteredLogs.filter(log =>
          log.entityType === params.entityType
        );
      }

      // Apply pagination
      const offset = params.offset || 0;
      const limit = params.limit || 20;

      return filteredLogs.slice(offset, offset + limit);
    }
  );
};

/**
 * Delete activity logs. Only admin can delete logs.
 */
export const deleteActivityLogs = async (logIds: string[]): Promise<{ success: boolean }> => {
  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  // Verify admin status
  if (currentUser.role !== 'admin') {
    throw new Error('Access denied: Admin role required');
  }

  return apiClient.delete<{ success: boolean }>(
    '/vendor/activity-logs',
    { logIds },
    async () => {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 400));

      return { success: true };
    }
  );
};

// Helper function to log activity - use this throughout the app to record activities
export const logActivity = async (
  activityType: ActivityType,
  description: string,
  details: Record<string, any> = {},
  entityId?: string,
  entityType?: string
): Promise<void> => {
  try {
    await createActivityLog(activityType, description, details, entityId, entityType);
  } catch (error) {
    console.error('Failed to log activity:', error);
    // Continue execution even if logging fails
  }
};
