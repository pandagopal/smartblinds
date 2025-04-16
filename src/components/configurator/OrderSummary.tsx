import React from 'react';
import { Product } from '../../models/Product';

interface Dimension {
  whole: number;
  fraction: string;
}

interface OrderSummaryProps {
  product: Product;
  width: Dimension;
  height: Dimension;
  selectedOptions: Record<string, string>;
  calculatedPrice: number;
  loading: boolean;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onAddToCart: () => void;
  errorMessage: string | null;
  mountType: string;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  product,
  width,
  height,
  selectedOptions,
  calculatedPrice,
  loading,
  quantity,
  onQuantityChange,
  onAddToCart,
  errorMessage,
  mountType
}) => {
  // Helper to format dimensions for display
  const formatDimension = (dimension: Dimension): string => {
    return dimension.fraction === '0'
      ? `${dimension.whole}"`
      : `${dimension.whole} ${dimension.fraction}"`;
  };

  // Calculate price per item
  const itemPrice = calculatedPrice;
  const totalPrice = itemPrice * quantity;

  // Check if the product is on sale
  const isOnSale = product.salePrice !== undefined;
  const originalPrice = product.salePrice || product.basePrice || 0;
  const discount = isOnSale
    ? Math.round(((originalPrice - calculatedPrice) / originalPrice) * 100)
    : 0;

  return (
    <div className="border border-gray-200 rounded-lg bg-white shadow-sm sticky top-4">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-xl font-semibold mb-1">Order Summary</h3>
        <h4 className="text-sm text-gray-600 mb-4">{product.title}</h4>

        <div className="mb-6">
          <div className="flex justify-between items-start mb-1">
            <span className="text-lg font-medium">Price</span>
            <div className="text-right">
              {loading ? (
                <div className="inline-block w-20 h-6 bg-gray-200 animate-pulse rounded"></div>
              ) : (
                <>
                  <div className="text-lg font-bold text-primary-red">${itemPrice.toFixed(2)}</div>
                  {isOnSale && (
                    <div className="flex items-center mt-1">
                      <span className="text-sm text-gray-500 line-through mr-1">${originalPrice.toFixed(2)}</span>
                      <span className="text-xs bg-primary-red text-white px-1.5 py-0.5 rounded">Save {discount}%</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Price includes custom sizing and selected options
          </p>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <h4 className="font-medium mb-3">Your Selections</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between">
              <span className="text-gray-600">Mount Type:</span>
              <span className="font-medium">{mountType === 'inside' ? 'Inside Mount' : 'Outside Mount'}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-600">Width:</span>
              <span className="font-medium">{formatDimension(width)}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-600">Height:</span>
              <span className="font-medium">{formatDimension(height)}</span>
            </li>
            {Object.entries(selectedOptions).map(([key, value]) => (
              <li key={key} className="flex justify-between">
                <span className="text-gray-600">{key}:</span>
                <span className="font-medium">{value}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-4">
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
          <div className="flex rounded-md border border-gray-300 shadow-sm">
            <button
              type="button"
              className="border-r border-gray-300 px-3 py-2 text-gray-500 hover:bg-gray-50 focus:outline-none"
              onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <input
              type="number"
              id="quantity"
              min="1"
              value={quantity}
              onChange={(e) => onQuantityChange(parseInt(e.target.value) || 1)}
              className="focus:ring-primary-red focus:border-primary-red block w-full text-center border-0 py-2"
              aria-label="Quantity"
            />
            <button
              type="button"
              className="border-l border-gray-300 px-3 py-2 text-gray-500 hover:bg-gray-50 focus:outline-none"
              onClick={() => onQuantityChange(quantity + 1)}
              aria-label="Increase quantity"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center mt-4 mb-6">
          <span className="font-medium">Total:</span>
          <span className="text-xl font-bold">${totalPrice.toFixed(2)}</span>
        </div>

        {errorMessage && (
          <div className="text-red-500 text-sm mb-4">
            {errorMessage}
          </div>
        )}

        <button
          onClick={onAddToCart}
          className="w-full bg-primary-red hover:bg-red-700 text-white py-3 px-4 rounded font-medium transition"
          disabled={loading}
        >
          Add to Cart
        </button>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Free shipping on orders over $100 • 100% Satisfaction Guarantee
          </p>
        </div>
      </div>

      <div className="bg-green-50 p-4 border-t border-green-100 rounded-b-lg">
        <div className="flex">
          <svg className="w-5 h-5 text-green-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-green-800">
            Perfect Fit Guarantee: If your blinds don't fit perfectly, we'll remake them for free.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
