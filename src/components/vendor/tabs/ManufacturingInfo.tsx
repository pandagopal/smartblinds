import React, { useState, useEffect } from 'react';
import { authService } from '../../../services/authService';

interface ProductLeadTime {
  id: string;
  name: string;
  leadTimeInDays: number;
  notes: string;
}

interface ManufacturingInfoData {
  defaultLeadTimeInDays: number;
  productLeadTimes: ProductLeadTime[];
  manufacturingCapacity: string;
  qualityControlProcess: string;
}

const ManufacturingInfo: React.FC = () => {
  const [formData, setFormData] = useState<ManufacturingInfoData>({
    defaultLeadTimeInDays: 7,
    productLeadTimes: [],
    manufacturingCapacity: '',
    qualityControlProcess: ''
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // New product lead time form
  const [newProduct, setNewProduct] = useState<Omit<ProductLeadTime, 'id'>>({
    name: '',
    leadTimeInDays: 7,
    notes: ''
  });

  // Load manufacturing data
  useEffect(() => {
    const loadManufacturingData = () => {
      const user = authService.getCurrentUser();

      if (user?.vendorInfo?.manufacturingInfo) {
        setFormData(user.vendorInfo.manufacturingInfo);
      }

      // Fetch product categories for demonstration
      // In a real app, this would come from an API
      const mockProducts = [
        { id: 'prod1', name: 'Faux Wood Blinds' },
        { id: 'prod2', name: 'Roller Shades' },
        { id: 'prod3', name: 'Vertical Blinds' },
        { id: 'prod4', name: 'Honeycomb Shades' },
        { id: 'prod5', name: 'Roman Shades' }
      ];

      // If no product lead times exist, initialize with mock products
      if (user?.vendorInfo?.manufacturingInfo?.productLeadTimes?.length === 0) {
        setFormData(prev => ({
          ...prev,
          productLeadTimes: mockProducts.map(p => ({
            id: p.id,
            name: p.name,
            leadTimeInDays: 7,
            notes: ''
          }))
        }));
      }

      setIsLoading(false);
    };

    loadManufacturingData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLeadTimeChange = (id: string, field: keyof ProductLeadTime, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      productLeadTimes: prev.productLeadTimes.map(product =>
        product.id === id ? { ...product, [field]: value } : product
      )
    }));
  };

  const handleNewProductChange = (field: keyof Omit<ProductLeadTime, 'id'>, value: string | number) => {
    setNewProduct(prev => ({ ...prev, [field]: value }));
  };

  const handleAddProductLeadTime = () => {
    if (!newProduct.name.trim()) {
      setErrorMessage('Product name is required');
      return;
    }

    // Create new product with a unique ID
    const newProductWithId: ProductLeadTime = {
      ...newProduct,
      id: `prod-${Date.now()}`
    };

    // Add to the list
    setFormData(prev => ({
      ...prev,
      productLeadTimes: [...prev.productLeadTimes, newProductWithId]
    }));

    // Reset form
    setNewProduct({
      name: '',
      leadTimeInDays: 7,
      notes: ''
    });

    // Clear error if there was one
    setErrorMessage(null);
  };

  const handleRemoveProductLeadTime = (id: string) => {
    setFormData(prev => ({
      ...prev,
      productLeadTimes: prev.productLeadTimes.filter(product => product.id !== id)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSaving(true);

    try {
      // Validate inputs
      if (formData.defaultLeadTimeInDays < 0) {
        throw new Error('Default lead time cannot be negative');
      }

      for (const product of formData.productLeadTimes) {
        if (product.leadTimeInDays < 0) {
          throw new Error(`Lead time for ${product.name} cannot be negative`);
        }
      }

      // In a real app, this would be an API call to update manufacturing info
      const user = authService.getCurrentUser();

      if (user) {
        const updatedUser = {
          ...user,
          vendorInfo: {
            ...user.vendorInfo,
            manufacturingInfo: formData
          }
        };

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // Update user in localStorage (in a real app, this would be stored in a database)
        localStorage.setItem('user', JSON.stringify(updatedUser));

        setSuccessMessage('Manufacturing information updated successfully');
      } else {
        throw new Error('User not found');
      }
    } catch (error) {
      setErrorMessage((error as Error).message || 'Failed to update manufacturing information');
      console.error('Error updating manufacturing information:', error);
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
      <h2 className="text-xl font-semibold mb-4">Manufacturing Information</h2>

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
        {/* Default Lead Time */}
        <div className="space-y-2">
          <label htmlFor="defaultLeadTimeInDays" className="block text-sm font-medium text-gray-700">
            Default Manufacturing Lead Time (Days)*
          </label>
          <input
            type="number"
            id="defaultLeadTimeInDays"
            name="defaultLeadTimeInDays"
            value={formData.defaultLeadTimeInDays}
            onChange={(e) => setFormData(prev => ({ ...prev, defaultLeadTimeInDays: parseInt(e.target.value) || 0 }))}
            required
            min="0"
            className="w-full md:w-1/4 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-sm text-gray-500">Standard lead time for products without specific lead times.</p>
        </div>

        {/* Manufacturing Capacity */}
        <div className="space-y-2">
          <label htmlFor="manufacturingCapacity" className="block text-sm font-medium text-gray-700">
            Manufacturing Capacity
          </label>
          <textarea
            id="manufacturingCapacity"
            name="manufacturingCapacity"
            value={formData.manufacturingCapacity}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Describe your production capacity (e.g., units per day/week)"
          />
        </div>

        {/* Quality Control Process */}
        <div className="space-y-2">
          <label htmlFor="qualityControlProcess" className="block text-sm font-medium text-gray-700">
            Quality Control Process
          </label>
          <textarea
            id="qualityControlProcess"
            name="qualityControlProcess"
            value={formData.qualityControlProcess}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Describe your quality control process"
          />
        </div>

        {/* Product Lead Times */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Product-Specific Lead Times</h3>

          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lead Time (Days)
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {formData.productLeadTimes.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <input
                      type="number"
                      value={product.leadTimeInDays}
                      onChange={(e) => handleLeadTimeChange(product.id, 'leadTimeInDays', parseInt(e.target.value) || 0)}
                      min="0"
                      className="w-20 px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <input
                      type="text"
                      value={product.notes}
                      onChange={(e) => handleLeadTimeChange(product.id, 'notes', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Optional notes"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      type="button"
                      onClick={() => handleRemoveProductLeadTime(product.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Add New Product Lead Time */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="text-md font-medium mb-3">Add New Product Lead Time</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label htmlFor="newProductName" className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  id="newProductName"
                  value={newProduct.name}
                  onChange={(e) => handleNewProductChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Product Name"
                />
              </div>
              <div>
                <label htmlFor="newProductLeadTime" className="block text-sm font-medium text-gray-700 mb-1">
                  Lead Time (Days)
                </label>
                <input
                  type="number"
                  id="newProductLeadTime"
                  value={newProduct.leadTimeInDays}
                  onChange={(e) => handleNewProductChange('leadTimeInDays', parseInt(e.target.value) || 0)}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="newProductNotes" className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  id="newProductNotes"
                  value={newProduct.notes}
                  onChange={(e) => handleNewProductChange('notes', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Optional notes"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleAddProductLeadTime}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Add Product
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
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
      </form>
    </div>
  );
};

export default ManufacturingInfo;
