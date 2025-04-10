import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Cart, CartItem } from '../../models/Cart';
import { getCart, removeCartItem, updateCartItemQuantity, getSavedItems, getSavedCarts } from '../../services/cartService';

// Mini cart props interface
interface MiniCartProps {
  onClose?: () => void;
}

// Mini cart that shows in header and sidebar
const MiniCart = ({ onClose }: MiniCartProps) => {
  const [cart, setCart] = useState<Cart>(getCart());
  const [isOpen, setIsOpen] = useState(true);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);
  const [savedItemsCount, setSavedItemsCount] = useState<number>(getSavedItems().length);
  const [savedCartsCount, setSavedCartsCount] = useState<number>(getSavedCarts().length);

  // Update cart when it changes in localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      setCart(getCart());
    };

    // Listen for storage changes (in case cart is updated in another tab)
    window.addEventListener('storage', handleStorageChange);

    // Listen for the custom cart updated event
    window.addEventListener('cartUpdated', handleStorageChange);

    // Clean up
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleStorageChange);
    };
  }, []);

  // Update saved items count
  useEffect(() => {
    const handleSavedItemsChange = () => {
      setSavedItemsCount(getSavedItems().length);
    };

    window.addEventListener('savedItemsUpdated', handleSavedItemsChange);

    return () => {
      window.removeEventListener('savedItemsUpdated', handleSavedItemsChange);
    };
  }, []);

  // Update saved carts count
  useEffect(() => {
    const handleSavedCartsChange = () => {
      setSavedCartsCount(getSavedCarts().length);
    };

    window.addEventListener('savedCartsUpdated', handleSavedCartsChange);

    return () => {
      window.removeEventListener('savedCartsUpdated', handleSavedCartsChange);
    };
  }, []);

  // Calculate total items
  const itemCount = cart.items.reduce((count, item) => count + item.quantity, 0);

  // Handle close
  const handleClose = useCallback(() => {
    setIsOpen(false);
    if (onClose) {
      onClose();
    }
  }, [onClose]);

  // Handle removing item
  const handleRemoveItem = useCallback((itemId: string) => {
    setIsRemoving(itemId);

    // Add a slight delay for visual feedback
    setTimeout(() => {
      const updatedCart = removeCartItem(itemId);
      setCart(updatedCart);
      setIsRemoving(null);
    }, 300);
  }, []);

  // Handle updating quantity
  const handleUpdateQuantity = useCallback((itemId: string, quantity: number) => {
    const updatedCart = updateCartItemQuantity(itemId, quantity);
    setCart(updatedCart);
  }, []);

  // Handle clicking outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const minicart = document.getElementById('minicart');
      const cartButton = document.getElementById('cart-button');

      if (minicart && !minicart.contains(target) &&
          cartButton && !cartButton.contains(target)) {
        handleClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div id="minicart" className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg z-50 border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="font-bold">Your Cart ({itemCount})</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Cart Items */}
      <div className="max-h-96 overflow-y-auto">
        {cart.items.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-sm mb-3">Your cart is empty</p>
            <Link
              to="/"
              className="text-primary-red text-sm hover:underline"
              onClick={handleClose}
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div>
            {cart.items.map((item) => (
              <MiniCartItem
                key={item.id}
                item={item}
                onRemove={handleRemoveItem}
                onUpdateQuantity={handleUpdateQuantity}
                isRemoving={isRemoving === item.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Cart Summary & Action */}
      {cart.items.length > 0 && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-600">Subtotal:</span>
            <span className="font-bold">${cart.subtotal.toFixed(2)}</span>
          </div>

          {cart.shippingAmount > 0 ? (
            <div className="text-xs text-gray-500 mb-3">
              Shipping: ${cart.shippingAmount.toFixed(2)}
            </div>
          ) : (
            <div className="text-xs text-green-600 mb-3">
              Free shipping on orders over $100
            </div>
          )}

          <div className="flex flex-col space-y-2">
            <Link
              to="/cart"
              className="bg-primary-red text-white text-center py-2 px-4 rounded hover:bg-red-700 transition-colors"
              onClick={handleClose}
            >
              View Cart
            </Link>
            <Link
              to="/checkout"
              className="border border-gray-300 text-gray-700 hover:bg-gray-50 text-center py-2 px-4 rounded transition-colors"
              onClick={handleClose}
            >
              Checkout
            </Link>
          </div>
        </div>
      )}

      {/* Saved Items & Saved Carts */}
      {(savedItemsCount > 0 || savedCartsCount > 0) && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600 mb-2">Your saved items:</div>
          <div className="flex flex-col space-y-1">
            {savedItemsCount > 0 && (
              <Link
                to="/cart"
                className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                onClick={handleClose}
              >
                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                {savedItemsCount} item{savedItemsCount !== 1 ? 's' : ''} saved for later
              </Link>
            )}

            {savedCartsCount > 0 && (
              <Link
                to="/cart"
                className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                onClick={handleClose}
              >
                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 4v12l-4-2-4 2V4M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {savedCartsCount} saved cart{savedCartsCount !== 1 ? 's' : ''}
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Item in mini cart
interface MiniCartItemProps {
  item: CartItem;
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  isRemoving: boolean;
}

const MiniCartItem = ({ item, onRemove, onUpdateQuantity, isRemoving }: MiniCartItemProps) => {
  return (
    <div className={`p-3 border-b border-gray-100 flex transition-opacity duration-300 ${isRemoving ? 'opacity-50' : 'opacity-100'}`}>
      {/* Product Image */}
      <div className="w-16 h-16 mr-3 flex-shrink-0">
        <Link
          to={`/product/${item.productId}`}
          className="block h-full"
        >
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover rounded"
          />
        </Link>
      </div>

      {/* Product Info */}
      <div className="flex-grow">
        <Link
          to={`/product/${item.productId}`}
          className="font-medium text-sm hover:text-primary-red"
        >
          {item.title}
        </Link>

        {/* Show dimensions if provided */}
        {item.width && item.height && (
          <div className="text-xs text-gray-500 mt-1">
            {item.width}" × {item.height}"
          </div>
        )}

        {/* Show selected options */}
        {Object.entries(item.options).length > 0 && (
          <div className="text-xs text-gray-500 mt-1">
            {Object.entries(item.options).map(([name, value]) => (
              <div key={name}>{name}: {value}</div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center">
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
              className="text-gray-500 hover:text-gray-700 p-1 disabled:opacity-50"
              disabled={item.quantity <= 1 || isRemoving}
              aria-label="Decrease quantity"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <span className="mx-1 text-sm">{item.quantity}</span>
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              className="text-gray-500 hover:text-gray-700 p-1"
              disabled={isRemoving}
              aria-label="Increase quantity"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>

          <div className="font-bold text-sm">
            ${(item.price * item.quantity).toFixed(2)}
          </div>

          <button
            onClick={() => onRemove(item.id)}
            className="ml-2 text-gray-400 hover:text-primary-red"
            disabled={isRemoving}
            aria-label="Remove item"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MiniCart;
