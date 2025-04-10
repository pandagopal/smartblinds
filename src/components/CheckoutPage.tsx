import React, { useState } from 'react';
import { Cart } from '../models/Cart';
import { getCart } from '../services/cartService';

const CheckoutPage: React.FC = () => {
  const [cart] = useState<Cart>(getCart());

  // Calculate total items
  const totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Your Order ({totalItems} items)</h2>

          {/* Order items */}
          <div className="divide-y divide-gray-200">
            {cart.items.map((item) => (
              <div key={item.id} className="py-3 flex">
                <div className="w-16 h-16 mr-4 flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover rounded"
                  />
                </div>
                <div className="flex-grow">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  {item.width && item.height && (
                    <p className="text-sm text-gray-600">{item.width}″ × {item.height}″</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Payment section placeholder */}
          <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium mb-4">Payment Methods</h3>
            <p className="text-gray-600 mb-4">This is a demo implementation of the checkout page. In a real application, you would be able to:</p>

            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>Enter shipping and billing information</li>
              <li>Select from multiple payment methods including credit cards via Braintree</li>
              <li>Use Klarna for "Buy Now, Pay Later" functionality</li>
              <li>Review your order before completion</li>
            </ul>

            <div className="mt-6">
              <button className="w-full bg-primary-red hover:bg-red-700 text-white py-3 px-4 rounded font-medium transition">
                Complete Purchase
              </button>
            </div>
          </div>
        </div>

        {/* Order summary */}
        <div>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden sticky top-4">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-medium">Order Summary</h2>
            </div>

            <div className="p-4">
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Subtotal</span>
                <span>${cart.subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between py-2">
                <span className="text-gray-600">Shipping</span>
                <span>Free</span>
              </div>

              <div className="flex justify-between py-2">
                <span className="text-gray-600">Tax</span>
                <span>${cart.taxAmount.toFixed(2)}</span>
              </div>

              <div className="flex justify-between py-2 border-t border-gray-200 mt-2 font-bold">
                <span>Total</span>
                <span className="text-primary-red">
                  ${cart.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
