/**
 * Carrier API Service
 *
 * Handles integration with various shipping carrier APIs for:
 * - Rate calculations
 * - Label generation
 * - Tracking information
 * - Address validation
 */

import apiClient from './apiClient';
import { authService } from './authService';

// Carrier types
export enum CarrierType {
  UPS = 'UPS',
  FEDEX = 'FedEx',
  USPS = 'USPS',
  DHL = 'DHL',
  LTL_FREIGHT = 'LTL Freight'
}

// Package dimensions interface
export interface PackageDimensions {
  length: number;
  width: number;
  height: number;
  weight: number;
  unit: 'imperial' | 'metric';
}

// Shipping rate request interface
export interface ShippingRateRequest {
  carrier: CarrierType;
  shipFrom: {
    postalCode: string;
    countryCode: string;
    stateCode?: string;
    city?: string;
  };
  shipTo: {
    postalCode: string;
    countryCode: string;
    stateCode?: string;
    city?: string;
  };
  packages: PackageDimensions[];
  services?: string[]; // Specific services to get rates for (optional)
  residential?: boolean; // Is the destination a residential address?
  negotiatedRates?: boolean; // Use account-specific negotiated rates?
}

// Shipping rate response interface
export interface ShippingRate {
  serviceCode: string;
  serviceName: string;
  carrierCode: CarrierType;
  totalAmount: number;
  currency: string;
  transitDays: number;
  estimatedDeliveryDate?: Date;
}

// Label generation request interface
export interface LabelRequest {
  carrier: CarrierType;
  service: string;
  shipFrom: {
    name: string;
    company?: string;
    street1: string;
    street2?: string;
    city: string;
    stateCode: string;
    postalCode: string;
    countryCode: string;
    phone: string;
    email?: string;
  };
  shipTo: {
    name: string;
    company?: string;
    street1: string;
    street2?: string;
    city: string;
    stateCode: string;
    postalCode: string;
    countryCode: string;
    phone: string;
    email?: string;
    isResidential: boolean;
  };
  packages: {
    dimensions: PackageDimensions;
    description?: string;
    reference?: string;
  }[];
  packageType?: string; // Box, envelope, pallet, etc.
  signature?: 'required' | 'not_required' | 'adult';
  insurance?: {
    amount: number;
    currency: string;
  };
  returnLabel?: boolean;
  saturdayDelivery?: boolean;
  containsAlcohol?: boolean; // Requires age verification
  orderId?: string; // Reference to the order
}

// Label response interface
export interface LabelResponse {
  trackingNumber: string;
  labelUrl: string;
  trackingUrl: string;
  shipmentId: string;
  cost: number;
  currency: string;
  carrierCode: CarrierType;
  service: string;
  packageCount: number;
  estimatedDelivery?: Date;
}

// Address validation interface
export interface AddressValidationRequest {
  carrier: CarrierType;
  address: {
    street1: string;
    street2?: string;
    city: string;
    stateCode: string;
    postalCode: string;
    countryCode: string;
  };
}

// Address validation response
export interface AddressValidationResponse {
  valid: boolean;
  messages?: string[];
  suggestions?: {
    street1: string;
    street2?: string;
    city: string;
    stateCode: string;
    postalCode: string;
    countryCode: string;
  }[];
}

/**
 * Get shipping rates from multiple carriers
 * @param rateRequest The rate request parameters
 * @returns Array of available shipping rates
 */
export const getShippingRates = async (rateRequest: ShippingRateRequest): Promise<ShippingRate[]> => {
  try {
    const response = await apiClient.post('/carriers/rates', rateRequest, {
      headers: { Authorization: `Bearer ${authService.getToken()}` }
    });
    return response.data.rates;
  } catch (error) {
    console.error('Error getting shipping rates:', error);
    throw error;
  }
};

/**
 * Generate a shipping label
 * @param labelRequest The label generation request
 * @returns Label information including tracking number and label URL
 */
export const generateLabel = async (labelRequest: LabelRequest): Promise<LabelResponse> => {
  try {
    const response = await apiClient.post('/carriers/labels', labelRequest, {
      headers: { Authorization: `Bearer ${authService.getToken()}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error generating shipping label:', error);
    throw error;
  }
};

/**
 * Validate a shipping address with carrier
 * @param validationRequest The address to validate
 * @returns Validation result with suggestions if applicable
 */
export const validateAddress = async (validationRequest: AddressValidationRequest): Promise<AddressValidationResponse> => {
  try {
    const response = await apiClient.post('/carriers/validate-address', validationRequest, {
      headers: { Authorization: `Bearer ${authService.getToken()}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error validating address:', error);
    throw error;
  }
};

/**
 * Get real-time tracking information
 * @param carrier The carrier code
 * @param trackingNumber The tracking number
 * @returns Tracking information from the carrier API
 */
export const getTrackingInfo = async (carrier: CarrierType, trackingNumber: string): Promise<any> => {
  try {
    const response = await apiClient.get(`/api/carriers/tracking/${carrier}/${trackingNumber}`, {
      headers: { Authorization: `Bearer ${authService.getToken()}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error getting tracking information:', error);
    throw error;
  }
};

/**
 * Cancel a shipment with the carrier
 * @param carrier The carrier code
 * @param shipmentId The carrier shipment ID
 * @returns Cancellation result
 */
export const cancelShipment = async (carrier: CarrierType, shipmentId: string): Promise<{ success: boolean, message?: string }> => {
  try {
    const response = await apiClient.delete(`/api/carriers/shipments/${carrier}/${shipmentId}`, {
      headers: { Authorization: `Bearer ${authService.getToken()}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error canceling shipment:', error);
    throw error;
  }
};

/**
 * Get carrier service options
 * @param carrier The carrier to get services for
 * @returns List of available services
 */
export const getCarrierServices = async (carrier: CarrierType): Promise<{ code: string, name: string, description: string }[]> => {
  try {
    const response = await apiClient.get(`/api/carriers/services/${carrier}`, {
      headers: { Authorization: `Bearer ${authService.getToken()}` }
    });
    return response.data.services;
  } catch (error) {
    console.error('Error getting carrier services:', error);
    throw error;
  }
};

/**
 * Get package types for a carrier
 * @param carrier The carrier to get package types for
 * @returns List of available package types
 */
export const getPackageTypes = async (carrier: CarrierType): Promise<{ code: string, name: string, maxWeight?: number }[]> => {
  try {
    const response = await apiClient.get(`/api/carriers/package-types/${carrier}`, {
      headers: { Authorization: `Bearer ${authService.getToken()}` }
    });
    return response.data.packageTypes;
  } catch (error) {
    console.error('Error getting package types:', error);
    throw error;
  }
};
