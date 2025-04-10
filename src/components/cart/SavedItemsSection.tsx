import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CartItem } from '../../models/Cart';
import { getSavedItems, moveToCart, removeSavedItem } from '../../services/cartService';

interface SavedItemsSectionProps {
  onCartUpdated?: () => void;
}

const SavedItemsSection: React.FC<SavedItemsSectionProps> = ({ onCartUpdated }) => {
  const [savedItems, setSavedItems] = useState<CartItem[]>(getSavedItems());
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const handleSavedItemsChange = () => {
      setSavedItems(getSavedItems());
    };

    // Listen for changes to saved items
    window.addEventListener('savedItemsUpdated', handleSavedItemsChange);

    return () => {
      window.removeEventListener('savedItemsUpdated', handleSavedItemsChange);
    };
  }, []);

  const handleMoveToCart = (itemId: string) => {
    setLoading(prev => ({ ...prev, [itemId]: true }));

    setTimeout(() => {
      const { cart } = moveToCart(itemId);
      setSavedItems(getSavedItems());
      setLoading(prev => ({ ...prev, [itemId]: false }));

      if (onCartUpdated) {
        onCartUpdated();
      }
    }, 300);
  };

  const handleRemoveItem = (itemId: string) => {
    setLoading(prev => ({ ...prev, [itemId]: true }));

    setTimeout(() => {
      const updatedItems = removeSavedItem(itemId);
      setSavedItems(updatedItems);
      setLoading(prev => ({ ...prev, [itemId]: false }));
    }, 300);
  };

  if (savedItems.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-medium">Saved for Later ({savedItems.length})</h2>
      </div>

      <div className="divide-y divide-gray-200">
        {savedItems.map((item) => (
          <div
            key={item.id}
            className={`p-4 flex ${loading[item.id] ? 'opacity-50' : 'opacity-100'} transition-opacity`}
          >
            {/* Product Image */}
            <div className="w-16 h-16 mr-4 flex-shrink-0">
              <Link to={`/product/${item.productId}`}>
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover rounded"
                />
              </Link>
            </div>

            {/* Product Info */}
            <div className="flex-grow">
              <div className="flex justify-between">
                <Link
                  to={`/product/${item.productId}`}
                  className="font-medium hover:text-primary-red"
                >
                  {item.title}
                </Link>

                <div className="font-bold">
                  ${item.price.toFixed(2)}
                </div>
              </div>

              {/* Product Details */}
              <div className="text-sm text-gray-600 mt-1">
                {/* Show dimensions if provided */}
                {item.width && item.height && (
                  <div className="mb-1">
                    Dimensions: {item.width}" × {item.height}"
                  </div>
                )}

                {/* Show selected options */}
                {Object.entries(item.options).length > 0 && (
                  <div className="mb-1">
                    {Object.entries(item.options).map(([name, value]) => (
                      <div key={name}>{name}: {value}</div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center mt-2">
                <button
                  onClick={() => handleMoveToCart(item.id)}
                  disabled={loading[item.id]}
                  className="text-primary-red hover:text-primary-red hover:underline text-sm flex items-center mr-4"
                >
                  <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Move to Cart
                </button>

                <button
                  onClick={() => handleRemoveItem(item.id)}
                  disabled={loading[item.id]}
                  className="text-gray-500 hover:text-primary-red text-sm flex items-center"
                >
                  <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SavedItemsSection;
