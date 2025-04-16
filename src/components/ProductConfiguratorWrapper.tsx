import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import ProductConfigurator from './ProductConfigurator';
import { SAMPLE_PRODUCTS } from '../models/Product';

// Error fallback component
const ErrorFallback = ({ error, resetErrorBoundary }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-red-50 border border-red-200 rounded-lg">
      <h2 className="text-xl font-semibold text-red-700 mb-4">Something went wrong:</h2>
      <pre className="bg-white p-4 rounded mb-4 overflow-auto max-w-full text-sm text-red-500">
        {error.message}
      </pre>
      <button
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Try again
      </button>
    </div>
  );
};

const ProductConfiguratorWrapper = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);

    // Find the product by ID from our sample products
    try {
      setLoading(true);
      const foundProduct = SAMPLE_PRODUCTS.find(p => p.id === id);

      if (!foundProduct) {
        setError(`Product with ID ${id} not found`);
        setProduct(null);
      } else {
        setProduct(foundProduct);
        setError(null);
      }
    } catch (err) {
      console.error('Error loading product:', err);
      setError('Failed to load product. Please try again.');
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-96 bg-gray-200 rounded"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        {product && <ProductConfigurator product={product} />}
      </ErrorBoundary>
    </div>
  );
};

export default ProductConfiguratorWrapper;
