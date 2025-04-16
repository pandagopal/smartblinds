import React, { useState, useEffect } from 'react';
import { Quote } from '../../../models/Customer';

interface PricingCalculatorProps {
  quote: Quote;
  onDiscountUpdate: (discountPercent: number) => void;
}

const PricingCalculator: React.FC<PricingCalculatorProps> = ({ quote, onDiscountUpdate }) => {
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountPercent, setDiscountPercent] = useState<number>(quote.discountPercent || 0);
  const [discountAmount, setDiscountAmount] = useState<number>(quote.discountAmount || 0);
  const [showTerms, setShowTerms] = useState(false);
  const [terms, setTerms] = useState<string>(
    quote.terms || 'Standard terms and conditions apply. All sales are final once measurements are confirmed.'
  );
  const [paymentTerms, setPaymentTerms] = useState<string>(
    quote.paymentTerms || '50% deposit required to confirm order. Balance due upon installation.'
  );

  // Calculate subtotal without discount
  const subtotal = quote.items.reduce((sum, item) => sum + item.totalPrice, 0);

  // Update discount values when type changes
  useEffect(() => {
    if (discountType === 'percentage') {
      // Convert fixed amount to percentage
      if (subtotal > 0) {
        setDiscountPercent((discountAmount / subtotal) * 100);
      } else {
        setDiscountPercent(0);
      }
    } else {
      // Convert percentage to fixed amount
      setDiscountAmount((discountPercent / 100) * subtotal);
    }
  }, [discountType]);

  // Handle discount percentage change
  const handleDiscountPercentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(Math.max(0, parseFloat(e.target.value) || 0), 100);
    setDiscountPercent(value);

    // Calculate the equivalent fixed amount
    const amount = (value / 100) * subtotal;
    setDiscountAmount(amount);

    // Notify parent component
    onDiscountUpdate(value);
  };

  // Handle discount amount change
  const handleDiscountAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(Math.max(0, parseFloat(e.target.value) || 0), subtotal);
    setDiscountAmount(value);

    // Calculate the equivalent percentage
    const percent = subtotal > 0 ? (value / subtotal) * 100 : 0;
    setDiscountPercent(percent);

    // Notify parent component
    onDiscountUpdate(percent);
  };

  // Calculate final amounts
  const discountedSubtotal = subtotal - discountAmount;
  const taxRate = 0.07; // 7% tax rate (this could be configurable or location-based)
  const taxAmount = discountedSubtotal * taxRate;
  const grandTotal = discountedSubtotal + taxAmount;

  // Handle terms and conditions toggle
  const handleTermsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTerms(e.target.value);
  };

  const handlePaymentTermsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPaymentTerms(e.target.value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Quote Summary</h3>

          {/* Product list */}
          <div className="border-b border-gray-200 pb-4 mb-4">
            <div className="grid grid-cols-12 text-sm font-medium text-gray-700 mb-2">
              <div className="col-span-6">Product</div>
              <div className="col-span-2 text-right">Quantity</div>
              <div className="col-span-2 text-right">Unit Price</div>
              <div className="col-span-2 text-right">Total</div>
            </div>

            {quote.items.map((item) => (
              <div key={item.id} className="grid grid-cols-12 py-2 text-sm border-t border-gray-100">
                <div className="col-span-6">
                  <div className="font-medium">{item.productName}</div>
                  <div className="text-xs text-gray-500">
                    {item.width}" × {item.height}" - {item.color || 'Standard'} - {item.mountType} mount
                  </div>
                  {item.roomName && (
                    <div className="text-xs text-gray-500">Room: {item.roomName}</div>
                  )}
                </div>
                <div className="col-span-2 text-right">{item.quantity}</div>
                <div className="col-span-2 text-right">${item.unitPrice.toFixed(2)}</div>
                <div className="col-span-2 text-right">${item.totalPrice.toFixed(2)}</div>
              </div>
            ))}
          </div>

          {/* Pricing table */}
          <div className="grid grid-cols-12 gap-4">
            {/* Left side - discount controls */}
            <div className="col-span-12 md:col-span-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      checked={discountType === 'percentage'}
                      onChange={() => setDiscountType('percentage')}
                      className="text-primary-red focus:ring-primary-red h-4 w-4"
                    />
                    <span className="ml-2 text-sm text-gray-700">Percentage</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      checked={discountType === 'fixed'}
                      onChange={() => setDiscountType('fixed')}
                      className="text-primary-red focus:ring-primary-red h-4 w-4"
                    />
                    <span className="ml-2 text-sm text-gray-700">Fixed Amount</span>
                  </label>
                </div>
              </div>

              {discountType === 'percentage' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount Percentage</label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={discountPercent || ''}
                      onChange={handleDiscountPercentChange}
                      min="0"
                      max="100"
                      step="0.1"
                      className="flex-grow px-4 py-2 border border-gray-300 rounded focus:ring-primary-red focus:border-primary-red"
                    />
                    <span className="ml-2">%</span>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount Amount</label>
                  <div className="flex items-center">
                    <span className="mr-2">$</span>
                    <input
                      type="number"
                      value={discountAmount || ''}
                      onChange={handleDiscountAmountChange}
                      min="0"
                      max={subtotal}
                      step="0.01"
                      className="flex-grow px-4 py-2 border border-gray-300 rounded focus:ring-primary-red focus:border-primary-red"
                    />
                  </div>
                </div>
              )}

              <div>
                <button
                  onClick={() => setShowTerms(!showTerms)}
                  className="text-primary-red hover:text-red-700 text-sm font-medium"
                >
                  {showTerms ? 'Hide Terms & Conditions' : 'Show Terms & Conditions'}
                </button>

                {showTerms && (
                  <div className="mt-3 space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Terms & Conditions
                      </label>
                      <textarea
                        value={terms}
                        onChange={handleTermsChange}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded text-sm focus:ring-primary-red focus:border-primary-red"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Payment Terms
                      </label>
                      <textarea
                        value={paymentTerms}
                        onChange={handlePaymentTermsChange}
                        rows={2}
                        className="w-full px-4 py-2 border border-gray-300 rounded text-sm focus:ring-primary-red focus:border-primary-red"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right side - totals */}
            <div className="col-span-12 md:col-span-6 space-y-3">
              <div className="flex justify-between items-center pb-2">
                <span className="text-gray-600">Subtotal:</span>
                <span className="text-gray-800 font-medium">${subtotal.toFixed(2)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between items-center pb-2 text-green-700">
                  <span>Discount ({discountPercent.toFixed(1)}%):</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between items-center pb-2">
                <span className="text-gray-600">Tax (7%):</span>
                <span className="text-gray-800">${taxAmount.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="text-lg font-semibold text-gray-800">Total:</span>
                <span className="text-lg font-semibold text-gray-800">${grandTotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="text-sm font-medium text-gray-600">Deposit (50%):</span>
                <span className="text-sm font-medium text-gray-800">${(grandTotal * 0.5).toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Balance Due:</span>
                <span className="text-sm font-medium text-gray-800">${(grandTotal * 0.5).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="md:col-span-1">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Pricing Options</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quick Discounts</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setDiscountType('percentage');
                    setDiscountPercent(5);
                    setDiscountAmount((5 / 100) * subtotal);
                    onDiscountUpdate(5);
                  }}
                  className="px-2 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50"
                >
                  5% Off
                </button>
                <button
                  onClick={() => {
                    setDiscountType('percentage');
                    setDiscountPercent(10);
                    setDiscountAmount((10 / 100) * subtotal);
                    onDiscountUpdate(10);
                  }}
                  className="px-2 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50"
                >
                  10% Off
                </button>
                <button
                  onClick={() => {
                    setDiscountType('percentage');
                    setDiscountPercent(15);
                    setDiscountAmount((15 / 100) * subtotal);
                    onDiscountUpdate(15);
                  }}
                  className="px-2 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50"
                >
                  15% Off
                </button>
                <button
                  onClick={() => {
                    setDiscountType('percentage');
                    setDiscountPercent(20);
                    setDiscountAmount((20 / 100) * subtotal);
                    onDiscountUpdate(20);
                  }}
                  className="px-2 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50"
                >
                  20% Off
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Promotions</label>
              <select
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  if (!isNaN(value)) {
                    setDiscountType('percentage');
                    setDiscountPercent(value);
                    setDiscountAmount((value / 100) * subtotal);
                    onDiscountUpdate(value);
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-primary-red focus:border-primary-red"
              >
                <option value="">Select a promotion</option>
                <option value="10">Spring Sale - 10% Off</option>
                <option value="15">New Customer - 15% Off</option>
                <option value="5">Referral Discount - 5% Off</option>
                <option value="20">Seasonal Clearance - 20% Off</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingCalculator;
