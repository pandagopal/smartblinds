import React, { useState } from 'react';
import { Customer, Quote, Address } from '../../../models/Customer';

interface CustomerInfoFormProps {
  customers: Customer[];
  selectedCustomerId: string | null;
  onCustomerSelect: (customerId: string) => void;
  quote: Quote;
  setQuote: React.Dispatch<React.SetStateAction<Quote | null>>;
}

const CustomerInfoForm: React.FC<CustomerInfoFormProps> = ({
  customers,
  selectedCustomerId,
  onCustomerSelect,
  quote,
  setQuote
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddNew, setShowAddNew] = useState(false);
  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    addresses: [{
      street: '',
      city: '',
      state: '',
      zip: '',
      country: 'US',
      type: 'installation',
      isDefault: true
    }],
    status: 'lead',
    isProspect: true
  });

  // Filter customers based on search query
  const filteredCustomers = searchQuery
    ? customers.filter(customer =>
        `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.includes(searchQuery)
      )
    : customers;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleNewCustomerChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      const updatedAddresses = [...(newCustomer.addresses || [])];

      if (updatedAddresses[0]) {
        updatedAddresses[0] = {
          ...updatedAddresses[0],
          [addressField]: value
        };
      }

      setNewCustomer({
        ...newCustomer,
        addresses: updatedAddresses
      });
    } else {
      setNewCustomer({
        ...newCustomer,
        [name]: value
      });
    }
  };

  const handleSaveNewCustomer = () => {
    // Validate required fields
    if (!newCustomer.firstName || !newCustomer.lastName || !newCustomer.email || !newCustomer.phone) {
      alert('Please fill in all required fields');
      return;
    }

    // In a real application, this would send the data to an API
    const newCustomerId = `customer-${Date.now()}`;
    const fullCustomer: Customer = {
      id: newCustomerId,
      firstName: newCustomer.firstName || '',
      lastName: newCustomer.lastName || '',
      email: newCustomer.email || '',
      phone: newCustomer.phone || '',
      addresses: newCustomer.addresses as Address[],
      createdAt: new Date(),
      updatedAt: new Date(),
      isProspect: true,
      status: 'lead'
    };

    // This would be handled by the API in a real app
    // For this demo, we'll just console.log and pretend it was saved
    console.log('Saving new customer:', fullCustomer);

    // In production, after API saves the customer:
    onCustomerSelect(newCustomerId);
    setShowAddNew(false);
  };

  const handleQuoteNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (quote) {
      setQuote({
        ...quote,
        notes: e.target.value
      });
    }
  };

  return (
    <div>
      {!showAddNew ? (
        <div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Customer
            </label>
            <div className="flex">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search by name, email, or phone"
                className="flex-grow px-4 py-2 border border-gray-300 rounded-l focus:ring-primary-red focus:border-primary-red"
              />
              <button
                onClick={() => setShowAddNew(true)}
                className="bg-primary-red text-white px-4 py-2 rounded-r hover:bg-red-700"
              >
                Add New
              </button>
            </div>
          </div>

          {searchQuery && filteredCustomers.length === 0 && (
            <div className="text-center py-4 border border-gray-200 rounded">
              <p className="text-gray-500">No customers found. Try a different search or add a new customer.</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {filteredCustomers.slice(0, 6).map((customer) => (
              <div
                key={customer.id}
                onClick={() => onCustomerSelect(customer.id)}
                className={`p-4 border rounded cursor-pointer transition-colors ${
                  selectedCustomerId === customer.id
                    ? 'border-primary-red bg-red-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{customer.firstName} {customer.lastName}</h3>
                    <p className="text-sm text-gray-600">{customer.email}</p>
                    <p className="text-sm text-gray-600">{customer.phone}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    customer.status === 'active' ? 'bg-green-100 text-green-800' :
                    customer.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {customer.status}
                  </span>
                </div>
                {customer.addresses && customer.addresses.length > 0 && (
                  <div className="mt-2 text-xs text-gray-500">
                    <p>{customer.addresses[0].street}</p>
                    <p>{customer.addresses[0].city}, {customer.addresses[0].state} {customer.addresses[0].zip}</p>
                  </div>
                )}
                {selectedCustomerId === customer.id && (
                  <div className="mt-2 text-xs text-primary-red">Selected</div>
                )}
              </div>
            ))}
          </div>

          {selectedCustomerId && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quote Notes
              </label>
              <textarea
                value={quote.notes || ''}
                onChange={handleQuoteNoteChange}
                placeholder="Enter any special requirements or notes for this quote"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-primary-red focus:border-primary-red h-24"
              />
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-800">Add New Customer</h3>
            <button
              onClick={() => setShowAddNew(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name <span className="text-primary-red">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                value={newCustomer.firstName || ''}
                onChange={handleNewCustomerChange}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-primary-red focus:border-primary-red"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name <span className="text-primary-red">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                value={newCustomer.lastName || ''}
                onChange={handleNewCustomerChange}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-primary-red focus:border-primary-red"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-primary-red">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={newCustomer.email || ''}
                onChange={handleNewCustomerChange}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-primary-red focus:border-primary-red"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone <span className="text-primary-red">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={newCustomer.phone || ''}
                onChange={handleNewCustomerChange}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-primary-red focus:border-primary-red"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <h4 className="text-md font-medium text-gray-800 mb-2">Address Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  name="address.street"
                  value={newCustomer.addresses?.[0]?.street || ''}
                  onChange={handleNewCustomerChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-primary-red focus:border-primary-red"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  name="address.city"
                  value={newCustomer.addresses?.[0]?.city || ''}
                  onChange={handleNewCustomerChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-primary-red focus:border-primary-red"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    name="address.state"
                    value={newCustomer.addresses?.[0]?.state || ''}
                    onChange={handleNewCustomerChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-primary-red focus:border-primary-red"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP
                  </label>
                  <input
                    type="text"
                    name="address.zip"
                    value={newCustomer.addresses?.[0]?.zip || ''}
                    onChange={handleNewCustomerChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-primary-red focus:border-primary-red"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Source
            </label>
            <select
              name="source"
              value={newCustomer.source || ''}
              onChange={handleNewCustomerChange}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-primary-red focus:border-primary-red"
            >
              <option value="">Select a source</option>
              <option value="Website">Website</option>
              <option value="Referral">Referral</option>
              <option value="Google Search">Google Search</option>
              <option value="Social Media">Social Media</option>
              <option value="Email Campaign">Email Campaign</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="mt-6">
            <button
              onClick={handleSaveNewCustomer}
              className="px-4 py-2 bg-primary-red text-white rounded hover:bg-red-700"
            >
              Save Customer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerInfoForm;
