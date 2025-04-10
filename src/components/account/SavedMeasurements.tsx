import React, { useState } from 'react';

interface WindowMeasurement {
  id: string;
  name: string;
  room: string;
  width: string;
  height: string;
  notes: string;
  dateAdded: Date;
}

interface SavedMeasurementsProps {
  userId: string;
}

// Mock saved measurements
const mockMeasurements: WindowMeasurement[] = [
  {
    id: 'measurement1',
    name: 'Living Room Large Window',
    room: 'Living Room',
    width: '72 1/2"',
    height: '48"',
    notes: 'Inside mount, need to account for trim',
    dateAdded: new Date('2024-02-15')
  },
  {
    id: 'measurement2',
    name: 'Master Bedroom Window',
    room: 'Bedroom',
    width: '48 3/4"',
    height: '60"',
    notes: 'Outside mount, blackout shades',
    dateAdded: new Date('2024-02-16')
  },
  {
    id: 'measurement3',
    name: 'Kitchen Window Above Sink',
    room: 'Kitchen',
    width: '36"',
    height: '24"',
    notes: 'Inside mount, moisture-resistant material',
    dateAdded: new Date('2024-03-22')
  }
];

const SavedMeasurements: React.FC<SavedMeasurementsProps> = ({ userId }) => {
  const [measurements, setMeasurements] = useState<WindowMeasurement[]>(mockMeasurements);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<WindowMeasurement, 'id' | 'dateAdded'>>({
    name: '',
    room: '',
    width: '',
    height: '',
    notes: ''
  });

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Start editing a measurement
  const handleEdit = (measurement: WindowMeasurement) => {
    setFormData({
      name: measurement.name,
      room: measurement.room,
      width: measurement.width,
      height: measurement.height,
      notes: measurement.notes
    });
    setEditingId(measurement.id);
    setIsAddingNew(false);
  };

  // Delete a measurement
  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this saved measurement?')) {
      setMeasurements(measurements.filter(m => m.id !== id));
      if (editingId === id) {
        resetForm();
      }
    }
  };

  // Reset the form
  const resetForm = () => {
    setFormData({
      name: '',
      room: '',
      width: '',
      height: '',
      notes: ''
    });
    setEditingId(null);
    setIsAddingNew(false);
  };

  // Submit the form to add or update a measurement
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      // Update existing measurement
      setMeasurements(
        measurements.map(m =>
          m.id === editingId
            ? { ...m, ...formData }
            : m
        )
      );
    } else {
      // Add new measurement
      const newMeasurement: WindowMeasurement = {
        ...formData,
        id: `measurement${measurements.length + 1}`,
        dateAdded: new Date()
      };
      setMeasurements([...measurements, newMeasurement]);
    }

    // Reset form after submission
    resetForm();
  };

  // Room options
  const roomOptions = [
    'Living Room',
    'Bedroom',
    'Kitchen',
    'Dining Room',
    'Bathroom',
    'Office',
    'Hallway',
    'Other'
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Saved Measurements</h2>
        <button
          onClick={() => { setIsAddingNew(true); setEditingId(null); }}
          className="px-4 py-2 bg-primary-red text-white rounded-md hover:bg-red-700 transition"
        >
          Add New Measurement
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {measurements.map((measurement) => (
          <div
            key={measurement.id}
            className={`border rounded-lg overflow-hidden ${editingId === measurement.id ? 'border-primary-red' : 'border-gray-200'}`}
          >
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-lg">{measurement.name}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(measurement)}
                    className="text-gray-500 hover:text-primary-red"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(measurement.id)}
                    className="text-gray-500 hover:text-red-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-3">{measurement.room}</p>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <span className="block text-xs text-gray-500">Width</span>
                  <span className="text-sm font-medium">{measurement.width}</span>
                </div>
                <div>
                  <span className="block text-xs text-gray-500">Height</span>
                  <span className="text-sm font-medium">{measurement.height}</span>
                </div>
              </div>

              {measurement.notes && (
                <div className="mb-3">
                  <span className="block text-xs text-gray-500">Notes</span>
                  <p className="text-sm">{measurement.notes}</p>
                </div>
              )}

              <div className="text-xs text-gray-500">
                Added on {measurement.dateAdded.toLocaleDateString()}
              </div>
            </div>

            <div className="bg-gray-50 p-3 border-t border-gray-200 flex justify-between">
              <button
                className="text-xs text-primary-red hover:text-red-700"
                onClick={() => window.open(`/product/configure/product-1?width=${measurement.width}&height=${measurement.height}`, '_blank')}
              >
                Use for New Order
              </button>
              <button className="text-xs text-gray-600 hover:text-gray-900">
                Print Measurement
              </button>
            </div>
          </div>
        ))}
      </div>

      {(isAddingNew || editingId) && (
        <div className="mt-6 border border-gray-200 rounded-lg p-6">
          <h3 className="text-xl font-medium mb-4">
            {editingId ? 'Edit Measurement' : 'Add New Measurement'}
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="md:col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Measurement Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Living Room Window"
                  className="w-full rounded-md border border-gray-300 p-2 focus:border-primary-red focus:outline-none focus:ring-primary-red"
                  required
                />
              </div>

              <div>
                <label htmlFor="room" className="block text-sm font-medium text-gray-700 mb-1">
                  Room
                </label>
                <select
                  id="room"
                  name="room"
                  value={formData.room}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 p-2 focus:border-primary-red focus:outline-none focus:ring-primary-red"
                  required
                >
                  <option value="">Select a room</option>
                  {roomOptions.map(room => (
                    <option key={room} value={room}>{room}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="width" className="block text-sm font-medium text-gray-700 mb-1">
                  Width
                </label>
                <input
                  type="text"
                  id="width"
                  name="width"
                  value={formData.width}
                  onChange={handleChange}
                  placeholder="e.g. 36 inches"
                  className="w-full rounded-md border border-gray-300 p-2 focus:border-primary-red focus:outline-none focus:ring-primary-red"
                  required
                />
              </div>

              <div>
                <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">
                  Height
                </label>
                <input
                  type="text"
                  id="height"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  placeholder="e.g. 48 inches"
                  className="w-full rounded-md border border-gray-300 p-2 focus:border-primary-red focus:outline-none focus:ring-primary-red"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Add any additional notes about this window"
                  className="w-full rounded-md border border-gray-300 p-2 focus:border-primary-red focus:outline-none focus:ring-primary-red"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-red text-white rounded-md hover:bg-red-700 transition"
              >
                {editingId ? 'Update' : 'Save'} Measurement
              </button>
            </div>
          </form>
        </div>
      )}

      {measurements.length === 0 && !isAddingNew && (
        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <p className="text-lg text-gray-600 mb-4">You don't have any saved measurements yet.</p>
          <button
            onClick={() => setIsAddingNew(true)}
            className="px-6 py-2 bg-primary-red text-white rounded-md inline-block hover:bg-red-700 transition"
          >
            Add Your First Measurement
          </button>
        </div>
      )}
    </div>
  );
};

export default SavedMeasurements;
