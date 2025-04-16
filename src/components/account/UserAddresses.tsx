import React, { useState, useEffect } from 'react';
import {
  getUserAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  Address
} from '../../services/userService';

interface UserAddressesProps {
  userId: string;
}

const UserAddresses: React.FC<UserAddressesProps> = ({ userId }) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // New or edit address form state
  const [addressForm, setAddressForm] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
    isDefault: false,
    phone: '',
    notes: ''
  });

  // Load addresses
  useEffect(() => {
    loadAddresses();
  }, []);

  // Load all addresses from the service
  const loadAddresses = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getUserAddresses();
      setAddresses(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load addresses');
      console.error('Error loading addresses:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input change for address form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setAddressForm({
      ...addressForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Edit an address
  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setAddressForm({
      name: address.name,
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
      isDefault: address.isDefault,
      phone: address.phone || '',
      notes: address.notes || ''
    });
    setShowAddressForm(true);
  };

  // Cancel form
  const handleCancelForm = () => {
    setShowAddressForm(false);
    setEditingAddress(null);
    resetForm();
  };

  // Reset form fields
  const resetForm = () => {
    setAddressForm({
      name: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA',
      isDefault: false,
      phone: '',
      notes: ''
    });
  };

  // Submit the address form (add or update)
  const handleSubmitAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError(null);

    try {
      if (editingAddress) {
        // Update existing address
        await updateAddress(editingAddress.id, addressForm);
      } else {
        // Add new address
        await addAddress(addressForm);
      }

      // Reset and reload
      resetForm();
      setShowAddressForm(false);
      setEditingAddress(null);
      loadAddresses();
    } catch (err: any) {
      setError(err.message || 'Failed to save address');
      console.error('Error saving address:', err);
    } finally {
      setSubmitLoading(false);
    }
  };

  // Set address as default
  const handleSetDefault = async (addressId: string) => {
    if (addresses.find(addr => addr.id === addressId)?.isDefault) {
      return; // Already default
    }

    setIsLoading(true);
    try {
      await updateAddress(addressId, { isDefault: true });
      loadAddresses();
    } catch (err: any) {
      setError(err.message || 'Failed to set default address');
      console.error('Error setting default address:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Confirm address deletion
  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;

    setIsLoading(true);
    try {
      await deleteAddress(confirmDelete);
      setConfirmDelete(null);
      loadAddresses();
    } catch (err: any) {
      setError(err.message || 'Failed to delete address');
      console.error('Error deleting address:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // US states for dropdown
  const US_STATES = [
    { code: 'AL', name: 'Alabama' },
    { code: 'AK', name: 'Alaska' },
    { code: 'AZ', name: 'Arizona' },
    { code: 'AR', name: 'Arkansas' },
    { code: 'CA', name: 'California' },
    { code: 'CO', name: 'Colorado' },
    { code: 'CT', name: 'Connecticut' },
    { code: 'DE', name: 'Delaware' },
    { code: 'FL', name: 'Florida' },
    { code: 'GA', name: 'Georgia' },
    { code: 'HI', name: 'Hawaii' },
    { code: 'ID', name: 'Idaho' },
    { code: 'IL', name: 'Illinois' },
    { code: 'IN', name: 'Indiana' },
    { code: 'IA', name: 'Iowa' },
    { code: 'KS', name: 'Kansas' },
    { code: 'KY', name: 'Kentucky' },
    { code: 'LA', name: 'Louisiana' },
    { code: 'ME', name: 'Maine' },
    { code: 'MD', name: 'Maryland' },
    { code: 'MA', name: 'Massachusetts' },
    { code: 'MI', name: 'Michigan' },
    { code: 'MN', name: 'Minnesota' },
    { code: 'MS', name: 'Mississippi' },
    { code: 'MO', name: 'Missouri' },
    { code: 'MT', name: 'Montana' },
    { code: 'NE', name: 'Nebraska' },
    { code: 'NV', name: 'Nevada' },
    { code: 'NH', name: 'New Hampshire' },
    { code: 'NJ', name: 'New Jersey' },
    { code: 'NM', name: 'New Mexico' },
    { code: 'NY', name: 'New York' },
    { code: 'NC', name: 'North Carolina' },
    { code: 'ND', name: 'North Dakota' },
    { code: 'OH', name: 'Ohio' },
    { code: 'OK', name: 'Oklahoma' },
    { code: 'OR', name: 'Oregon' },
    { code: 'PA', name: 'Pennsylvania' },
    { code: 'RI', name: 'Rhode Island' },
    { code: 'SC', name: 'South Carolina' },
    { code: 'SD', name: 'South Dakota' },
    { code: 'TN', name: 'Tennessee' },
    { code: 'TX', name: 'Texas' },
    { code: 'UT', name: 'Utah' },
    { code: 'VT', name: 'Vermont' },
    { code: 'VA', name: 'Virginia' },
    { code: 'WA', name: 'Washington' },
    { code: 'WV', name: 'West Virginia' },
    { code: 'WI', name: 'Wisconsin' },
    { code: 'WY', name: 'Wyoming' },
    { code: 'DC', name: 'District of Columbia' }
  ];

  // Countries list
  const COUNTRIES = [
    'USA',
    'Canada',
    'Mexico',
    'United Kingdom'
  ];

  // Render loading state
  if (isLoading && !showAddressForm) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-red"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Shipping Addresses</h2>
        {!showAddressForm && (
          <button
            onClick={() => {
              setShowAddressForm(true);
              setEditingAddress(null);
            }}
            className="px-4 py-2 bg-primary-red text-white rounded-md hover:bg-red-700 transition"
          >
            Add New Address
          </button>
        )}
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

      {/* Confirm delete modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium mb-4">Confirm Delete</h3>
            <p className="text-gray-700 mb-6">Are you sure you want to delete this address? This action cannot be undone.</p>
            <div className="flex justify-end">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md mr-2 hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddressForm ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-medium">
              {editingAddress ? `Edit ${editingAddress.name} Address` : 'Add New Address'}
            </h3>
            <button
              onClick={handleCancelForm}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmitAddress}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Address Name / Label *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="e.g., Home, Office, Vacation Home"
                  value={addressForm.name}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 p-2 focus:border-primary-red focus:outline-none focus:ring-primary-red"
                  required
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="(123) 456-7890"
                  value={addressForm.phone}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 p-2 focus:border-primary-red focus:outline-none focus:ring-primary-red"
                />
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
                Street Address *
              </label>
              <input
                type="text"
                id="street"
                name="street"
                placeholder="123 Main St, Apt 4B"
                value={addressForm.street}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 p-2 focus:border-primary-red focus:outline-none focus:ring-primary-red"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={addressForm.city}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 p-2 focus:border-primary-red focus:outline-none focus:ring-primary-red"
                  required
                />
              </div>

              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                  State/Province *
                </label>
                <select
                  id="state"
                  name="state"
                  value={addressForm.state}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 p-2 focus:border-primary-red focus:outline-none focus:ring-primary-red"
                  required
                >
                  <option value="">Select State</option>
                  {US_STATES.map(state => (
                    <option key={state.code} value={state.code}>
                      {state.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP/Postal Code *
                </label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  value={addressForm.zipCode}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 p-2 focus:border-primary-red focus:outline-none focus:ring-primary-red"
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                Country *
              </label>
              <select
                id="country"
                name="country"
                value={addressForm.country}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 p-2 focus:border-primary-red focus:outline-none focus:ring-primary-red"
                required
              >
                {COUNTRIES.map(country => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                placeholder="Special delivery instructions, gate code, etc."
                value={addressForm.notes}
                onChange={handleInputChange}
                rows={2}
                className="w-full rounded-md border border-gray-300 p-2 focus:border-primary-red focus:outline-none focus:ring-primary-red"
              ></textarea>
            </div>

            <div className="mb-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isDefault"
                  name="isDefault"
                  checked={addressForm.isDefault}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary-red focus:ring-primary-red border-gray-300 rounded"
                />
                <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-700">
                  Set as default shipping address
                </label>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleCancelForm}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md mr-2 hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-red text-white rounded-md hover:bg-red-700 transition"
                disabled={submitLoading}
              >
                {submitLoading ? 'Saving...' : (editingAddress ? 'Update Address' : 'Add Address')}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div>
          {addresses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className={`bg-white border ${
                    address.isDefault ? 'border-primary-red' : 'border-gray-200'
                  } rounded-lg p-4 relative`}
                >
                  {address.isDefault && (
                    <div className="absolute top-2 right-2 bg-primary-red text-white px-2 py-1 rounded text-xs">
                      Default
                    </div>
                  )}

                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-medium text-lg">{address.name}</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditAddress(address)}
                        className="text-gray-500 hover:text-gray-700"
                        title="Edit"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setConfirmDelete(address.id)}
                        className="text-gray-500 hover:text-red-600"
                        title="Delete"
                        disabled={address.isDefault}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${address.isDefault ? 'opacity-30 cursor-not-allowed' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 mb-3">
                    <p>{address.street}</p>
                    <p>{address.city}, {address.state} {address.zipCode}</p>
                    <p>{address.country}</p>
                    {address.phone && <p className="mt-1">Phone: {address.phone}</p>}
                  </div>

                  {address.notes && (
                    <div className="text-sm text-gray-500 mb-3">
                      <p><span className="font-medium">Notes:</span> {address.notes}</p>
                    </div>
                  )}

                  {!address.isDefault && (
                    <button
                      onClick={() => handleSetDefault(address.id)}
                      className="text-sm text-primary-red hover:underline"
                    >
                      Set as Default
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No addresses found</h3>
              <p className="mt-1 text-sm text-gray-500">Add shipping addresses to make checkout faster.</p>
              <div className="mt-6">
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-red hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-red"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add New Address
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserAddresses;
