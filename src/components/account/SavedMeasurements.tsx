import React, { useState, useEffect } from 'react';
import {
  getMeasurements,
  addMeasurement,
  updateMeasurement,
  deleteMeasurement,
  WindowMeasurement
} from '../../services/measurementsService';

// Room and mount type options
const ROOM_TYPES = [
  'Living Room',
  'Bedroom',
  'Kitchen',
  'Dining Room',
  'Bathroom',
  'Office',
  'Hallway',
  'Other'
];

const MOUNT_TYPES = [
  'Inside Mount',
  'Outside Mount',
  'Ceiling Mount'
];

interface SavedMeasurementsProps {
  userId: string;
}

const SavedMeasurements: React.FC<SavedMeasurementsProps> = ({ userId }) => {
  const [measurements, setMeasurements] = useState<WindowMeasurement[]>([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<WindowMeasurement, 'id' | 'userId' | 'dateAdded'>>({
    name: '',
    room: '',
    width: '',
    height: '',
    mountType: '',
    notes: ''
  });

  // Load measurements
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const measurementsData = await getMeasurements();
        setMeasurements(measurementsData);
      } catch (err: any) {
        setError(err.message || 'Failed to load measurements');
        console.error('Error loading measurements:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Reset form data
  const resetForm = () => {
    setFormData({
      name: '',
      room: '',
      width: '',
      height: '',
      mountType: '',
      notes: ''
    });
  };

  // Handle form submission for new or edited measurement
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (editingId) {
        // Update existing measurement
        await updateMeasurement(editingId, formData);
      } else {
        // Add new measurement
        await addMeasurement(formData);
      }

      // Refresh the list and reset form
      const refreshedMeasurements = await getMeasurements();
      setMeasurements(refreshedMeasurements);
      resetForm();
      setEditingId(null);
      setIsAddingNew(false);
    } catch (err: any) {
      setError(err.message || 'Failed to save measurement');
      console.error('Error saving measurement:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Start editing a measurement
  const handleEdit = (measurement: WindowMeasurement) => {
    setFormData({
      name: measurement.name,
      room: measurement.room,
      width: measurement.width,
      height: measurement.height,
      mountType: measurement.mountType || '',
      notes: measurement.notes
    });
    setEditingId(measurement.id);
    setIsAddingNew(true);
  };

  // Delete a measurement
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this measurement?')) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await deleteMeasurement(id);

      // Refresh the list
      const refreshedMeasurements = await getMeasurements();
      setMeasurements(refreshedMeasurements);
    } catch (err: any) {
      setError(err.message || 'Failed to delete measurement');
      console.error('Error deleting measurement:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel form editing
  const handleCancel = () => {
    resetForm();
    setEditingId(null);
    setIsAddingNew(false);
  };

  // Use measurement for a new order (placeholder for now)
  const useMeasurement = (measurement: WindowMeasurement) => {
    // This would typically navigate to product configuration with pre-filled dimensions
    window.location.href = `/product/configure/product-1?width=${measurement.width}&height=${measurement.height}`;
  };

  // Format date nicely
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Generate PDF with measurements
  const handlePrintMeasurements = () => {
    window.print();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Saved Measurements</h2>
        <div className="flex space-x-2">
          {!isAddingNew && (
            <>
              <button
                onClick={() => setIsAddingNew(true)}
                className="px-4 py-2 bg-primary-red text-white rounded-md hover:bg-red-700 transition"
              >
                Add New Measurement
              </button>
              {measurements.length > 0 && (
                <button
                  onClick={handlePrintMeasurements}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {isAddingNew ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-xl font-medium mb-4">{editingId ? 'Edit Measurement' : 'Add New Measurement'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Measurement Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 p-2 focus:border-primary-red focus:outline-none focus:ring-primary-red"
                  required
                  placeholder="e.g., Living Room Bay Window"
                />
              </div>
              <div>
                <label htmlFor="room" className="block text-sm font-medium text-gray-700 mb-1">
                  Room *
                </label>
                <select
                  id="room"
                  name="room"
                  value={formData.room}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 p-2 focus:border-primary-red focus:outline-none focus:ring-primary-red"
                  required
                >
                  <option value="">Select Room</option>
                  {ROOM_TYPES.map(room => (
                    <option key={room} value={room}>{room}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label htmlFor="width" className="block text-sm font-medium text-gray-700 mb-1">
                  Width *
                </label>
                <input
                  type="text"
                  id="width"
                  name="width"
                  value={formData.width}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 p-2 focus:border-primary-red focus:outline-none focus:ring-primary-red"
                  required
                  placeholder="e.g., 36&quot;, 48 1/2&quot;"
                />
              </div>
              <div>
                <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">
                  Height *
                </label>
                <input
                  type="text"
                  id="height"
                  name="height"
                  value={formData.height}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 p-2 focus:border-primary-red focus:outline-none focus:ring-primary-red"
                  required
                  placeholder="e.g., 72&quot;, 60 3/4&quot;"
                />
              </div>
              <div>
                <label htmlFor="mountType" className="block text-sm font-medium text-gray-700 mb-1">
                  Mount Type
                </label>
                <select
                  id="mountType"
                  name="mountType"
                  value={formData.mountType}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 p-2 focus:border-primary-red focus:outline-none focus:ring-primary-red"
                >
                  <option value="">Select Mount Type</option>
                  {MOUNT_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full rounded-md border border-gray-300 p-2 focus:border-primary-red focus:outline-none focus:ring-primary-red"
                placeholder="Add any special notes about this window..."
              ></textarea>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-red text-white rounded-md hover:bg-red-700 transition"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : (editingId ? 'Update Measurement' : 'Save Measurement')}
              </button>
            </div>
          </form>
        </div>
      ) : isLoading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-red"></div>
        </div>
      ) : measurements.length > 0 ? (
        <div className="overflow-hidden bg-white shadow sm:rounded-md print:shadow-none">
          <ul className="divide-y divide-gray-200">
            {measurements.map(measurement => (
              <li key={measurement.id} className="block">
                <div className="px-4 py-4 sm:px-6 flex flex-col sm:flex-row gap-4 justify-between items-start">
                  <div className="flex-grow">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">{measurement.name}</h3>
                      <span className="ml-2 text-sm px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                        {measurement.room}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-600 flex-wrap gap-x-4 gap-y-1">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 13l-7 7-7-7m14-8l-7 7-7-7" />
                        </svg>
                        <span><strong>Width:</strong> {measurement.width}</span>
                      </div>
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                        </svg>
                        <span><strong>Height:</strong> {measurement.height}</span>
                      </div>
                      {measurement.mountType && (
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span><strong>Mount:</strong> {measurement.mountType}</span>
                        </div>
                      )}
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{formatDate(measurement.dateAdded)}</span>
                      </div>
                    </div>
                    {measurement.notes && (
                      <div className="mt-2 text-sm text-gray-500">
                        <strong>Notes:</strong> {measurement.notes}
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2 print:hidden">
                    <button
                      onClick={() => useMeasurement(measurement)}
                      className="inline-flex items-center px-3 py-1 border border-primary-red text-sm font-medium rounded-md text-primary-red bg-white hover:bg-red-50"
                    >
                      Use
                    </button>
                    <button
                      onClick={() => handleEdit(measurement)}
                      className="inline-flex items-center px-2 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(measurement.id)}
                      className="inline-flex items-center px-2 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No measurements saved</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by saving your window measurements.</p>
          <div className="mt-6">
            <button
              onClick={() => setIsAddingNew(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-red hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-red"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add New Measurement
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedMeasurements;
