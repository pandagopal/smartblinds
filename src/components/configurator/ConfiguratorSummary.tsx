import React from 'react';
import { Product } from '../../models/Product';

interface ConfiguratorSummaryProps {
  product: Product;
  width: { whole: number; fraction: string };
  height: { whole: number; fraction: string };
  selectedOptions: Record<string, string>;
  quantity: number;
  calculatedPrice: number;
  onQuantityChange: (quantity: number) => void;
  onAddToCart: () => void;
}

const ConfiguratorSummary: React.FC<ConfiguratorSummaryProps> = ({
  product,
  width,
  height,
  selectedOptions,
  quantity,
  calculatedPrice,
  onQuantityChange,
  onAddToCart
}) => {
  // Calculate delivery estimate (2-3 weeks from today)
  const getDeliveryEstimate = () => {
    const now = new Date();
    const twoWeeks = new Date(now);
    twoWeeks.setDate(now.getDate() + 14);
    const threeWeeks = new Date(now);
    threeWeeks.setDate(now.getDate() + 21);

    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return `${formatDate(twoWeeks)} - ${formatDate(threeWeeks)}`;
  };

  // Format width and height as strings
  const formatDimension = (dimension: { whole: number; fraction: string }) => {
    return `${dimension.whole}${dimension.fraction === '0' ? '"' : ` ${dimension.fraction}"`}`;
  };

  return (
    <div className="border border-gray-200 rounded-lg bg-white shadow-sm sticky top-4">
      <div className="p-5 border-b border-gray-200">
        <h3 className="font-semibold text-xl mb-2">Your Custom {product.title}</h3>
        <div className="text-sm text-gray-500">
          <p>Product ID: {product.id}</p>
          {product.basePrice && (
            <p className="mt-1">Base Price: ${product.basePrice.toFixed(2)}</p>
          )}
        </div>
      </div>

      <div className="p-5">
        <div className="mb-6">
          <div className="flex justify-between text-lg font-semibold mb-1">
            <span>Your Price:</span>
            <span className="text-primary-red">${calculatedPrice.toFixed(2)}</span>
          </div>
          <div className="text-sm text-gray-500">
            <p>Estimated delivery: {getDeliveryEstimate()}</p>
            <p className="mt-1">Price includes free shipping & custom sizing</p>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4 mb-6">
          <h4 className="font-medium mb-3">Your Selections</h4>

          <div className="bg-gray-50 p-3 rounded-md mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium">Dimensions:</span>
              <span>{formatDimension(width)} × {formatDimension(height)}</span>
            </div>
            <p className="text-xs text-gray-500">Custom fit to your window size</p>
          </div>

          <ul className="space-y-3">
            {Object.entries(selectedOptions).map(([key, value]) => (
              <li key={key} className="flex justify-between text-sm">
                <span className="text-gray-600">{key}:</span>
                <span className="font-medium">{value}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Quantity selector */}
        <div className="mb-6">
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
            Quantity
          </label>
          <div className="flex">
            <button
              type="button"
              className="bg-gray-100 text-gray-600 hover:bg-gray-200 p-2 rounded-l-md border border-gray-300"
              onClick={() => quantity > 1 && onQuantityChange(quantity - 1)}
              aria-label="Decrease quantity"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
              </svg>
            </button>
            <input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => onQuantityChange(parseInt(e.target.value) || 1)}
              className="w-16 text-center border-t border-b border-gray-300 py-2 focus:ring-primary-red focus:border-primary-red"
            />
            <button
              type="button"
              className="bg-gray-100 text-gray-600 hover:bg-gray-200 p-2 rounded-r-md border border-gray-300"
              onClick={() => onQuantityChange(quantity + 1)}
              aria-label="Increase quantity"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
        </div>

        {/* Add to cart button */}
        <button
          onClick={onAddToCart}
          className="w-full bg-primary-red hover:bg-red-700 text-white py-3 px-4 rounded font-medium transition-colors flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Add to Cart
        </button>

        {/* Optional features */}
        <div className="mt-4">
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <svg className="w-4 h-4 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Free shipping</span>
          </div>
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <svg className="w-4 h-4 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Risk-free 100% satisfaction guarantee</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Limited lifetime warranty</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfiguratorSummary;
