/**
 * Measurements Service
 *
 * This service manages window measurements data with database integration
 */
import { authService } from './authService';
import apiClient from './apiClient';

export interface WindowMeasurement {
  id: string;
  userId: string;
  name: string;
  room: string;
  width: string;
  height: string;
  mountType?: string;
  notes: string;
  dateAdded: Date;
}

// Mock database - in a real app, this would be replaced with actual API calls
const MEASUREMENTS_DB: WindowMeasurement[] = [
  {
    id: 'measurement1',
    userId: 'user1',
    name: 'Living Room Large Window',
    room: 'Living Room',
    width: '72 1/2"',
    height: '48"',
    mountType: 'Inside Mount',
    notes: 'Need to account for trim',
    dateAdded: new Date('2024-02-15')
  },
  {
    id: 'measurement2',
    userId: 'user1',
    name: 'Master Bedroom Window',
    room: 'Bedroom',
    width: '48 3/4"',
    height: '60"',
    mountType: 'Outside Mount',
    notes: 'Blackout shades required',
    dateAdded: new Date('2024-02-16')
  },
  {
    id: 'measurement3',
    userId: 'user1',
    name: 'Kitchen Window Above Sink',
    room: 'Kitchen',
    width: '36"',
    height: '24"',
    mountType: 'Inside Mount',
    notes: 'Water resistant material recommended',
    dateAdded: new Date('2024-03-01')
  },
  {
    id: 'measurement4',
    userId: 'user1',
    name: 'Office Window',
    room: 'Office',
    width: '55"',
    height: '72"',
    mountType: 'Outside Mount',
    notes: 'Light filtering for glare reduction',
    dateAdded: new Date('2024-03-12')
  }
];

/**
 * Get all measurements for the current user from the API
 */
export const getMeasurements = async (): Promise<WindowMeasurement[]> => {
  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  return apiClient.get<WindowMeasurement[]>(
    `/measurements`,
    {},
    async () => {
      // Mock fallback implementation
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay

      // Filter measurements by user ID
      return MEASUREMENTS_DB
        .filter(m => m.userId === currentUser.id)
        .sort((a, b) => b.dateAdded.getTime() - a.dateAdded.getTime()); // Sort by most recent first
    }
  );
};

/**
 * Get a specific measurement by ID from the API
 */
export const getMeasurementById = async (id: string): Promise<WindowMeasurement> => {
  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  return apiClient.get<WindowMeasurement>(
    `/measurements/${id}`,
    {},
    async () => {
      // Mock fallback implementation
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay

      // Find the measurement
      const measurement = MEASUREMENTS_DB.find(
        m => m.id === id && m.userId === currentUser.id
      );

      if (!measurement) {
        throw new Error(`Measurement with ID ${id} not found`);
      }

      return measurement;
    }
  );
};

/**
 * Add a new measurement via the API
 */
export const addMeasurement = async (measurement: Omit<WindowMeasurement, 'id' | 'userId' | 'dateAdded'>): Promise<WindowMeasurement> => {
  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  return apiClient.post<WindowMeasurement>(
    `/measurements`,
    measurement,
    async () => {
      // Mock fallback implementation
      await new Promise(resolve => setTimeout(resolve, 600)); // Simulate API delay

      // Create a new measurement
      const newMeasurement: WindowMeasurement = {
        id: `measurement${Date.now()}`,
        userId: currentUser.id,
        dateAdded: new Date(),
        ...measurement
      };

      // Add to our mock database
      MEASUREMENTS_DB.push(newMeasurement);

      return newMeasurement;
    }
  );
};

/**
 * Update an existing measurement via the API
 */
export const updateMeasurement = async (id: string, updates: Partial<Omit<WindowMeasurement, 'id' | 'userId' | 'dateAdded'>>): Promise<WindowMeasurement> => {
  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  return apiClient.put<WindowMeasurement>(
    `/measurements/${id}`,
    updates,
    async () => {
      // Mock fallback implementation
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay

      // Find the measurement index
      const measurementIndex = MEASUREMENTS_DB.findIndex(
        m => m.id === id && m.userId === currentUser.id
      );

      if (measurementIndex === -1) {
        throw new Error(`Measurement with ID ${id} not found`);
      }

      // Update the measurement
      MEASUREMENTS_DB[measurementIndex] = {
        ...MEASUREMENTS_DB[measurementIndex],
        ...updates
      };

      return MEASUREMENTS_DB[measurementIndex];
    }
  );
};

/**
 * Delete a measurement via the API
 */
export const deleteMeasurement = async (id: string): Promise<boolean> => {
  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  return apiClient.delete<boolean>(
    `/measurements/${id}`,
    async () => {
      // Mock fallback implementation
      await new Promise(resolve => setTimeout(resolve, 400)); // Simulate API delay

      // Find the measurement index
      const measurementIndex = MEASUREMENTS_DB.findIndex(
        m => m.id === id && m.userId === currentUser.id
      );

      if (measurementIndex === -1) {
        throw new Error(`Measurement with ID ${id} not found`);
      }

      // Remove the measurement
      MEASUREMENTS_DB.splice(measurementIndex, 1);

      return true;
    }
  );
};

/**
 * Get measurements grouped by room from the API
 */
export const getMeasurementsByRoom = async (): Promise<Record<string, WindowMeasurement[]>> => {
  const measurements = await getMeasurements();

  // Group measurements by room
  const grouped: Record<string, WindowMeasurement[]> = {};

  measurements.forEach(measurement => {
    if (!grouped[measurement.room]) {
      grouped[measurement.room] = [];
    }
    grouped[measurement.room].push(measurement);
  });

  return grouped;
};

/**
 * Import measurements from a file via the API
 */
export const importMeasurements = async (file: File): Promise<WindowMeasurement[]> => {
  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  return apiClient.uploadFile<WindowMeasurement[]>(
    `/measurements/import`,
    file,
    {},
    async () => {
      // Mock fallback implementation
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay

      // Normally we would parse the file here
      // For mock purposes, we'll just create some dummy measurements

      const importedMeasurements: WindowMeasurement[] = [
        {
          id: `measurement${Date.now()}`,
          userId: currentUser.id,
          name: 'Imported - Living Room',
          room: 'Living Room',
          width: '65"',
          height: '48"',
          mountType: 'Inside Mount',
          notes: 'Imported from file',
          dateAdded: new Date()
        },
        {
          id: `measurement${Date.now() + 1}`,
          userId: currentUser.id,
          name: 'Imported - Dining Room',
          room: 'Dining Room',
          width: '36"',
          height: '60"',
          mountType: 'Outside Mount',
          notes: 'Imported from file',
          dateAdded: new Date()
        }
      ];

      // Add to our mock database
      MEASUREMENTS_DB.push(...importedMeasurements);

      return importedMeasurements;
    }
  );
};
