import React, { useState, useEffect } from 'react';
import { authService } from '../../../services/authService';

interface ShippingAddress {
  id: string;
  name: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isPrimary: boolean;
  notes: string;
}

const ShippingAddresses: React.FC = () => {
  const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  // New address form
  const defaultNewAddress: Omit<ShippingAddress, 'id'> = {
    name: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    isPrimary: false,
    notes: ''
  };

  const [newAddress, setNewAddress] = useState<Omit<ShippingAddress, 'id'>>(defaultNewAddress);
  const [showNewAddressForm, setShowNewAddressForm] = useState<boolean>(false);

  // Load shipping addresses
  useEffect(() => {
    const loadShippingAddresses = () => {
      const user = authService.getCurrentUser();

      if (user?.vendorInfo?.shippingAddresses) {
        setAddresses(user.vendorInfo.shippingAddresses);
      } else {
        // Initialize with an empty array if no shipping addresses exist
        setAddresses([]);
      }

      setIsLoading(false);
    };

    loadShippingAddresses();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    isNewAddress: boolean = false
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

    if (isNewAddress) {
      setNewAddress(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    } else {
      setAddresses(prev => prev.map(address => {
        if (address.id === editingAddressId) {
          return {
            ...address,
            [name]: type === 'checkbox' ? checked : value
          };
        }
        return address;
      }));
    }
  };

  const handleAddAddress = () => {
    // Simple validation
    if (!newAddress.name.trim() || !newAddress.addressLine1.trim() || !newAddress.city.trim() ||
        !newAddress.state.trim() || !newAddress.zipCode.trim()) {
      setErrorMessage('Please fill in all required fields');
      return;
    }

    // Create new address with a unique ID
    const newAddressWithId: ShippingAddress = {
      ...newAddress,
      id: `addr-${Date.now()}`
    };

    // If this is the first address or it's marked as primary, ensure it's the only primary address
    const updatedAddresses = [...addresses];

    if (newAddress.isPrimary || addresses.length === 0) {
      // Set all other addresses to non-primary
      updatedAddresses.forEach(addr => {
        addr.isPrimary = false;
      });

      // Ensure the new address is primary
      newAddressWithId.isPrimary = true;
    }

    // Add to the list
    setAddresses([...updatedAddresses, newAddressWithId]);

    // Reset form and hide it
    setNewAddress(defaultNewAddress);
    setShowNewAddressForm(false);
    setErrorMessage(null);
  };

  const handleEditAddress = (id: string) => {
    setEditingAddressId(id);
    setErrorMessage(null);
  };

  const handleCancelEdit = () => {
    setEditingAddressId(null);
  };

  const handleDeleteAddress = (id: string) => {
    // Prevent deleting the only address or primary address if it's the only one
    const addressToDelete = addresses.find(addr => addr.id === id);

    if (addresses.length === 1) {
      setErrorMessage('You cannot delete your only shipping address');
      return;
    }

    if (addressToDelete?.isPrimary && addresses.length > 1) {
      setErrorMessage('You cannot delete your primary shipping address. Please set another address as primary first.');
      return;
    }

    // Remove the address
    setAddresses(prev => prev.filter(address => address.id !== id));
    setErrorMessage(null);
  };

  const handleSetPrimary = (id: string) => {
    setAddresses(prev => prev.map(address => ({
      ...address,
      isPrimary: address.id === id
    })));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSaving(true);

    try {
      // Make sure there's at least one address
      if (addresses.length === 0) {
        throw new Error('You must have at least one shipping address');
      }

      // Make sure there's exactly one primary address
      const primaryAddresses = addresses.filter(addr => addr.isPrimary);

      if (primaryAddresses.length === 0) {
        throw new Error('You must designate one address as primary');
      } else if (primaryAddresses.length > 1) {
        throw new Error('You can only have one primary address');
      }

      // In a real app, this would be an API call to update shipping addresses
      const user = authService.getCurrentUser();

      if (user) {
        const updatedUser = {
          ...user,
          vendorInfo: {
            ...user.vendorInfo,
            shippingAddresses: addresses
          }
        };

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // Update user in localStorage (in a real app, this would be stored in a database)
        localStorage.setItem('user', JSON.stringify(updatedUser));

        setSuccessMessage('Shipping addresses updated successfully');
      } else {
        throw new Error('User not found');
      }
    } catch (error) {
      setErrorMessage((error as Error).message || 'Failed to update shipping addresses');
      console.error('Error updating shipping addresses:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Shipping Origin Addresses</h2>

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Addresses List */}
        {addresses.length > 0 ? (
          <div className="space-y-4">
            {addresses.map((address) => (
              <div key={address.id} className={`border ${address.isPrimary ? 'border-blue-300 bg-blue-50' : 'border-gray-200'} rounded-lg p-4`}>
                {editingAddressId === address.id ? (
                  /* Edit Address Form */
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Edit Address</h3>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor={`name-${address.id}`} className="block text-sm font-medium text-gray-700">
                          Address Name*
                        </label>
                        <input
                          type="text"
                          id={`name-${address.id}`}
                          name="name"
                          value={address.name}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="e.g., Main Warehouse, Distribution Center"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center h-full pt-6">
                          <input
                            type="checkbox"
                            id={`isPrimary-${address.id}`}
                            name="isPrimary"
                            checked={address.isPrimary}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label htmlFor={`isPrimary-${address.id}`} className="ml-2 block text-sm text-gray-700">
                            Primary Shipping Address
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor={`addressLine1-${address.id}`} className="block text-sm font-medium text-gray-700">
                        Address Line 1*
                      </label>
                      <input
                        type="text"
                        id={`addressLine1-${address.id}`}
                        name="addressLine1"
                        value={address.addressLine1}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Street address"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor={`addressLine2-${address.id}`} className="block text-sm font-medium text-gray-700">
                        Address Line 2
                      </label>
                      <input
                        type="text"
                        id={`addressLine2-${address.id}`}
                        name="addressLine2"
                        value={address.addressLine2}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Apt, suite, unit, etc."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label htmlFor={`city-${address.id}`} className="block text-sm font-medium text-gray-700">
                          City*
                        </label>
                        <input
                          type="text"
                          id={`city-${address.id}`}
                          name="city"
                          value={address.city}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor={`state-${address.id}`} className="block text-sm font-medium text-gray-700">
                          State/Province*
                        </label>
                        <input
                          type="text"
                          id={`state-${address.id}`}
                          name="state"
                          value={address.state}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor={`zipCode-${address.id}`} className="block text-sm font-medium text-gray-700">
                          ZIP/Postal Code*
                        </label>
                        <input
                          type="text"
                          id={`zipCode-${address.id}`}
                          name="zipCode"
                          value={address.zipCode}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor={`country-${address.id}`} className="block text-sm font-medium text-gray-700">
                        Country*
                      </label>
                      <select
                        id={`country-${address.id}`}
                        name="country"
                        value={address.country}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="United States">United States</option>
                        <option value="Canada">Canada</option>
                        <option value="Mexico">Mexico</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Australia">Australia</option>
                        <option value="Germany">Germany</option>
                        <option value="France">France</option>
                        <option value="China">China</option>
                        <option value="Japan">Japan</option>
                        <option value="India">India</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor={`notes-${address.id}`} className="block text-sm font-medium text-gray-700">
                        Notes
                      </label>
                      <textarea
                        id={`notes-${address.id}`}
                        name="notes"
                        value={address.notes}
                        onChange={handleInputChange}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Additional notes about this address"
                      />
                    </div>
                  </div>
                ) : (
                  /* Address Display */
                  <div>
                    <div className="flex justify-between">
                      <div>
                        <h3 className="text-lg font-medium">
                          {address.name}
                          {address.isPrimary && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Primary
                            </span>
                          )}
                        </h3>
                        <p className="text-gray-600 mt-1">{address.addressLine1}</p>
                        {address.addressLine2 && <p className="text-gray-600">{address.addressLine2}</p>}
                        <p className="text-gray-600">{address.city}, {address.state} {address.zipCode}</p>
                        <p className="text-gray-600">{address.country}</p>
                        {address.notes && <p className="text-gray-500 text-sm mt-2">Notes: {address.notes}</p>}
                      </div>
                      <div className="flex flex-col space-y-2">
                        <button
                          type="button"
                          onClick={() => handleEditAddress(address.id)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Edit
                        </button>
                        {!address.isPrimary && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleSetPrimary(address.id)}
                              className="text-gray-600 hover:text-gray-800 text-sm"
                            >
                              Set as Primary
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteAddress(address.id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
            <p className="text-gray-600 mb-4">No shipping addresses have been added yet.</p>
            <button
              type="button"
              onClick={() => setShowNewAddressForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add Your First Address
            </button>
          </div>
        )}

        {/* Add New Address Form */}
        {showNewAddressForm && (
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 mt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Add New Address</h3>
              <button
                type="button"
                onClick={() => setShowNewAddressForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="new-name" className="block text-sm font-medium text-gray-700">
                  Address Name*
                </label>
                <input
                  type="text"
                  id="new-name"
                  name="name"
                  value={newAddress.name}
                  onChange={(e) => handleInputChange(e, true)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Main Warehouse, Distribution Center"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center h-full pt-6">
                  <input
                    type="checkbox"
                    id="new-isPrimary"
                    name="isPrimary"
                    checked={newAddress.isPrimary || addresses.length === 0}
                    onChange={(e) => handleInputChange(e, true)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    disabled={addresses.length === 0} // Force primary if it's the first address
                  />
                  <label htmlFor="new-isPrimary" className="ml-2 block text-sm text-gray-700">
                    Primary Shipping Address {addresses.length === 0 && "(Required for first address)"}
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <label htmlFor="new-addressLine1" className="block text-sm font-medium text-gray-700">
                  Address Line 1*
                </label>
                <input
                  type="text"
                  id="new-addressLine1"
                  name="addressLine1"
                  value={newAddress.addressLine1}
                  onChange={(e) => handleInputChange(e, true)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Street address"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="new-addressLine2" className="block text-sm font-medium text-gray-700">
                  Address Line 2
                </label>
                <input
                  type="text"
                  id="new-addressLine2"
                  name="addressLine2"
                  value={newAddress.addressLine2}
                  onChange={(e) => handleInputChange(e, true)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Apt, suite, unit, etc."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label htmlFor="new-city" className="block text-sm font-medium text-gray-700">
                    City*
                  </label>
                  <input
                    type="text"
                    id="new-city"
                    name="city"
                    value={newAddress.city}
                    onChange={(e) => handleInputChange(e, true)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="new-state" className="block text-sm font-medium text-gray-700">
                    State/Province*
                  </label>
                  <input
                    type="text"
                    id="new-state"
                    name="state"
                    value={newAddress.state}
                    onChange={(e) => handleInputChange(e, true)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="new-zipCode" className="block text-sm font-medium text-gray-700">
                    ZIP/Postal Code*
                  </label>
                  <input
                    type="text"
                    id="new-zipCode"
                    name="zipCode"
                    value={newAddress.zipCode}
                    onChange={(e) => handleInputChange(e, true)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="new-country" className="block text-sm font-medium text-gray-700">
                  Country*
                </label>
                <select
                  id="new-country"
                  name="country"
                  value={newAddress.country}
                  onChange={(e) => handleInputChange(e, true)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="United States">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="Mexico">Mexico</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Australia">Australia</option>
                  <option value="Germany">Germany</option>
                  <option value="France">France</option>
                  <option value="China">China</option>
                  <option value="Japan">Japan</option>
                  <option value="India">India</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="new-notes" className="block text-sm font-medium text-gray-700">
                  Notes
                </label>
                <textarea
                  id="new-notes"
                  name="notes"
                  value={newAddress.notes}
                  onChange={(e) => handleInputChange(e, true)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Additional notes about this address"
                />
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleAddAddress}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Add Address
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Address Button */}
        {addresses.length > 0 && !showNewAddressForm && (
          <div className="flex justify-start mt-4">
            <button
              type="button"
              onClick={() => setShowNewAddressForm(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Add Another Address
            </button>
          </div>
        )}

        {/* Submit Button */}
        {addresses.length > 0 && (
          <div className="pt-4 border-t border-gray-200 mt-6">
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSaving ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : 'Save Changes'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default ShippingAddresses;
