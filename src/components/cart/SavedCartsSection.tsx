import React, { useState, useEffect } from 'react';
import { SavedCart } from '../../models/Cart';
import {
  getSavedCarts,
  deleteSavedCart,
  loadSavedCart,
  mergeSavedCart
} from '../../services/cartService';

interface SavedCartsSectionProps {
  onCartUpdated?: () => void;
}

const SavedCartsSection: React.FC<SavedCartsSectionProps> = ({ onCartUpdated }) => {
  const [savedCarts, setSavedCarts] = useState<SavedCart[]>(getSavedCarts());
  const [expandedCartId, setExpandedCartId] = useState<string | null>(null);
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const handleSavedCartsChange = () => {
      setSavedCarts(getSavedCarts());
    };

    // Listen for changes to saved carts
    window.addEventListener('savedCartsUpdated', handleSavedCartsChange);

    return () => {
      window.removeEventListener('savedCartsUpdated', handleSavedCartsChange);
    };
  }, []);

  const handleDelete = (cartId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLoading(prev => ({ ...prev, [cartId]: true }));

    setTimeout(() => {
      const updatedCarts = deleteSavedCart(cartId);
      setSavedCarts(updatedCarts);

      if (expandedCartId === cartId) {
        setExpandedCartId(null);
      }

      setLoading(prev => ({ ...prev, [cartId]: false }));
    }, 300);
  };

  const handleLoad = (cartId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLoading(prev => ({ ...prev, [cartId]: true }));

    setTimeout(() => {
      loadSavedCart(cartId);
      setLoading(prev => ({ ...prev, [cartId]: false }));

      if (onCartUpdated) {
        onCartUpdated();
      }
    }, 300);
  };

  const handleMerge = (cartId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLoading(prev => ({ ...prev, [cartId]: true }));

    setTimeout(() => {
      mergeSavedCart(cartId);
      setLoading(prev => ({ ...prev, [cartId]: false }));

      if (onCartUpdated) {
        onCartUpdated();
      }
    }, 300);
  };

  const toggleExpand = (cartId: string) => {
    setExpandedCartId(expandedCartId === cartId ? null : cartId);
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (savedCarts.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-medium">Your Saved Carts ({savedCarts.length})</h2>
      </div>

      <div className="divide-y divide-gray-200">
        {savedCarts.map((savedCart) => (
          <div
            key={savedCart.id}
            className={`transition-opacity ${loading[savedCart.id] ? 'opacity-50' : 'opacity-100'}`}
          >
            <div
              className="p-4 cursor-pointer hover:bg-gray-50"
              onClick={() => toggleExpand(savedCart.id)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{savedCart.name}</h3>
                  <div className="text-sm text-gray-500">
                    Saved on {formatDate(savedCart.createdAt)} • {savedCart.items.length} items
                  </div>
                </div>
                <div className="flex items-center">
                  <svg
                    className={`w-5 h-5 text-gray-400 transform transition-transform ${expandedCartId === savedCart.id ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {expandedCartId === savedCart.id && (
              <div className="bg-gray-50 p-4 border-t border-gray-200">
                {/* Items preview */}
                <div className="mb-4">
                  <div className="text-sm font-medium mb-2">Cart Contents:</div>
                  <div className="max-h-40 overflow-y-auto">
                    {savedCart.items.map((item) => (
                      <div key={item.id} className="flex items-center py-1">
                        <div className="w-8 h-8 mr-2 flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover rounded"
                          />
                        </div>
                        <div className="flex-grow text-sm truncate">
                          <span className="font-medium">{item.quantity} x</span> {item.title}
                        </div>
                        <div className="flex-shrink-0 text-sm font-medium ml-2">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cart notes */}
                {savedCart.notes && (
                  <div className="mb-4">
                    <div className="text-sm font-medium mb-1">Notes:</div>
                    <div className="text-sm text-gray-600 bg-white p-2 rounded border border-gray-200">
                      {savedCart.notes}
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => handleLoad(savedCart.id, e)}
                    disabled={loading[savedCart.id]}
                    className="flex-1 py-2 px-3 bg-primary-red text-white text-sm font-medium rounded hover:bg-red-700 transition-colors"
                  >
                    Replace Current Cart
                  </button>
                  <button
                    onClick={(e) => handleMerge(savedCart.id, e)}
                    disabled={loading[savedCart.id]}
                    className="flex-1 py-2 px-3 border border-gray-300 text-gray-700 text-sm font-medium rounded hover:bg-gray-100 transition-colors"
                  >
                    Merge With Current Cart
                  </button>
                  <button
                    onClick={(e) => handleDelete(savedCart.id, e)}
                    disabled={loading[savedCart.id]}
                    className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                    aria-label="Delete saved cart"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SavedCartsSection;
