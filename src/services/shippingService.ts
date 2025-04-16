/**
 * Shipping Service
 *
 * Manages shipment operations, carrier integrations,
 * tracking information, and shipping operations
 */
import apiClient from './apiClient';
import { authService } from './authService';

// Shipping status constants
export enum ShippingStatus {
  PENDING = 'pending',
  CREATED = 'created',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  EXCEPTION = 'exception',
  RETURNED = 'returned'
}

// Carrier service types
export enum CarrierService {
  UPS_GROUND = 'UPS Ground',
  UPS_2DAY = 'UPS 2-Day Air',
  UPS_NEXT_DAY = 'UPS Next Day Air',
  FEDEX_GROUND = 'FedEx Ground',
  FEDEX_EXPRESS = 'FedEx Express',
  FEDEX_2DAY = 'FedEx 2Day',
  USPS_PRIORITY = 'USPS Priority Mail',
  USPS_FIRST_CLASS = 'USPS First Class',
  USPS_EXPRESS = 'USPS Priority Mail Express',
  DHL_EXPRESS = 'DHL Express',
  LTL_FREIGHT_STANDARD = 'LTL Freight Standard',
  LTL_FREIGHT_EXPEDITED = 'LTL Freight Expedited'
}

// Shipping dimensions interface
export interface ShippingDimensions {
  length: number;
  width: number;
  height: number;
  weight: number;
  unit: 'imperial' | 'metric';
}

// Tracking event interface
export interface TrackingEvent {
  id?: string;
  eventDate: Date;
  location?: string;
  description: string;
  status: string;
  createdAt?: Date;
}

// Shipping note interface
export interface ShippingNote {
  id?: string;
  noteType: 'customer' | 'vendor' | 'system';
  text: string;
  createdBy?: string;
  createdAt?: Date;
}

// Shipment interface
export interface Shipment {
  id?: string;
  orderId: string;
  carrier: string;
  serviceLevel: string;
  trackingNumber?: string;
  trackingUrl?: string;
  shippingLabelUrl?: string;
  shippingDate?: Date;
  estimatedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  status: ShippingStatus;
  cost?: number;
  dimensions?: ShippingDimensions;
  handlingTimeDays?: number;
  packagingInstructions?: string;
  packagingPhotos?: string[];
  events: TrackingEvent[];
  notes: ShippingNote[];
  isReturn: boolean;
  returnReason?: string;
  returnAuthorizedBy?: string;
  returnAuthorizedAt?: Date;
  damagedReported: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Create shipment request interface
export interface CreateShipmentRequest {
  carrier: string;
  serviceLevel: string;
  trackingNumber?: string;
  trackingUrl?: string;
  shippingLabelUrl?: string;
  estimatedDeliveryDate?: Date;
  dimensions?: ShippingDimensions;
  handlingTimeDays?: number;
  packagingInstructions?: string;
  packagingPhotos?: string[];
  isReturn?: boolean;
  returnReason?: string;
}

/**
 * Creates a new shipment for an order
 * @param orderId The order ID to create a shipment for
 * @param shipmentData The shipment data
 * @returns The created shipment
 */
export const createShipment = async (orderId: string, shipmentData: CreateShipmentRequest): Promise<Shipment> => {
  try {
    const response = await apiClient.post(`/orders/${orderId}/shipments`, shipmentData, {
      headers: { Authorization: `Bearer ${authService.getToken()}` }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error creating shipment:', error);
    throw error;
  }
};

/**
 * Get all shipments with optional filters
 * @param filters Optional filters
 * @returns Array of shipments
 */
export const getShipments = async (filters: Record<string, any> = {}): Promise<Shipment[]> => {
  try {
    // Build query string from filters
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const response = await apiClient.get(`/shipments${queryString}`, {
      headers: { Authorization: `Bearer ${authService.getToken()}` }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching shipments:', error);
    throw error;
  }
};

/**
 * Get shipment details by ID
 * @param shipmentId The shipment ID
 * @returns The shipment details
 */
export const getShipmentById = async (shipmentId: string): Promise<Shipment> => {
  try {
    const response = await apiClient.get(`/shipments/${shipmentId}`, {
      headers: { Authorization: `Bearer ${authService.getToken()}` }
    });
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching shipment ${shipmentId}:`, error);
    throw error;
  }
};

/**
 * Update a shipment's information
 * @param shipmentId The shipment ID
 * @param updateData The data to update
 * @returns The updated shipment
 */
export const updateShipment = async (shipmentId: string, updateData: Partial<Shipment>): Promise<Shipment> => {
  try {
    const response = await apiClient.put(`/shipments/${shipmentId}`, updateData, {
      headers: { Authorization: `Bearer ${authService.getToken()}` }
    });
    return response.data.data;
  } catch (error) {
    console.error(`Error updating shipment ${shipmentId}:`, error);
    throw error;
  }
};

/**
 * Add a tracking event to a shipment
 * @param shipmentId The shipment ID
 * @param event The tracking event to add
 * @returns The updated shipment
 */
export const addTrackingEvent = async (shipmentId: string, event: Omit<TrackingEvent, 'id' | 'createdAt'>): Promise<Shipment> => {
  try {
    const response = await apiClient.post(`/shipments/${shipmentId}/events`, event, {
      headers: { Authorization: `Bearer ${authService.getToken()}` }
    });
    return response.data.data;
  } catch (error) {
    console.error(`Error adding tracking event to shipment ${shipmentId}:`, error);
    throw error;
  }
};

/**
 * Add a note to a shipment
 * @param shipmentId The shipment ID
 * @param note The note to add
 * @returns The updated shipment
 */
export const addShipmentNote = async (shipmentId: string, note: Omit<ShippingNote, 'id' | 'createdBy' | 'createdAt'>): Promise<Shipment> => {
  try {
    const response = await apiClient.post(`/shipments/${shipmentId}/notes`, note, {
      headers: { Authorization: `Bearer ${authService.getToken()}` }
    });
    return response.data.data;
  } catch (error) {
    console.error(`Error adding note to shipment ${shipmentId}:`, error);
    throw error;
  }
};

/**
 * Report damage for a shipment
 * @param shipmentId The shipment ID
 * @param description Description of the damage
 * @returns The updated shipment
 */
export const reportDamage = async (shipmentId: string, description: string): Promise<Shipment> => {
  try {
    const response = await apiClient.post(`/shipments/${shipmentId}/report-damage`, { description }, {
      headers: { Authorization: `Bearer ${authService.getToken()}` }
    });
    return response.data.data;
  } catch (error) {
    console.error(`Error reporting damage for shipment ${shipmentId}:`, error);
    throw error;
  }
};

/**
 * Create a return shipment for an existing shipment
 * @param shipmentId The original shipment ID
 * @param returnData Return shipment data
 * @returns The new return shipment
 */
export const createReturnShipment = async (
  shipmentId: string,
  returnData: {
    carrier?: string;
    serviceLevel?: string;
    trackingNumber?: string;
    trackingUrl?: string;
    shippingLabelUrl?: string;
    returnReason: string;
    packagingInstructions?: string;
  }
): Promise<Shipment> => {
  try {
    const response = await apiClient.post(`/shipments/${shipmentId}/return`, returnData, {
      headers: { Authorization: `Bearer ${authService.getToken()}` }
    });
    return response.data.data;
  } catch (error) {
    console.error(`Error creating return shipment for ${shipmentId}:`, error);
    throw error;
  }
};

// Helper function to generate a mock tracking URL
export const generateTrackingUrl = (carrier: string, trackingNumber: string): string => {
  switch (carrier) {
    case 'UPS':
      return `https://www.ups.com/track?tracknum=${trackingNumber}`;
    case 'FedEx':
      return `https://www.fedex.com/apps/fedextrack/?tracknumbers=${trackingNumber}`;
    case 'USPS':
      return `https://tools.usps.com/go/TrackConfirmAction?qtc_tLabels1=${trackingNumber}`;
    case 'DHL':
      return `https://www.dhl.com/us-en/home/tracking/tracking-express.html?submit=1&tracking-id=${trackingNumber}`;
    default:
      return '';
  }
};
