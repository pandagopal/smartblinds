import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Product, SAMPLE_PRODUCTS } from '../models/Product';
import { addToCart } from '../services/cartService';

const ProductComparisonPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);

  // Initialize from URL products parameter
  useEffect(() => {
    const productIds = searchParams.get('products')?.split(',') || [];
    setSelectedProducts(productIds);

    // Filter products that are not already in comparison
    const productsToCompare = productIds
      .map(id => SAMPLE_PRODUCTS.find(p => p.id === id))
      .filter((p): p is Product => p !== undefined);

    setProducts(productsToCompare);

    // Set available products for the dropdown
    setAvailableProducts(
      SAMPLE_PRODUCTS.filter(p => !productIds.includes(p.id))
    );
  }, [searchParams]);

  // Add product to comparison
  const handleAddProduct = (productId: string) => {
    if (products.length >= 4) {
      alert('You can compare a maximum of 4 products at a time.');
      return;
    }

    const newProduct = SAMPLE_PRODUCTS.find(p => p.id === productId);
    if (!newProduct) return;

    const newProducts = [...products, newProduct];
    setProducts(newProducts);
    setSelectedProducts([...selectedProducts, productId]);

    // Update URL
    navigate({
      pathname: '/compare',
      search: `?products=${newProducts.map(p => p.id).join(',')}`
    });

    // Update available products
    setAvailableProducts(prev => prev.filter(p => p.id !== productId));
  };

  // Remove product from comparison
  const handleRemoveProduct = (productId: string) => {
    const removedProduct = SAMPLE_PRODUCTS.find(p => p.id === productId);
    if (!removedProduct) return;

    const newProducts = products.filter(p => p.id !== productId);
    setProducts(newProducts);
    setSelectedProducts(selectedProducts.filter(id => id !== productId));

    // Update URL
    navigate({
      pathname: '/compare',
      search: newProducts.length > 0 ? `?products=${newProducts.map(p => p.id).join(',')}` : ''
    });

    // Update available products
    setAvailableProducts(prev => [...prev, removedProduct]);
  };

  // Determine which specifications to show
  const determineSpecs = () => {
    const allSpecs = new Set<string>();
    products.forEach(product => {
      product.specs.forEach(spec => {
        allSpecs.add(spec.name);
      });
    });
    return Array.from(allSpecs);
  };

  // Get spec value for a product
  const getSpecValue = (product: Product, specName: string) => {
    const spec = product.specs.find(s => s.name === specName);
    return spec ? spec.value : '-';
  };

  // Determine which options to show
  const determineOptions = () => {
    const allOptions = new Set<string>();
    products.forEach(product => {
      product.options.forEach(option => {
        allOptions.add(option.name);
      });
    });
    return Array.from(allOptions);
  };

  // Get option values for a product
  const getOptionValues = (product: Product, optionName: string) => {
    const option = product.options.find(o => o.name === optionName);
    return option ? option.values.join(', ') : '-';
  };

  // Add product to cart
  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
    alert(`Added ${product.title} to your cart!`);
  };

  const specs = determineSpecs();
  const options = determineOptions();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Product Comparison</h1>
        <p className="text-gray-600 mb-4">
          Compare up to 4 different window treatments side by side to find the perfect fit for your needs.
        </p>

        {/* Add Product Dropdown */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <span className="text-gray-700">Add product to compare:</span>
          {availableProducts.length > 0 ? (
            <select
              className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-primary-red focus:border-primary-red"
              value=""
              onChange={(e) => handleAddProduct(e.target.value)}
            >
              <option value="" disabled>Select a product</option>
              {availableProducts.map(product => (
                <option key={product.id} value={product.id}>{product.title}</option>
              ))}
            </select>
          ) : (
            <span className="text-gray-500 italic">All products are being compared</span>
          )}
        </div>
      </div>

      {products.length === 0 ? (
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <p className="text-xl text-gray-600 mb-4">No products selected for comparison.</p>
          <Link to="/" className="px-4 py-2 bg-primary-red text-white rounded-md hover:bg-red-700 transition">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            {/* Product Images and Names */}
            <thead>
              <tr className="bg-gray-50">
                <th className="p-4 text-left border-b border-gray-200 min-w-[200px]">Product</th>
                {products.map(product => (
                  <th key={product.id} className="p-4 text-center border-b border-gray-200 min-w-[250px]">
                    <div className="relative">
                      <button
                        onClick={() => handleRemoveProduct(product.id)}
                        className="absolute -top-2 -right-2 bg-gray-200 hover:bg-gray-300 rounded-full w-6 h-6 flex items-center justify-center"
                        aria-label="Remove from comparison"
                      >
                        <span className="sr-only">Remove</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                      </button>
                      <Link to={`/product/${product.id}`}>
                        <div className="h-48 mb-3 overflow-hidden">
                          <img
                            src={product.image}
                            alt={product.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <h3 className="font-medium text-lg text-primary-red hover:underline">{product.title}</h3>
                      </Link>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {/* Price Row */}
              <tr>
                <td className="p-4 font-semibold border-b border-gray-200 bg-gray-50">Price</td>
                {products.map(product => (
                  <td key={`${product.id}-price`} className="p-4 text-center border-b border-gray-200">
                    <div className="font-bold text-lg text-primary-red">
                      ${(product.basePrice || 0).toFixed(2)}
                    </div>
                    {product.salePrice && (
                      <div className="text-sm text-gray-500 line-through">
                        ${product.salePrice.toFixed(2)}
                      </div>
                    )}
                  </td>
                ))}
              </tr>

              {/* Rating Row */}
              <tr>
                <td className="p-4 font-semibold border-b border-gray-200 bg-gray-50">Rating</td>
                {products.map(product => (
                  <td key={`${product.id}-rating`} className="p-4 text-center border-b border-gray-200">
                    <div className="flex justify-center">
                      <div className="flex items-center">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map(star => (
                            <svg
                              key={star}
                              className={`w-5 h-5 ${star <= Math.round(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="ml-1 text-sm text-gray-600">({product.reviewCount})</span>
                      </div>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Description Row */}
              <tr>
                <td className="p-4 font-semibold border-b border-gray-200 bg-gray-50">Description</td>
                {products.map(product => (
                  <td key={`${product.id}-desc`} className="p-4 text-sm text-center border-b border-gray-200">
                    {product.description}
                  </td>
                ))}
              </tr>

              {/* Specifications Section */}
              <tr>
                <td colSpan={products.length + 1} className="p-4 font-bold text-lg border-b border-gray-200 bg-gray-100">
                  Specifications
                </td>
              </tr>

              {specs.map(specName => (
                <tr key={`spec-${specName}`}>
                  <td className="p-4 font-semibold border-b border-gray-200 bg-gray-50">{specName}</td>
                  {products.map(product => (
                    <td key={`${product.id}-${specName}`} className="p-4 text-center border-b border-gray-200">
                      {getSpecValue(product, specName)}
                    </td>
                  ))}
                </tr>
              ))}

              {/* Available Options Section */}
              <tr>
                <td colSpan={products.length + 1} className="p-4 font-bold text-lg border-b border-gray-200 bg-gray-100">
                  Available Options
                </td>
              </tr>

              {options.map(optionName => (
                <tr key={`option-${optionName}`}>
                  <td className="p-4 font-semibold border-b border-gray-200 bg-gray-50">{optionName}</td>
                  {products.map(product => (
                    <td key={`${product.id}-${optionName}`} className="p-4 text-center border-b border-gray-200">
                      {getOptionValues(product, optionName)}
                    </td>
                  ))}
                </tr>
              ))}

              {/* Features Section */}
              <tr>
                <td colSpan={products.length + 1} className="p-4 font-bold text-lg border-b border-gray-200 bg-gray-100">
                  Features
                </td>
              </tr>

              <tr>
                <td className="p-4 font-semibold border-b border-gray-200 bg-gray-50">Key Features</td>
                {products.map(product => (
                  <td key={`${product.id}-features`} className="p-4 border-b border-gray-200">
                    <ul className="list-disc pl-5 text-sm">
                      {product.features.map((feature, index) => (
                        <li key={index} className="mb-1">{feature}</li>
                      ))}
                    </ul>
                  </td>
                ))}
              </tr>

              {/* Actions Row */}
              <tr>
                <td className="p-4 font-semibold border-b border-gray-200 bg-gray-50">Actions</td>
                {products.map(product => (
                  <td key={`${product.id}-actions`} className="p-4 text-center border-b border-gray-200">
                    <div className="flex flex-col space-y-2">
                      <Link
                        to={`/product/configure/${product.id}`}
                        className="w-full bg-primary-red hover:bg-red-700 text-white py-2 px-4 rounded transition"
                      >
                        Configure
                      </Link>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="w-full border border-primary-red text-primary-red hover:bg-red-50 py-2 px-4 rounded transition"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {products.length > 0 && (
        <div className="mt-8 text-center">
          <Link to="/" className="text-primary-red hover:underline">
            Browse more products to compare
          </Link>
        </div>
      )}
    </div>
  );
};

export default ProductComparisonPage;
