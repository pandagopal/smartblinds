import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { Product } from '../../../models/Product';
import analyticsService from '../../../services/analyticsService';

/**
 * Products Manager for the Database Admin Panel
 */
const ProductsManager: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product> | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [categories, setCategories] = useState<Array<{ id: number, name: string }>>([]);

  // Fetch products and categories on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Start fetch time measurement
        const startTime = performance.now();

        // Fetch products
        const productsData = await api.products.getAll();
        setProducts(productsData);

        // Fetch categories for the dropdown
        const categoriesData = await api.categories.getAll();
        setCategories(categoriesData.map(category => ({
          id: category.id,
          name: category.name
        })));

        // End fetch time measurement
        const endTime = performance.now();
        analyticsService.trackDatabasePerformance({
          operation: 'fetchProducts',
          duration: endTime - startTime,
          timestamp: Date.now(),
          metadata: { count: productsData.length }
        });

        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');

        analyticsService.trackDatabaseError({
          operation: 'fetchProducts',
          errorMessage: err instanceof Error ? err.message : 'Unknown error',
          timestamp: Date.now()
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtered products based on search term
  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle product deletion
  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      // In a real application, this would call an API to delete the product
      await fetch(`/api/products/${id}`, { method: 'DELETE' });

      // Remove product from state
      setProducts(products.filter(product => product.id !== id));

      // Clear products cache
      api.cache.clearProductCache();

      alert('Product deleted successfully');
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Failed to delete product. Please try again.');

      analyticsService.trackDatabaseError({
        operation: 'deleteProduct',
        errorMessage: err instanceof Error ? err.message : 'Unknown error',
        timestamp: Date.now(),
        queryParams: { id }
      });
    }
  };

  // Open modal to create a new product
  const openCreateModal = () => {
    setCurrentProduct({
      title: '',
      description: '',
      price: 0,
      inStock: true,
      basePrice: 0,
      rating: 0,
      reviewCount: 0,
      image: '',
      categoryId: categories[0]?.id || 1
    });
    setModalMode('create');
    setShowModal(true);
  };

  // Open modal to edit an existing product
  const openEditModal = (product: Product) => {
    setCurrentProduct({ ...product });
    setModalMode('edit');
    setShowModal(true);
  };

  // Handle product form submission (create or edit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentProduct) return;

    try {
      let updatedProduct;

      if (modalMode === 'create') {
        // Create new product
        updatedProduct = await api.products.createProduct(currentProduct);
        setProducts([...products, updatedProduct as Product]);
      } else {
        // Update existing product
        // In a real application, this would call an API to update the product
        updatedProduct = await fetch(`/api/products/${currentProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentProduct)
        }).then(res => res.json());

        // Update product in state
        setProducts(products.map(p => p.id === currentProduct.id ? updatedProduct : p));
      }

      // Clear products cache
      api.cache.clearProductCache();

      setShowModal(false);
      setCurrentProduct(null);

      alert(`Product ${modalMode === 'create' ? 'created' : 'updated'} successfully`);
    } catch (err) {
      console.error(`Error ${modalMode === 'create' ? 'creating' : 'updating'} product:`, err);
      alert(`Failed to ${modalMode === 'create' ? 'create' : 'update'} product. Please try again.`);

      analyticsService.trackDatabaseError({
        operation: modalMode === 'create' ? 'createProduct' : 'updateProduct',
        errorMessage: err instanceof Error ? err.message : 'Unknown error',
        timestamp: Date.now()
      });
    }
  };

  // Update current product state when form fields change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    setCurrentProduct(prev => {
      if (!prev) return null;

      // Handle different input types appropriately
      if (type === 'number') {
        return { ...prev, [name]: parseFloat(value) };
      } else if (type === 'checkbox') {
        const checked = (e.target as HTMLInputElement).checked;
        return { ...prev, [name]: checked };
      } else {
        return { ...prev, [name]: value };
      }
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p className="font-bold">Error:</p>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Products Manager</h2>
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Search products..."
            className="border border-gray-300 rounded px-3 py-1 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            onClick={openCreateModal}
            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm"
          >
            Add New Product
          </button>
        </div>
      </div>

      {/* Products table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Image
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No products found
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-10 w-10 rounded-md overflow-hidden bg-gray-100">
                      {product.image ? (
                        <img src={product.image} alt={product.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex items-center justify-center h-full w-full bg-gray-200 text-gray-400">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{product.title}</div>
                    <div className="text-xs text-gray-500">ID: {product.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${product.price?.toFixed(2)}</div>
                    <div className="text-xs text-gray-500">Base: ${product.basePrice?.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {categories.find(cat => cat.id === product.categoryId)?.name || 'Unknown'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => openEditModal(product)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Product Modal */}
      {showModal && currentProduct && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        {modalMode === 'create' ? 'Add New Product' : 'Edit Product'}
                      </h3>
                      <div className="mt-4 space-y-4">
                        <div>
                          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                            Title
                          </label>
                          <input
                            type="text"
                            name="title"
                            id="title"
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            value={currentProduct.title || ''}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div>
                          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                            Description
                          </label>
                          <textarea
                            name="description"
                            id="description"
                            rows={3}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            value={currentProduct.description || ''}
                            onChange={handleInputChange}
                          ></textarea>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                              Price
                            </label>
                            <input
                              type="number"
                              name="price"
                              id="price"
                              min="0"
                              step="0.01"
                              required
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              value={currentProduct.price || 0}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div>
                            <label htmlFor="basePrice" className="block text-sm font-medium text-gray-700">
                              Base Price
                            </label>
                            <input
                              type="number"
                              name="basePrice"
                              id="basePrice"
                              min="0"
                              step="0.01"
                              required
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              value={currentProduct.basePrice || 0}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
                              Category
                            </label>
                            <select
                              name="categoryId"
                              id="categoryId"
                              required
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              value={currentProduct.categoryId || ''}
                              onChange={handleInputChange}
                            >
                              {categories.map(category => (
                                <option key={category.id} value={category.id}>
                                  {category.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                              Image URL
                            </label>
                            <input
                              type="url"
                              name="image"
                              id="image"
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              value={currentProduct.image || ''}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            name="inStock"
                            id="inStock"
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            checked={currentProduct.inStock || false}
                            onChange={(e) => setCurrentProduct({
                              ...currentProduct,
                              inStock: e.target.checked
                            })}
                          />
                          <label htmlFor="inStock" className="ml-2 block text-sm text-gray-900">
                            In Stock
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {modalMode === 'create' ? 'Create' : 'Save'}
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => {
                      setShowModal(false);
                      setCurrentProduct(null);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsManager;
