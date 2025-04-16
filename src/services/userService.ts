/**
 * User Service
 *
 * This service manages user profiles, settings, and preferences
 */
import { authService } from './authService';
import apiClient from './apiClient';

export interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
  phone?: string;
  notes?: string;
}

export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'paypal' | 'apple_pay' | 'google_pay';
  nickname: string;
  last4?: string;
  expirationMonth?: string;
  expirationYear?: string;
  isDefault: boolean;
}

export interface UserPreferences {
  emailNotifications: {
    orderStatus: boolean;
    promotions: boolean;
    productUpdates: boolean;
    reminders: boolean;
  };
  smsNotifications: boolean;
  defaultMeasurementUnit: 'inches' | 'centimeters';
  savedFilters?: Record<string, any>;
  colorPreferences?: string[];
}

export interface UserProfile {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  profileImage?: string;
  addresses: Address[];
  paymentMethods: PaymentMethod[];
  preferences: UserPreferences;
  createdAt: Date;
  lastLogin?: Date;
}

// Mock database for user profiles
const USERS_DB: Record<string, UserProfile> = {
  'user1': {
    id: 'user1',
    name: 'John Doe',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phoneNumber: '555-123-4567',
    profileImage: 'https://randomuser.me/api/portraits/men/43.jpg',
    addresses: [
      {
        id: 'address1',
        name: 'Home',
        street: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zipCode: '90210',
        country: 'USA',
        isDefault: true,
        phone: '555-123-4567'
      },
      {
        id: 'address2',
        name: 'Work',
        street: '456 Market Ave',
        city: 'Bigcity',
        state: 'NY',
        zipCode: '10001',
        country: 'USA',
        isDefault: false,
        phone: '555-987-6543',
        notes: 'Ask for John at the front desk'
      }
    ],
    paymentMethods: [
      {
        id: 'payment1',
        type: 'credit_card',
        nickname: 'Personal Card',
        last4: '4242',
        expirationMonth: '12',
        expirationYear: '2025',
        isDefault: true
      },
      {
        id: 'payment2',
        type: 'paypal',
        nickname: 'PayPal Account',
        isDefault: false
      }
    ],
    preferences: {
      emailNotifications: {
        orderStatus: true,
        promotions: false,
        productUpdates: true,
        reminders: true
      },
      smsNotifications: true,
      defaultMeasurementUnit: 'inches',
      colorPreferences: ['White', 'Beige', 'Gray']
    },
    createdAt: new Date('2023-10-15'),
    lastLogin: new Date('2024-04-01')
  }
};

/**
 * Get the current user's profile from the API
 */
export const getUserProfile = async (): Promise<UserProfile> => {
  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  return apiClient.get<UserProfile>(
    `/users/${currentUser.id}/profile`,
    {},
    async () => {
      // Mock fallback implementation
      await new Promise(resolve => setTimeout(resolve, 400)); // Simulate API delay

      // Find user in mock data
      const userProfile = USERS_DB[currentUser.id];

      if (!userProfile) {
        throw new Error(`User profile not found for ID ${currentUser.id}`);
      }

      return userProfile;
    }
  );
};

/**
 * Update user profile via API
 */
export const updateUserProfile = async (updates: Partial<{
  firstName: string;
  lastName: string;
  phoneNumber: string;
  profileImage: string;
}>): Promise<UserProfile> => {
  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  return apiClient.put<UserProfile>(
    `/users/${currentUser.id}/profile`,
    updates,
    async () => {
      // Mock fallback implementation
      await new Promise(resolve => setTimeout(resolve, 600)); // Simulate API delay

      // Update user in mock data
      const userProfile = USERS_DB[currentUser.id];

      if (!userProfile) {
        throw new Error(`User profile not found for ID ${currentUser.id}`);
      }

      // Update fields
      const updatedProfile = {
        ...userProfile,
        ...updates
      };

      // Update name if first name or last name changed
      if (updates.firstName || updates.lastName) {
        updatedProfile.name = `${updates.firstName || userProfile.firstName} ${updates.lastName || userProfile.lastName}`;
      }

      // Save back to mock DB
      USERS_DB[currentUser.id] = updatedProfile;

      return updatedProfile;
    }
  );
};

/**
 * Get user addresses from the API
 */
export const getUserAddresses = async (): Promise<Address[]> => {
  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  return apiClient.get<Address[]>(
    `/users/${currentUser.id}/addresses`,
    {},
    async () => {
      // Mock fallback implementation
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay

      // Return addresses from user profile
      const userProfile = USERS_DB[currentUser.id];

      if (!userProfile) {
        throw new Error(`User profile not found for ID ${currentUser.id}`);
      }

      return userProfile.addresses;
    }
  );
};

/**
 * Add a new address via API
 */
export const addAddress = async (address: Omit<Address, 'id'>): Promise<Address> => {
  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  return apiClient.post<Address>(
    `/users/${currentUser.id}/addresses`,
    address,
    async () => {
      // Mock fallback implementation
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay

      // Add address to user profile
      const userProfile = USERS_DB[currentUser.id];

      if (!userProfile) {
        throw new Error(`User profile not found for ID ${currentUser.id}`);
      }

      // Create new address with ID
      const newAddress: Address = {
        ...address,
        id: `address${Date.now()}`
      };

      // If this address is default, update other addresses
      if (newAddress.isDefault) {
        userProfile.addresses.forEach(addr => {
          addr.isDefault = false;
        });
      }

      // Add to addresses array
      userProfile.addresses.push(newAddress);

      return newAddress;
    }
  );
};

/**
 * Update an existing address via API
 */
export const updateAddress = async (id: string, updates: Partial<Omit<Address, 'id'>>): Promise<Address> => {
  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  return apiClient.put<Address>(
    `/users/${currentUser.id}/addresses/${id}`,
    updates,
    async () => {
      // Mock fallback implementation
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay

      // Update address in user profile
      const userProfile = USERS_DB[currentUser.id];

      if (!userProfile) {
        throw new Error(`User profile not found for ID ${currentUser.id}`);
      }

      // Find address index
      const addrIndex = userProfile.addresses.findIndex(a => a.id === id);

      if (addrIndex === -1) {
        throw new Error(`Address with ID ${id} not found`);
      }

      // If setting as default, update other addresses
      if (updates.isDefault) {
        userProfile.addresses.forEach(addr => {
          addr.isDefault = false;
        });
      }

      // Update address
      userProfile.addresses[addrIndex] = {
        ...userProfile.addresses[addrIndex],
        ...updates
      };

      return userProfile.addresses[addrIndex];
    }
  );
};

/**
 * Delete an address via API
 */
export const deleteAddress = async (id: string): Promise<boolean> => {
  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  return apiClient.delete<boolean>(
    `/users/${currentUser.id}/addresses/${id}`,
    async () => {
      // Mock fallback implementation
      await new Promise(resolve => setTimeout(resolve, 400)); // Simulate API delay

      // Delete address from user profile
      const userProfile = USERS_DB[currentUser.id];

      if (!userProfile) {
        throw new Error(`User profile not found for ID ${currentUser.id}`);
      }

      // Find address index
      const addrIndex = userProfile.addresses.findIndex(a => a.id === id);

      if (addrIndex === -1) {
        return false;
      }

      // Can't delete the default address
      if (userProfile.addresses[addrIndex].isDefault) {
        throw new Error('Cannot delete default address');
      }

      // Remove address
      userProfile.addresses.splice(addrIndex, 1);

      return true;
    }
  );
};

/**
 * Get user payment methods from the API
 */
export const getPaymentMethods = async (): Promise<PaymentMethod[]> => {
  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  return apiClient.get<PaymentMethod[]>(
    `/users/${currentUser.id}/payment-methods`,
    {},
    async () => {
      // Mock fallback implementation
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay

      // Return payment methods from user profile
      const userProfile = USERS_DB[currentUser.id];

      if (!userProfile) {
        throw new Error(`User profile not found for ID ${currentUser.id}`);
      }

      return userProfile.paymentMethods;
    }
  );
};

/**
 * Update user preferences via API
 */
export const updateUserPreferences = async (preferences: Partial<UserPreferences>): Promise<UserPreferences> => {
  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  return apiClient.put<UserPreferences>(
    `/users/${currentUser.id}/preferences`,
    preferences,
    async () => {
      // Mock fallback implementation
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay

      // Update preferences in user profile
      const userProfile = USERS_DB[currentUser.id];

      if (!userProfile) {
        throw new Error(`User profile not found for ID ${currentUser.id}`);
      }

      // Update preferences object with deep merge
      if (preferences.emailNotifications) {
        userProfile.preferences.emailNotifications = {
          ...userProfile.preferences.emailNotifications,
          ...preferences.emailNotifications
        };
      }

      userProfile.preferences = {
        ...userProfile.preferences,
        ...preferences,
        // Preserve the deep-merged email notifications
        emailNotifications: userProfile.preferences.emailNotifications
      };

      return userProfile.preferences;
    }
  );
};
