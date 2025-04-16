import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Customer,
  SAMPLE_CUSTOMERS,
  customerService,
  CustomerInteraction,
  WindowMeasurement
} from '../../models/Customer';

enum CustomerTabView {
  DETAILS = 'details',
  INTERACTIONS = 'interactions',
  MEASUREMENTS = 'measurements',
  QUOTES = 'quotes',
  APPOINTMENTS = 'appointments'
}

const CustomerManagement: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [isAddingInteraction, setIsAddingInteraction] = useState(false);
  const [activeTab, setActiveTab] = useState<CustomerTabView>(CustomerTabView.DETAILS);
  const [newInteraction, setNewInteraction] = useState<Partial<CustomerInteraction>>({
    type: 'call',
    date: new Date(),
    notes: '',
    employeeId: 'sr123', // This would be current user ID in production
    employeeName: 'Sarah Parker' // This would be current user name in production
  });

  // Load customers data
  useEffect(() => {
    // This would be an API call in production
    setCustomers(SAMPLE_CUSTOMERS);

    // If an ID is provided in the URL, select that customer
    if (id) {
      const customer = SAMPLE_CUSTOMERS.find(c => c.id === id);
      if (customer) {
        setSelectedCustomer(customer);
      }
    }
  }, [id]);

  // Filter customers when search query changes
  useEffect(() => {
    if (searchQuery) {
      setFilteredCustomers(customerService.searchCustomers(searchQuery));
    } else {
      setFilteredCustomers(customers);
    }
  }, [searchQuery, customers]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsAddingCustomer(false);
    setIsAddingInteraction(false);
  };

  // Save a new customer interaction
  const handleSaveInteraction = () => {
    if (!selectedCustomer || !newInteraction.notes) return;

    const interaction: CustomerInteraction = {
      id: `interaction-${Date.now()}`,
      type: newInteraction.type as CustomerInteraction['type'],
      date: newInteraction.date || new Date(),
      notes: newInteraction.notes || '',
      employeeId: newInteraction.employeeId || '',
      employeeName: newInteraction.employeeName || '',
      result: newInteraction.result,
      followUpDate: newInteraction.followUpDate
    };

    // Add the interaction to the customer
    const updatedCustomer = {
      ...selectedCustomer,
      interactions: [...(selectedCustomer.interactions || []), interaction],
      lastContactDate: new Date()
    };

    // Update customer in the list
    const updatedCustomers = customers.map(c =>
      c.id === updatedCustomer.id ? updatedCustomer : c
    );

    setCustomers(updatedCustomers);
    setSelectedCustomer(updatedCustomer);
    setIsAddingInteraction(false);
    // Reset form
    setNewInteraction({
      type: 'call',
      date: new Date(),
      notes: '',
      employeeId: 'sr123',
      employeeName: 'Sarah Parker'
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Left sidebar - Customer list */}
      <div className="md:col-span-1">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-800">Customers</h2>
            <button
              onClick={() => {
                setIsAddingCustomer(true);
                setSelectedCustomer(null);
              }}
              className="px-3 py-1 bg-primary-red text-white text-sm rounded hover:bg-red-700"
            >
              New Customer
            </button>
          </div>

          <div className="mb-4">
            <input
              type="text"
              placeholder="Search customers..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-primary-red focus:border-primary-red"
            />
          </div>

          <div className="space-y-2 max-h-[calc(100vh-240px)] overflow-y-auto">
            {filteredCustomers.map(customer => (
              <div
                key={customer.id}
                className={`p-3 border rounded cursor-pointer ${
                  selectedCustomer?.id === customer.id
                    ? 'border-primary-red bg-red-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => handleSelectCustomer(customer)}
              >
                <div className="font-medium">{customer.firstName} {customer.lastName}</div>
                <div className="text-sm text-gray-500">{customer.email}</div>
                <div className="text-sm text-gray-500">{customer.phone}</div>
                <div className="flex items-center mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    customer.status === 'active' ? 'bg-green-100 text-green-800' :
                    customer.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {customer.status}
                  </span>
                  {customer.isProspect && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full ml-2">
                      Prospect
                    </span>
                  )}
                </div>
              </div>
            ))}

            {filteredCustomers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No customers found. Try a different search or add a new customer.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right panel - Customer details */}
      <div className="md:col-span-2">
        {isAddingCustomer ? (
          <CustomerForm
            onCancel={() => setIsAddingCustomer(false)}
            onSave={(newCustomer) => {
              const customerWithId = {
                ...newCustomer,
                id: `customer-${Date.now()}`,
                createdAt: new Date(),
                updatedAt: new Date()
              };
              setCustomers([...customers, customerWithId]);
              setSelectedCustomer(customerWithId);
              setIsAddingCustomer(false);
            }}
          />
        ) : selectedCustomer ? (
          <div className="bg-white rounded-lg shadow-sm">
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab(CustomerTabView.DETAILS)}
                  className={`px-4 py-3 text-sm font-medium ${
                    activeTab === CustomerTabView.DETAILS
                      ? 'border-b-2 border-primary-red text-primary-red'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Details
                </button>
                <button
                  onClick={() => setActiveTab(CustomerTabView.INTERACTIONS)}
                  className={`px-4 py-3 text-sm font-medium ${
                    activeTab === CustomerTabView.INTERACTIONS
                      ? 'border-b-2 border-primary-red text-primary-red'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Interactions
                </button>
                <button
                  onClick={() => setActiveTab(CustomerTabView.MEASUREMENTS)}
                  className={`px-4 py-3 text-sm font-medium ${
                    activeTab === CustomerTabView.MEASUREMENTS
                      ? 'border-b-2 border-primary-red text-primary-red'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Measurements
                </button>
                <button
                  onClick={() => setActiveTab(CustomerTabView.QUOTES)}
                  className={`px-4 py-3 text-sm font-medium ${
                    activeTab === CustomerTabView.QUOTES
                      ? 'border-b-2 border-primary-red text-primary-red'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Quotes
                </button>
                <button
                  onClick={() => setActiveTab(CustomerTabView.APPOINTMENTS)}
                  className={`px-4 py-3 text-sm font-medium ${
                    activeTab === CustomerTabView.APPOINTMENTS
                      ? 'border-b-2 border-primary-red text-primary-red'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Appointments
                </button>
              </nav>
            </div>

            {/* Tab content */}
            <div className="p-6">
              {activeTab === CustomerTabView.DETAILS && (
                <CustomerDetails
                  customer={selectedCustomer}
                  onEdit={(updatedCustomer) => {
                    const updatedCustomers = customers.map(c =>
                      c.id === updatedCustomer.id ? { ...updatedCustomer, updatedAt: new Date() } : c
                    );
                    setCustomers(updatedCustomers);
                    setSelectedCustomer({ ...updatedCustomer, updatedAt: new Date() });
                  }}
                />
              )}

              {activeTab === CustomerTabView.INTERACTIONS && (
                <CustomerInteractions
                  customer={selectedCustomer}
                  isAddingInteraction={isAddingInteraction}
                  newInteraction={newInteraction}
                  onNewInteractionChange={(updatedInteraction) => setNewInteraction(updatedInteraction)}
                  onAddInteraction={() => setIsAddingInteraction(true)}
                  onCancelInteraction={() => setIsAddingInteraction(false)}
                  onSaveInteraction={handleSaveInteraction}
                />
              )}

              {activeTab === CustomerTabView.MEASUREMENTS && (
                <CustomerMeasurements customer={selectedCustomer} />
              )}

              {activeTab === CustomerTabView.QUOTES && (
                <CustomerQuotes customerId={selectedCustomer.id} />
              )}

              {activeTab === CustomerTabView.APPOINTMENTS && (
                <CustomerAppointments customerId={selectedCustomer.id} />
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <h3 className="text-lg font-medium text-gray-700 mb-2">No Customer Selected</h3>
            <p className="text-gray-500 mb-4">Select a customer from the list or add a new one.</p>
            <button
              onClick={() => setIsAddingCustomer(true)}
              className="px-4 py-2 bg-primary-red text-white rounded hover:bg-red-700"
            >
              Add New Customer
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// For brevity, we'll just define these as placeholders for now and implement them in separate files
const CustomerForm: React.FC<{
  onCancel: () => void;
  onSave: (customer: Partial<Customer>) => void;
  customer?: Customer;
}> = ({ onCancel, onSave, customer }) => (
  <div className="bg-white rounded-lg shadow-sm p-6">
    <h3 className="text-lg font-medium text-gray-800 mb-4">
      {customer ? 'Edit Customer' : 'Add New Customer'}
    </h3>

    <div className="text-center py-8">
      <p>Customer form placeholder - will be implemented separately</p>
      <div className="mt-4 flex justify-end space-x-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={() => onSave({
            firstName: 'New',
            lastName: 'Customer',
            email: 'new@example.com',
            phone: '(555) 123-4567',
            addresses: [{
              street: '123 Main St',
              city: 'Anytown',
              state: 'CA',
              zip: '90210',
              country: 'US',
              type: 'installation'
            }],
            isProspect: true,
            status: 'lead'
          })}
          className="px-4 py-2 bg-primary-red text-white rounded hover:bg-red-700"
        >
          Save
        </button>
      </div>
    </div>
  </div>
);

const CustomerDetails: React.FC<{
  customer: Customer;
  onEdit: (customer: Customer) => void;
}> = ({ customer }) => (
  <div>
    <div className="flex justify-between mb-6">
      <h3 className="text-xl font-semibold text-gray-800">
        {customer.firstName} {customer.lastName}
      </h3>
      <button
        className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50"
      >
        Edit Details
      </button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-gray-500">Contact Information</h4>
          <div className="mt-1">
            <div>{customer.email}</div>
            <div>{customer.phone}</div>
            {customer.altPhone && <div>{customer.altPhone}</div>}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-500">Status</h4>
          <div className="mt-1 flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              customer.status === 'active' ? 'bg-green-100 text-green-800' :
              customer.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {customer.status}
            </span>
            {customer.isProspect && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Prospect
              </span>
            )}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-500">Customer Since</h4>
          <div className="mt-1">
            {customer.createdAt.toLocaleDateString()}
          </div>
        </div>

        {customer.source && (
          <div>
            <h4 className="text-sm font-medium text-gray-500">Source</h4>
            <div className="mt-1">
              {customer.source}
            </div>
          </div>
        )}

        {customer.preferredContactMethod && (
          <div>
            <h4 className="text-sm font-medium text-gray-500">Contact Preferences</h4>
            <div className="mt-1">
              <div>Method: {customer.preferredContactMethod}</div>
              {customer.preferredContactTime && (
                <div>Time: {customer.preferredContactTime}</div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-gray-500">Addresses</h4>
          <div className="mt-1 space-y-3">
            {customer.addresses.map((address, index) => (
              <div key={index} className="border border-gray-200 rounded p-3">
                <div className="font-medium text-xs uppercase text-gray-500 mb-1">
                  {address.type} {address.isDefault && '(Default)'}
                </div>
                <div>{address.street}</div>
                <div>{address.city}, {address.state} {address.zip}</div>
                <div>{address.country}</div>
              </div>
            ))}
          </div>
        </div>

        {customer.notes && (
          <div>
            <h4 className="text-sm font-medium text-gray-500">Notes</h4>
            <div className="mt-1 p-3 border border-gray-200 rounded bg-gray-50">
              {customer.notes}
            </div>
          </div>
        )}

        {customer.tags && customer.tags.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-500">Tags</h4>
            <div className="mt-1 flex flex-wrap gap-1">
              {customer.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);

const CustomerInteractions: React.FC<{
  customer: Customer;
  isAddingInteraction: boolean;
  newInteraction: Partial<CustomerInteraction>;
  onNewInteractionChange: (interaction: Partial<CustomerInteraction>) => void;
  onAddInteraction: () => void;
  onCancelInteraction: () => void;
  onSaveInteraction: () => void;
}> = ({
  customer,
  isAddingInteraction,
  newInteraction,
  onNewInteractionChange,
  onAddInteraction,
  onCancelInteraction,
  onSaveInteraction
}) => (
  <div>
    <div className="flex justify-between mb-6">
      <h3 className="text-lg font-medium text-gray-800">Interaction History</h3>
      <button
        onClick={onAddInteraction}
        className="px-3 py-1 bg-primary-red text-white text-sm rounded hover:bg-red-700"
      >
        Add Interaction
      </button>
    </div>

    {isAddingInteraction ? (
      <div className="mb-6 border border-gray-200 rounded-lg p-4">
        <h4 className="text-md font-medium text-gray-800 mb-4">New Interaction</h4>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={newInteraction.type}
                onChange={(e) => onNewInteractionChange({ ...newInteraction, type: e.target.value as CustomerInteraction['type'] })}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-primary-red focus:border-primary-red"
              >
                <option value="call">Phone Call</option>
                <option value="email">Email</option>
                <option value="visit">In-Person Visit</option>
                <option value="quote">Quote Sent</option>
                <option value="order">Order Placed</option>
                <option value="installation">Installation</option>
                <option value="service">Service</option>
                <option value="followup">Follow-up</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={newInteraction.date ? new Date(newInteraction.date).toISOString().split('T')[0] : ''}
                onChange={(e) => onNewInteractionChange({ ...newInteraction, date: new Date(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-primary-red focus:border-primary-red"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={newInteraction.notes}
              onChange={(e) => onNewInteractionChange({ ...newInteraction, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-primary-red focus:border-primary-red"
              placeholder="Enter details about the interaction..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Result
            </label>
            <input
              type="text"
              value={newInteraction.result || ''}
              onChange={(e) => onNewInteractionChange({ ...newInteraction, result: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-primary-red focus:border-primary-red"
              placeholder="What was the outcome of this interaction?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Follow-up Date
            </label>
            <input
              type="date"
              value={newInteraction.followUpDate ? new Date(newInteraction.followUpDate).toISOString().split('T')[0] : ''}
              onChange={(e) => onNewInteractionChange({ ...newInteraction, followUpDate: e.target.value ? new Date(e.target.value) : undefined })}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-primary-red focus:border-primary-red"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancelInteraction}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={onSaveInteraction}
              disabled={!newInteraction.notes}
              className="px-4 py-2 bg-primary-red text-white rounded hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Save Interaction
            </button>
          </div>
        </div>
      </div>
    ) : null}

    {customer.interactions && customer.interactions.length > 0 ? (
      <div className="space-y-4">
        {[...customer.interactions]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .map((interaction) => (
            <div key={interaction.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between mb-2">
                <div className="flex items-center">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    interaction.type === 'call' ? 'bg-blue-100 text-blue-800' :
                    interaction.type === 'email' ? 'bg-indigo-100 text-indigo-800' :
                    interaction.type === 'visit' ? 'bg-green-100 text-green-800' :
                    interaction.type === 'quote' ? 'bg-yellow-100 text-yellow-800' :
                    interaction.type === 'order' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {interaction.type}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">
                    by {interaction.employeeName}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(interaction.date).toLocaleDateString()}
                </div>
              </div>

              <p className="text-gray-700 mb-2">{interaction.notes}</p>

              {interaction.result && (
                <div className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Result:</span> {interaction.result}
                </div>
              )}

              {interaction.followUpDate && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Follow-up:</span> {new Date(interaction.followUpDate).toLocaleDateString()}
                </div>
              )}
            </div>
          ))
        }
      </div>
    ) : (
      <div className="text-center py-8 text-gray-500">
        No interaction history available for this customer.
      </div>
    )}
  </div>
);

// These components will be implemented separately
const CustomerMeasurements: React.FC<{ customer: Customer }> = ({ customer }) => (
  <div>
    <div className="flex justify-between mb-6">
      <h3 className="text-lg font-medium text-gray-800">Window Measurements</h3>
      <button className="px-3 py-1 bg-primary-red text-white text-sm rounded hover:bg-red-700">
        Add Measurement
      </button>
    </div>

    {customer.measurements && customer.measurements.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {customer.measurements.map((measurement: WindowMeasurement) => (
          <div key={measurement.id} className="border border-gray-200 rounded p-4">
            <div className="font-medium mb-2">{measurement.name}</div>
            <div className="text-sm text-gray-600">Room: {measurement.room}</div>
            <div className="text-sm text-gray-600">
              Dimensions: {measurement.width}" × {measurement.height}"
            </div>
            <div className="text-sm text-gray-600">
              Mount: {measurement.mountType}
            </div>
            {measurement.notes && (
              <div className="text-sm text-gray-600 mt-2">
                Notes: {measurement.notes}
              </div>
            )}
          </div>
        ))}
      </div>
    ) : (
      <div className="text-center py-8 text-gray-500">
        No measurements available for this customer.
      </div>
    )}
  </div>
);

const CustomerQuotes: React.FC<{ customerId: string }> = ({ customerId }) => (
  <div>
    <div className="flex justify-between mb-6">
      <h3 className="text-lg font-medium text-gray-800">Quotes</h3>
      <button className="px-3 py-1 bg-primary-red text-white text-sm rounded hover:bg-red-700">
        Create New Quote
      </button>
    </div>

    <div className="text-center py-8 text-gray-500">
      This section will display quotes for the customer.
    </div>
  </div>
);

const CustomerAppointments: React.FC<{ customerId: string }> = ({ customerId }) => (
  <div>
    <div className="flex justify-between mb-6">
      <h3 className="text-lg font-medium text-gray-800">Appointments</h3>
      <button className="px-3 py-1 bg-primary-red text-white text-sm rounded hover:bg-red-700">
        Schedule Appointment
      </button>
    </div>

    <div className="text-center py-8 text-gray-500">
      This section will display appointments for the customer.
    </div>
  </div>
);

export default CustomerManagement;
