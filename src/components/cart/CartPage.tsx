import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cart, CartItem } from '../../models/Cart';
import {
  getCart,
  removeCartItem,
  updateCartItemQuantity,
  applyCoupon,
  moveToSavedItems
} from '../../services/cartService';
import SavedItemsSection from './SavedItemsSection';
import SavedCartsSection from './SavedCartsSection';
import SaveCartForm from './SaveCartForm';

const CartPage: React.FC = () => {
  const [cart, setCart] = useState<Cart>(getCart());
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [itemAction, setItemAction] = useState<Record<string, boolean>>({});
  const [showSaveCartForm, setShowSaveCartForm] = useState(false);

  // Update cart when it changes in localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      setCart(getCart());
    };

    // Listen for storage changes
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cartUpdated', handleStorageChange);

    // Clean up
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleStorageChange);
    };
  }, []);

  // Handle removing item
  const handleRemoveItem = (itemId: string) => {
    setItemAction(prev => ({ ...prev, [itemId]: true }));

    setTimeout(() => {
      const updatedCart = removeCartItem(itemId);
      setCart(updatedCart);
      setItemAction(prev => ({ ...prev, [itemId]: false }));
    }, 300);
  };

  // Handle updating quantity
  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    const updatedCart = updateCartItemQuantity(itemId, quantity);
    setCart(updatedCart);
  };

  // Handle save item for later
  const handleSaveForLater = (itemId: string) => {
    setItemAction(prev => ({ ...prev, [itemId]: true }));

    setTimeout(() => {
      const { cart: updatedCart } = moveToSavedItems(itemId);
      setCart(updatedCart);
      setItemAction(prev => ({ ...prev, [itemId]: false }));
    }, 300);
  };

  // Handle applying promo code
  const handleApplyPromoCode = (e: React.FormEvent) => {
    e.preventDefault();

    // Reset status messages
    setPromoError('');
    setPromoSuccess('');

    // Simple validation
    if (!promoCode.trim()) {
      setPromoError('Please enter a promo code');
      return;
    }

    setLoading(true);

    // Simulate API delay
    setTimeout(() => {
      // Apply the coupon using the service
      const result = applyCoupon(promoCode.trim());

      if (result.success) {
        setPromoSuccess(result.message);
        setCart(result.cart);
        setPromoCode(''); // Clear the input on success
      } else {
        setPromoError(result.message);
      }

      setLoading(false);
    }, 600);
  };

  // Calculate total items in cart
  const totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);

  // Available promo codes to show to the user
  const samplePromoCodes = [
    { code: 'SAVE10', description: '10% off your entire order' },
    { code: 'SPRING20', description: '20% off your entire order' },
    { code: 'WELCOME15', description: '15% off for new customers' },
  ];

  // Handle cart update from saved carts
  const handleCartUpdated = () => {
    setCart(getCart());
  };

  // Handle save cart form submit success
  const handleSaveCartSuccess = () => {
    setShowSaveCartForm(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      {cart.items.length === 0 && !showSaveCartForm ? (
        <div className="bg-white p-8 rounded-lg shadow-sm text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-medium mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Looks like you haven't added any products to your cart yet.</p>
          <Link to="/" className="bg-primary-red text-white px-6 py-3 rounded-md font-medium hover:bg-red-700 transition-colors">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Cart items and actions */}
          <div className="lg:col-span-2">
            {/* Saved Cart Form */}
            {showSaveCartForm && (
              <div className="mb-6">
                <SaveCartForm
                  onSuccess={handleSaveCartSuccess}
                  onCancel={() => setShowSaveCartForm(false)}
                />
              </div>
            )}

            {/* Cart Items */}
            {cart.items.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="font-medium">Cart Items ({totalItems})</h2>
                </div>

                <div className="divide-y divide-gray-200">
                  {cart.items.map((item) => (
                    <CartItemRow
                      key={item.id}
                      item={item}
                      onRemove={handleRemoveItem}
                      onUpdateQuantity={handleUpdateQuantity}
                      onSaveForLater={handleSaveForLater}
                      isLoading={!!itemAction[item.id]}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Saved for Later Items */}
            <SavedItemsSection onCartUpdated={handleCartUpdated} />

            {/* Saved Carts */}
            <SavedCartsSection onCartUpdated={handleCartUpdated} />

            {/* Continue Shopping */}
            <div className="flex justify-between items-center mb-8">
              <Link to="/" className="text-primary-red hover:underline flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Continue Shopping
              </Link>

              <div className="flex space-x-2">
                {cart.items.length > 0 && (
                  <button
                    onClick={() => setShowSaveCartForm(true)}
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Save Cart for Later
                  </button>
                )}

                <button
                  onClick={() => setCart(getCart())}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Refresh Cart
                </button>
              </div>
            </div>
          </div>

          {/* Right column - Order Summary */}
          {cart.items.length > 0 && (
            <div>
              <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="font-medium">Order Summary</h2>
                </div>

                <div className="p-4">
                  {/* Subtotal */}
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${cart.subtotal.toFixed(2)}</span>
                  </div>

                  {/* Shipping */}
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      {cart.shippingAmount > 0 ? `$${cart.shippingAmount.toFixed(2)}` : 'Free'}
                    </span>
                  </div>

                  {/* Tax */}
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">${cart.taxAmount.toFixed(2)}</span>
                  </div>

                  {/* Total */}
                  <div className="flex justify-between py-3 border-t border-gray-200 mt-2">
                    <span className="font-bold">Total</span>
                    <span className="font-bold">${cart.total.toFixed(2)}</span>
                  </div>

                  {/* Promo Code Section */}
                  <div className="mt-4 mb-4">
                    <div className="mb-2">
                      <span className="text-sm font-medium">Have a promo code?</span>
                    </div>
                    <form onSubmit={handleApplyPromoCode} className="flex">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder="Enter code"
                        className="flex-grow p-2 border border-gray-300 rounded-l text-sm focus:ring-blue-500 focus:border-blue-500"
                        disabled={loading}
                      />
                      <button
                        type="submit"
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-r px-4 py-2 text-sm font-medium transition-colors"
                        disabled={loading}
                      >
                        Apply
                      </button>
                    </form>

                    {/* Promo code messages */}
                    {promoError && (
                      <div className="text-red-600 text-xs mt-1">{promoError}</div>
                    )}
                    {promoSuccess && (
                      <div className="text-green-600 text-xs mt-1">{promoSuccess}</div>
                    )}

                    {/* Sample promo codes */}
                    <div className="mt-2">
                      <div className="text-xs text-gray-500 mb-1">Try these codes:</div>
                      <div className="flex flex-wrap gap-1">
                        {samplePromoCodes.map((promo) => (
                          <button
                            key={promo.code}
                            onClick={() => setPromoCode(promo.code)}
                            className="text-xs bg-gray-100 hover:bg-gray-200 rounded px-2 py-1 transition-colors"
                            title={promo.description}
                          >
                            {promo.code}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <Link
                    to="/checkout"
                    className="block w-full bg-primary-red text-white text-center py-3 rounded-md font-medium hover:bg-red-700 transition-colors mt-4"
                    aria-label="Proceed to checkout"
                  >
                    Proceed to Checkout
                  </Link>

                  <p className="text-center text-sm text-gray-500 mt-2">
                    Secure checkout powered by Braintree Payment Gateway
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Cart Item Row Component
interface CartItemRowProps {
  item: CartItem;
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onSaveForLater: (id: string) => void;
  isLoading?: boolean;
}

const CartItemRow: React.FC<CartItemRowProps> = ({
  item,
  onRemove,
  onUpdateQuantity,
  onSaveForLater,
  isLoading = false
}) => {
  return (
    <div className={`p-4 flex ${isLoading ? 'opacity-50' : 'opacity-100'} transition-opacity`}>
      {/* Product Image */}
      <div className="w-20 h-20 mr-4 flex-shrink-0">
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-full object-cover rounded"
        />
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
            ${(item.price * item.quantity).toFixed(2)}
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

        {/* Quantity Controls */}
        <div className="flex items-center mt-2">
          <div className="mr-4">
            <label className="text-sm text-gray-600 mr-2">Qty:</label>
            <div className="inline-flex items-center border border-gray-300 rounded-md">
              <button
                onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                className="px-2 py-1 border-r border-gray-300 text-gray-600 hover:bg-gray-100"
                disabled={item.quantity <= 1 || isLoading}
                aria-label="Decrease quantity"
              >
                -
              </button>
              <span className="px-3">{item.quantity}</span>
              <button
                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                className="px-2 py-1 border-l border-gray-300 text-gray-600 hover:bg-gray-100"
                disabled={isLoading}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>

          <button
            onClick={() => onSaveForLater(item.id)}
            className="text-blue-600 hover:text-blue-800 text-sm flex items-center mr-4"
            disabled={isLoading}
          >
            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            Save for Later
          </button>

          <button
            onClick={() => onRemove(item.id)}
            className="text-gray-500 hover:text-primary-red text-sm flex items-center"
            disabled={isLoading}
            aria-label="Remove item"
          >
            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
