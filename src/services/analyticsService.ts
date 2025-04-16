/**
 * Analytics Service
 *
 * This service provides functions for tracking various analytics events,
 * including database errors, user interactions, and performance metrics.
 */

// Define event types for consistency
export enum AnalyticsEventType {
  // Database related events
  DB_CONNECTION_ERROR = 'db_connection_error',
  DB_QUERY_ERROR = 'db_query_error',
  DB_PERFORMANCE = 'db_performance',

  // User interaction events
  USER_INTERACTION = 'user_interaction',
  SEARCH = 'search',
  PRODUCT_VIEW = 'product_view',
  ADD_TO_CART = 'add_to_cart',
  CHECKOUT = 'checkout',

  // Performance events
  PAGE_LOAD = 'page_load',
  API_REQUEST = 'api_request',
  COMPONENT_RENDER = 'component_render',

  // Error events
  JS_ERROR = 'js_error',
  API_ERROR = 'api_error',
}

// Interface for database error event
export interface DatabaseErrorEvent {
  operation: string;
  endpoint?: string;
  errorMessage: string;
  errorCode?: string;
  timestamp: number;
  queryParams?: Record<string, any>;
  retryCount?: number;
}

// Interface for performance event
export interface PerformanceEvent {
  operation: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

// Queue to batch analytics events
const eventQueue: Array<{
  type: AnalyticsEventType;
  data: any;
}> = [];

// Flag to track if we're currently processing the queue
let isProcessingQueue = false;

/**
 * Send the queued events to the analytics endpoint
 */
const processEventQueue = async () => {
  if (isProcessingQueue || eventQueue.length === 0) {
    return;
  }

  isProcessingQueue = true;

  try {
    // Create a copy of the current queue
    const eventsToSend = [...eventQueue];

    // Clear the queue before sending to prevent duplicate sends on errors
    eventQueue.length = 0;

    // In production, we'd send to a real analytics endpoint
    if (process.env.NODE_ENV === 'production') {
      await fetch('/analytics/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          events: eventsToSend,
          clientInfo: {
            userAgent: navigator.userAgent,
            timestamp: Date.now(),
            // Add any other client info you want to track
          },
        }),
      });
    } else {
      // For development, just log to console
      console.group('Analytics Events');
      eventsToSend.forEach(event => {
        console.log(`[${event.type}]`, event.data);
      });
      console.groupEnd();
    }
  } catch (error) {
    console.error('Failed to send analytics events:', error);
    // If sending fails, put the events back in the queue for retry
    eventQueue.push(...eventQueue);
  } finally {
    isProcessingQueue = false;
  }
};

/**
 * Track a database error event
 */
export const trackDatabaseError = (error: DatabaseErrorEvent) => {
  eventQueue.push({
    type: AnalyticsEventType.DB_QUERY_ERROR,
    data: {
      ...error,
      timestamp: error.timestamp || Date.now(),
    },
  });

  // Process the queue after a short delay to batch events
  setTimeout(processEventQueue, 1000);
};

/**
 * Track database performance
 */
export const trackDatabasePerformance = (performance: PerformanceEvent) => {
  eventQueue.push({
    type: AnalyticsEventType.DB_PERFORMANCE,
    data: {
      ...performance,
      timestamp: performance.timestamp || Date.now(),
    },
  });

  // Process the queue after a short delay to batch events
  setTimeout(processEventQueue, 1000);
};

/**
 * Track a user interaction event
 */
export const trackUserInteraction = (
  action: string,
  element: string,
  metadata?: Record<string, any>
) => {
  eventQueue.push({
    type: AnalyticsEventType.USER_INTERACTION,
    data: {
      action,
      element,
      metadata,
      timestamp: Date.now(),
    },
  });

  // Process the queue after a short delay to batch events
  setTimeout(processEventQueue, 1000);
};

/**
 * Track page view
 */
export const trackPageView = (
  page: string,
  loadTime?: number,
  metadata?: Record<string, any>
) => {
  eventQueue.push({
    type: AnalyticsEventType.PAGE_LOAD,
    data: {
      page,
      loadTime,
      metadata,
      timestamp: Date.now(),
    },
  });

  // Process page views immediately
  processEventQueue();
};

/**
 * Track API request performance and errors
 */
export const trackApiRequest = (
  endpoint: string,
  method: string,
  duration: number,
  status?: number,
  error?: string
) => {
  eventQueue.push({
    type: error ? AnalyticsEventType.API_ERROR : AnalyticsEventType.API_REQUEST,
    data: {
      endpoint,
      method,
      duration,
      status,
      error,
      timestamp: Date.now(),
    },
  });

  // Process the queue after a short delay to batch events
  setTimeout(processEventQueue, 1000);
};

/**
 * Initialize error tracking for unhandled exceptions
 */
export const initErrorTracking = () => {
  window.addEventListener('error', (event) => {
    eventQueue.push({
      type: AnalyticsEventType.JS_ERROR,
      data: {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        timestamp: Date.now(),
      },
    });

    // Process errors immediately
    processEventQueue();
  });

  // Track unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    eventQueue.push({
      type: AnalyticsEventType.JS_ERROR,
      data: {
        message: 'Unhandled Promise Rejection',
        reason: event.reason?.toString() || 'Unknown reason',
        stack: event.reason?.stack,
        timestamp: Date.now(),
      },
    });

    // Process errors immediately
    processEventQueue();
  });
};

// Export an object with all the functions
const analyticsService = {
  trackDatabaseError,
  trackDatabasePerformance,
  trackUserInteraction,
  trackPageView,
  trackApiRequest,
  initErrorTracking,
};

export default analyticsService;
