import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { authService, UserRole } from '../../services/authService';
import axios from 'axios';

// Interface definitions
interface ProductType {
  type_id: number;
  name: string;
  slug: string;
}

interface ProductImage {
  image_id?: number;
  image_url: string;
  alt_text?: string;
  image_type?: string;
  is_primary?: boolean;
  display_order?: number;
}

interface ProductDimension {
  min_width: number;
  max_width: number;
  min_height: number;
  max_height: number;
  width_increment?: number;
  height_increment?: number;
}

interface OptionValue {
  value_id?: number;
  value_name: string;
  price_adjustment?: number;
  image_url?: string;
  is_default?: boolean;
  is_active?: boolean;
  display_order?: number;
}

interface ProductOption {
  option_id?: number;
  option_name: string;
  option_type: string;
  is_required?: boolean;
  values: OptionValue[];
}

interface PriceGridItem {
  width: number;
  height: number;
  price: number;
}

// Product interface for form state
interface ProductFormData {
  name: string;
  type_id: number;
  series_name: string;
  material_type: string;
  short_description: string;
  full_description: string;
  features: string[];
  benefits: string[];
  is_active: boolean;
  base_price: number | '';
  images: ProductImage[];
  dimensions?: ProductDimension;
  options?: ProductOption[];
  price_grid?: PriceGridItem[];
}

// Define product types as constants for reuse
const productTypes = [
  { id: 'blinds', name: 'Blinds' },
  { id: 'shades', name: 'Shades' },
  { id: 'drapes', name: 'Drapes' },
  { id: 'shutters', name: 'Shutters' }
];

// Define material types as constants for reuse
const materialTypes = [
  { id: 'fabric', name: 'Fabric' },
  { id: 'wood', name: 'Wood' },
  { id: 'faux-wood', name: 'Faux Wood' },
  { id: 'aluminum', name: 'Aluminum' },
  { id: 'vinyl', name: 'Vinyl' },
  { id: 'bamboo', name: 'Bamboo' },
  { id: 'composite', name: 'Composite' },
  { id: 'pvc', name: 'PVC' },
  { id: 'solar', name: 'Solar' }
];

// Empty product state for new products
const emptyProductForm: ProductFormData = {
  name: '',
  type_id: 0,
  series_name: '',
  material_type: 'fabric',
  short_description: '',
  full_description: '',
  features: [''],
  benefits: [''],
  is_active: true,
  base_price: '',
  images: []
};

const ProductForm: React.FC = () => {
  const { id } = useParams<{id: string}>();
  const navigate = useNavigate();
  const isEditMode = id !== undefined && id !== 'new';

  // Form state
  const [product, setProduct] = useState<ProductFormData>(emptyProductForm);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isVendor, setIsVendor] = useState<boolean>(false);
  const [newFeature, setNewFeature] = useState<string>('');
  const [newBenefit, setNewBenefit] = useState<string>('');
  const [newImages, setNewImages] = useState<FileList | null>(null);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check vendor status and load product data on component mount
  useEffect(() => {
    const checkVendorAndLoadData = async () => {
      const user = authService.getCurrentUser();

      // Check if user is a vendor
      if (!user || user.role !== UserRole.VENDOR) {
        setIsVendor(false);
        setIsLoading(false);
        return;
      }

      setIsVendor(true);

      // Load product types
      await loadProductTypes();

      // If in edit mode, load the product data
      if (isEditMode) {
        await loadProductData(id);
      } else {
        setIsLoading(false);
      }
    };

    checkVendorAndLoadData();
  }, [id, isEditMode]);

  // Load product types
  const loadProductTypes = async () => {
    try {
      const response = await axios.get('/api/vendor/product-types', {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`
        }
      });

      setProductTypes(response.data.data);

      // If this is a new product, set the default type_id to the first type
      if (!isEditMode && response.data.data.length > 0) {
        setProduct(prev => ({
          ...prev,
          type_id: response.data.data[0].type_id
        }));
      }
    } catch (error) {
      console.error('Error loading product types:', error);
      setErrorMessage('Failed to load product types');
    }
  };

  // Load product data when in edit mode
  const loadProductData = async (productId: string) => {
    try {
      setIsLoading(true);

      const response = await axios.get(`/api/vendor/products/${productId}`, {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`
        }
      });

      const productData = response.data.data;

      // Update form state
      setProduct({
        name: productData.name,
        type_id: productData.type_id,
        series_name: productData.series_name || '',
        material_type: productData.material_type || 'fabric',
        short_description: productData.short_description || '',
        full_description: productData.full_description || '',
        features: productData.features || [''],
        benefits: productData.benefits || [''],
        is_active: productData.is_active,
        base_price: productData.base_price || '',
        images: productData.images || [],
        dimensions: productData.dimensions,
        options: productData.options,
        price_grid: productData.price_grid
      });

      // Set preview images
      if (productData.images && productData.images.length > 0) {
        setPreviewImages(productData.images.map((image: ProductImage) => image.image_url));
      }

      setIsLoading(false);
    } catch (error) {
      setErrorMessage('Failed to load product data');
      console.error('Error loading product data:', error);
      setIsLoading(false);
    }
  };

  // Generate a mock product for testing (will be replaced with API call)
  const generateMockProduct = (productId: string): ProductFormData => {
    const index = parseInt(productId.replace('prod-', '')) || 1;
    const productType = productTypes[index % productTypes.length] || { name: 'Blinds', type_id: 1, slug: 'blinds' };
    const materialType = materialTypes[index % materialTypes.length];

    return {
      name: `${materialType.name} ${productType?.name || 'Product'} ${index}`,
      type_id: productType?.type_id || 1,
      series_name: `Premium Series ${Math.ceil(index / 3)}`,
      material_type: materialType.id,
      short_description: `Brief summary of the ${materialType.name.toLowerCase()} ${productType?.name.toLowerCase() || 'product'}.`,
      full_description: `High-quality custom ${materialType.name.toLowerCase()} ${productType?.name.toLowerCase() || 'product'} for any home. Energy efficient and stylish.`,
      features: [
        'Custom fit for any window size',
        'Easy installation',
        'Energy efficient',
        `Premium ${materialType.name.toLowerCase()} material`
      ],
      benefits: [
        'Increased home value',
        'Energy savings',
        'UV protection',
        'Enhanced privacy'
      ],
      is_active: index % 5 !== 0, // Make some products inactive
      base_price: 99.99,
      images: [
        {
          image_url: `https://source.unsplash.com/random/800x600?${productType?.name.toLowerCase() || 'blinds'},${index}`,
          alt_text: `${materialType.name} ${productType?.name || 'Product'} image`,
          is_primary: true
        },
        {
          image_url: `https://source.unsplash.com/random/800x600?${materialType.name.toLowerCase()},${index}`,
          alt_text: `${materialType.name} texture`,
          is_primary: false
        }
      ]
    };
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    // Handle checkbox inputs
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setProduct(prev => ({ ...prev, [name]: checked }));
      return;
    }

    // Handle numeric inputs
    if (type === 'number') {
      setProduct(prev => ({ ...prev, [name]: value === '' ? '' : parseFloat(value) }));
      return;
    }

    // Handle regular inputs
    setProduct(prev => ({ ...prev, [name]: value }));
  };

  // Add new feature to list
  const handleAddFeature = () => {
    if (!newFeature.trim()) return;

    setProduct(prev => ({
      ...prev,
      features: [...prev.features, newFeature.trim()]
    }));

    setNewFeature('');
  };

  // Remove feature from list
  const handleRemoveFeature = (index: number) => {
    setProduct(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  // Add new benefit to list
  const handleAddBenefit = () => {
    if (!newBenefit.trim()) return;

    setProduct(prev => ({
      ...prev,
      benefits: [...prev.benefits, newBenefit.trim()]
    }));

    setNewBenefit('');
  };

  // Remove benefit from list
  const handleRemoveBenefit = (index: number) => {
    setProduct(prev => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index)
    }));
  };

  // Handle image uploads
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setNewImages(files);

    // Generate preview URLs for the new images
    const newPreviewUrls: string[] = [];
    const newProductImages: ProductImage[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Please upload image files only');
        continue;
      }

      // Validate file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('Image file size should be less than 5MB');
        continue;
      }

      // In a real world scenario, we would upload the file to a server/cloud storage
      // For now, create object URLs for preview
      const previewUrl = URL.createObjectURL(file);
      newPreviewUrls.push(previewUrl);

      // Create a new product image object
      newProductImages.push({
        image_url: previewUrl,
        alt_text: product.name || file.name,
        image_type: 'product',
        is_primary: product.images.length === 0 && i === 0, // First image is primary if no other images
        display_order: product.images.length + i
      });
    }

    // Update preview images
    setPreviewImages(prev => [...prev, ...newPreviewUrls]);

    // Update product images
    setProduct(prev => ({
      ...prev,
      images: [...prev.images, ...newProductImages]
    }));
  };

  // Remove uploaded image
  const handleRemoveImage = (index: number) => {
    // Remove from preview
    setPreviewImages(prev => prev.filter((_, i) => i !== index));

    // Remove from product
    setProduct(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSaving(true);

    try {
      // Validate form data
      if (!product.name.trim()) {
        throw new Error('Product name is required');
      }

      if (!product.type_id) {
        throw new Error('Product type is required');
      }

      if (!product.series_name.trim()) {
        throw new Error('Product series/collection name is required');
      }

      if (!product.full_description.trim()) {
        throw new Error('Product description is required');
      }

      if (product.features.length === 0 || !product.features.some(f => f.trim())) {
        throw new Error('At least one product feature is required');
      }

      if (product.benefits.length === 0 || !product.benefits.some(b => b.trim())) {
        throw new Error('At least one product benefit is required');
      }

      // Prepare data for API call
      const formData = {
        ...product,
        features: product.features.filter(f => f.trim()),
        benefits: product.benefits.filter(b => b.trim())
      };

      let response;

      if (isEditMode) {
        // Update existing product
        response = await axios.put(
          `/api/vendor/products/${id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${authService.getToken()}`,
              'Content-Type': 'application/json'
            }
          }
        );
      } else {
        // Create new product
        response = await axios.post(
          '/api/vendor/products',
          formData,
          {
            headers: {
              Authorization: `Bearer ${authService.getToken()}`,
              'Content-Type': 'application/json'
            }
          }
        );
      }

      // Show success message
      setSuccessMessage(`Product ${isEditMode ? 'updated' : 'created'} successfully`);

      // Redirect after a brief delay
      setTimeout(() => {
        navigate('/vendor/products');
      }, 1500);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setErrorMessage(error.response.data.error || `Failed to ${isEditMode ? 'update' : 'create'} product`);
      } else {
        setErrorMessage((error as Error).message || `Failed to ${isEditMode ? 'update' : 'create'} product`);
      }
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} product:`, error);
    } finally {
      setIsSaving(false);
    }
  };

  // Redirect if not a vendor
  if (!isLoading && !isVendor) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          You must be a vendor to access this page
        </div>
        <Link
          to="/account"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          Go to Account
        </Link>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">{isEditMode ? 'Edit Product' : 'Add New Product'}</h1>
        <Link
          to="/vendor/products"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          &larr; Back to Products
        </Link>
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Product Name */}
          <div className="md:col-span-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Product Name*
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={product.name}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Premium Faux Wood Blinds"
              required
            />
          </div>

          {/* Product Type */}
          <div>
            <label htmlFor="type_id" className="block text-sm font-medium text-gray-700 mb-1">
              Product Type*
            </label>
            <select
              id="type_id"
              name="type_id"
              value={product.type_id}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {productTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          {/* Material Type */}
          <div>
            <label htmlFor="material_type" className="block text-sm font-medium text-gray-700 mb-1">
              Material Type*
            </label>
            <select
              id="material_type"
              name="material_type"
              value={product.material_type}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {materialTypes.map((material) => (
                <option key={material.id} value={material.id}>
                  {material.name}
                </option>
              ))}
            </select>
          </div>

          {/* Product Series */}
          <div className="md:col-span-2">
            <label htmlFor="series_name" className="block text-sm font-medium text-gray-700 mb-1">
              Product Series / Collection Name*
            </label>
            <input
              type="text"
              id="series_name"
              name="series_name"
              value={product.series_name}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Premium Series, Luxury Collection"
              required
            />
          </div>

          {/* Short Description */}
          <div className="md:col-span-2">
            <label htmlFor="short_description" className="block text-sm font-medium text-gray-700 mb-1">
              Short Description*
            </label>
            <textarea
              id="short_description"
              name="short_description"
              value={product.short_description}
              onChange={handleInputChange}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Briefly describe your product"
              required
            />
          </div>

          {/* Product Description */}
          <div className="md:col-span-2">
            <label htmlFor="full_description" className="block text-sm font-medium text-gray-700 mb-1">
              Product Description*
            </label>
            <textarea
              id="full_description"
              name="full_description"
              value={product.full_description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe your product in detail"
              required
            />
          </div>

          {/* Base Price */}
          <div>
            <label htmlFor="base_price" className="block text-sm font-medium text-gray-700 mb-1">
              Base Price*
            </label>
            <input
              type="number"
              id="base_price"
              name="base_price"
              value={product.base_price}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 99.99"
              required
            />
          </div>

          {/* Product Features */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Features*
            </label>
            <div className="mb-4">
              <div className="flex">
                <input
                  type="text"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Energy efficient design"
                />
                <button
                  type="button"
                  onClick={handleAddFeature}
                  className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
            </div>

            {product.features.length > 0 ? (
              <ul className="bg-gray-50 p-4 rounded-md">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex justify-between items-center mb-2 last:mb-0">
                    <span>{feature}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">No features added yet</p>
            )}
          </div>

          {/* Product Benefits */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Benefits*
            </label>
            <div className="mb-4">
              <div className="flex">
                <input
                  type="text"
                  value={newBenefit}
                  onChange={(e) => setNewBenefit(e.target.value)}
                  className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Lower energy costs"
                />
                <button
                  type="button"
                  onClick={handleAddBenefit}
                  className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
            </div>

            {product.benefits.length > 0 ? (
              <ul className="bg-gray-50 p-4 rounded-md">
                {product.benefits.map((benefit, index) => (
                  <li key={index} className="flex justify-between items-center mb-2 last:mb-0">
                    <span>{benefit}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveBenefit(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">No benefits added yet</p>
            )}
          </div>

          {/* Product Images */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Images
            </label>
            <div className="mb-4">
              <div className="flex items-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  id="images"
                  name="images"
                  onChange={handleImageUpload}
                  multiple
                  accept="image/*"
                  className="sr-only"
                />
                <label
                  htmlFor="images"
                  className="cursor-pointer bg-white px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Upload Images
                </label>
                <span className="ml-3 text-sm text-gray-500">
                  JPG, PNG or GIF, up to 5MB each
                </span>
              </div>
            </div>

            {previewImages.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {previewImages.map((imageUrl, index) => (
                  <div key={index} className="relative">
                    <img
                      src={imageUrl}
                      alt={`Product image ${index + 1}`}
                      className="h-32 w-full object-cover rounded-md border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center text-xs shadow-md"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No images uploaded yet</p>
            )}
          </div>

          {/* Is Active */}
          <div className="md:col-span-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={product.is_active}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                Product is active and available for purchase
              </label>
            </div>
          </div>
        </div>

        {/* Form Buttons */}
        <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
          <Link
            to="/vendor/products"
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </Link>
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
                {isEditMode ? 'Updating...' : 'Creating...'}
              </span>
            ) : (
              isEditMode ? 'Update Product' : 'Create Product'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
