import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import BraintreeCheckout, { PaymentResult } from './BraintreeCheckout';
import KlarnaCheckout, { KlarnaPaymentResult } from './KlarnaCheckout';

// Define checkout steps
type CheckoutStep = 'information' | 'shipping' | 'payment' | 'confirmation';

// Form state interfaces
interface CustomerInfo {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
}

interface ShippingInfo {
  address1: string;
  address2: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  shippingMethod: 'standard' | 'express' | 'overnight';
}

interface OrderSummary {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    options: Record<string, string>;
    dimensions?: { width: number; height: number };
  }>;
}

const EnhancedCheckoutPage: React.FC = () => {
  // Navigation hook
  const navigate = useNavigate();

  // State for current checkout step
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('information');
  const [animationDirection, setAnimationDirection] = useState<'forward' | 'backward'>('forward');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'braintree' | 'klarna'>('braintree');

  // State for authentication status
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isGuest, setIsGuest] = useState(true);
  const [showLoginForm, setShowLoginForm] = useState(false);

  // Mock login functionality
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send credentials to an API
    // For demo purpose, we'll just simulate a successful login
    setIsAuthenticated(true);
    setIsGuest(false);
    setShowLoginForm(false);
  };

  // Form data state
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    email: '',
    firstName: '',
    lastName: '',
    phone: ''
  });

  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    address1: '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    shippingMethod: 'standard'
  });

  // Order information (in a real app, this would come from a cart service)
  const [orderSummary, setOrderSummary] = useState<OrderSummary>({
    subtotal: 0,
    shipping: 0,
    tax: 0,
    total: 0,
    items: []
  });

  const [paymentInfo, setPaymentInfo] = useState<{ methodType?: string; lastFour?: string; paymentNonce?: string }>({});

  // Validation errors
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  // Address validation function
  const validateAddress = async () => {
    // Reset validation errors
    setValidationErrors({});
    let isValid = true;
    const errors: { [key: string]: string } = {};

    // Basic validation for required fields
    if (!shippingInfo.address1.trim()) {
      errors.address1 = 'Street address is required';
      isValid = false;
    }

    if (!shippingInfo.city.trim()) {
      errors.city = 'City is required';
      isValid = false;
    }

    if (!shippingInfo.state.trim()) {
      errors.state = 'State is required';
      isValid = false;
    }

    if (!shippingInfo.zipCode.trim()) {
      errors.zipCode = 'ZIP code is required';
      isValid = false;
    } else {
      // ZIP code format validation (US format: 5 digits or 5+4 format)
      const zipRegex = /^\d{5}(-\d{4})?$/;
      if (!zipRegex.test(shippingInfo.zipCode)) {
        errors.zipCode = 'Please enter a valid ZIP code (e.g., 12345 or 12345-6789)';
        isValid = false;
      }
    }

    // In a real app, you would call an address validation API here
    // For demo purposes, we'll just simulate a delay
    if (isValid) {
      return new Promise<boolean>(resolve => {
        setIsAddressValidating(true);
        setTimeout(() => {
          setIsAddressValidating(false);

          // Simulate API validation (you'd replace this with real validation)
          // Let's assume addresses with ZIP code starting with "0" are invalid for demo
          if (shippingInfo.zipCode.startsWith('0')) {
            setValidationErrors({
              zipCode: 'This ZIP code appears to be invalid. Please double-check your address.'
            });
            resolve(false);
          } else {
            setIsAddressValidated(true);
            resolve(true);
          }
        }, 1000);
      });
    } else {
      setValidationErrors(errors);
      return Promise.resolve(false);
    }
  };

  // State to track address validation status
  const [isAddressValidated, setIsAddressValidated] = useState(false);
  const [isAddressValidating, setIsAddressValidating] = useState(false);

  // Saved addresses state - in a real app would come from user account
  const [savedAddresses, setSavedAddresses] = useState<Array<{
    id: string;
    name: string;
    address1: string;
    address2: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isDefault: boolean;
  }>>([]);
  const [showSavedAddresses, setShowSavedAddresses] = useState(false);

  // Function to select a saved address
  const selectSavedAddress = (address: typeof savedAddresses[0]) => {
    setShippingInfo(prev => ({
      ...prev,
      address1: address.address1,
      address2: address.address2 || '',
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
    }));
    setShowSavedAddresses(false);
    // Reset validation when changing address
    setIsAddressValidated(false);
    setValidationErrors({});
  };

  // Load cart data on mount
  useEffect(() => {
    // In a real app, this would fetch cart data from an API
    // For now we'll leave it empty until backend integration
    const fetchCartData = async () => {
      try {
        // const response = await fetch('/api/cart');
        // const data = await response.json();
        // setOrderSummary(data);

        // For demo, set an empty cart with zero values
        setOrderSummary({
          subtotal: 0,
          shipping: 0,
          tax: 0,
          total: 0,
          items: []
        });
      } catch (error) {
        console.error('Error fetching cart data:', error);
      }
    };

    fetchCartData();
  }, []);

  // Reset validation when changing shipping info
  useEffect(() => {
    setIsAddressValidated(false);
  }, [shippingInfo.address1, shippingInfo.city, shippingInfo.state, shippingInfo.zipCode]);

  // Update shipping cost based on selected method
  useEffect(() => {
    let shippingCost = 0;

    switch (shippingInfo.shippingMethod) {
      case 'standard':
        shippingCost = 15.00;
        break;
      case 'express':
        shippingCost = 25.00;
        break;
      case 'overnight':
        shippingCost = 35.00;
        break;
    }

    setOrderSummary(prev => ({
      ...prev,
      shipping: shippingCost,
      total: prev.subtotal + shippingCost + prev.tax
    }));
  }, [shippingInfo.shippingMethod]);

  // Form validation
  const validateCustomerInfo = (): boolean => {
    return (
      !!customerInfo.email &&
      !!customerInfo.firstName &&
      !!customerInfo.lastName &&
      !!customerInfo.phone
    );
  };

  const validateShippingInfo = (): boolean => {
    return (
      !!shippingInfo.address1 &&
      !!shippingInfo.city &&
      !!shippingInfo.state &&
      !!shippingInfo.zipCode
    );
  };

  // Step navigation handlers with validation
  const goToNextStep = async () => {
    if (currentStep === 'information' && validateCustomerInfo()) {
      setAnimationDirection('forward');
      setCurrentStep('shipping');
    } else if (currentStep === 'shipping') {
      // Validate shipping info before proceeding
      if (isAddressValidated || await validateAddress()) {
        setAnimationDirection('forward');
        setCurrentStep('payment');
      }
    }
  };

  const goToPreviousStep = () => {
    if (currentStep === 'shipping') {
      setAnimationDirection('backward');
      setCurrentStep('information');
    } else if (currentStep === 'payment') {
      setAnimationDirection('backward');
      setCurrentStep('shipping');
    }
  };

  // Handle payment completion
  const handlePaymentComplete = (result: PaymentResult | KlarnaPaymentResult) => {
    setPaymentInfo({
      ...paymentInfo,
      methodType: result.paymentMethod,
      lastFour: 'lastFour' in result ? result.lastFour : undefined,
      paymentNonce: 'nonce' in result ? result.nonce : 'token' in result ? result.token : undefined
    });

    // Generate a random order number (in a real app this would come from the backend)
    const orderNumber = `SMB-${Math.floor(100000000 + Math.random() * 900000000)}`;

    // Redirect to order confirmation page
    // In a real app, we would first submit all the order data to a backend
    // and then redirect after successful order creation
    navigate('/order-confirmation', {
      state: {
        orderNumber,
        shippingDetails: {
          ...customerInfo,
          ...shippingInfo
        },
        paymentDetails: {
          paymentMethod: result.paymentMethod,
          lastFour: 'lastFour' in result ? result.lastFour : undefined,
          orderId: 'orderId' in result ? result.orderId : undefined
        },
        orderTotal: orderSummary.total
      }
    });
  };

  // Handle form changes
  const handleCustomerInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleShippingInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Animation variants
  const pageVariants = {
    enter: (direction: string) => ({
      x: direction === 'forward' ? 100 : -100,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: string) => ({
      x: direction === 'forward' ? -100 : 100,
      opacity: 0
    })
  };

  // Render functions for each step
  const renderCustomerInfoStep = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Customer Information</h2>

      {!isAuthenticated && (
        <div className="mb-8">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Checkout Options</h3>
              {showLoginForm && (
                <button
                  type="button"
                  onClick={() => setShowLoginForm(false)}
                  className="text-sm text-primary-red hover:text-red-700"
                >
                  Cancel
                </button>
              )}
            </div>

            {showLoginForm ? (
              <div className="mt-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="login-email"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-red"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      id="login-password"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-red"
                      required
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <button
                      type="submit"
                      className="bg-primary-red text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                    >
                      Login
                    </button>
                    <a href="#" className="text-sm text-primary-red hover:text-red-700">
                      Forgot Password?
                    </a>
                  </div>
                </form>
              </div>
            ) : (
              <div className="mt-4 flex flex-col md:flex-row gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowLoginForm(true);
                    setIsGuest(false);
                  }}
                  className="flex-1 bg-white border border-primary-red text-primary-red px-4 py-2 rounded hover:bg-red-50 transition-colors"
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsGuest(true);
                    setShowLoginForm(false);
                  }}
                  className={`flex-1 px-4 py-2 rounded transition-colors ${
                    isGuest
                      ? 'bg-primary-red text-white hover:bg-red-700'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Continue as Guest
                </button>
              </div>
            )}
          </div>

          {isGuest && !showLoginForm && (
            <div className="flex items-center mb-4">
              <svg className="w-5 h-5 text-primary-red mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-gray-600">
                Checking out as a guest? You can create an account at the end of checkout.
              </p>
            </div>
          )}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={customerInfo.email}
            onChange={handleCustomerInfoChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-red"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={customerInfo.firstName}
              onChange={handleCustomerInfoChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-red"
              required
            />
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={customerInfo.lastName}
              onChange={handleCustomerInfoChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-red"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={customerInfo.phone}
            onChange={handleCustomerInfoChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-red"
            required
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={goToNextStep}
          disabled={!validateCustomerInfo()}
          className={`px-6 py-2 rounded ${
            validateCustomerInfo()
              ? 'bg-primary-red text-white hover:bg-secondary-red'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Continue to Shipping
        </button>
      </div>
    </div>
  );

  const renderShippingStep = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Shipping Information</h2>

      {/* Saved Addresses Section */}
      <div className="mb-4">
        <div
          onClick={() => setShowSavedAddresses(!showSavedAddresses)}
          className="flex justify-between items-center p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50"
        >
          <div className="flex items-center">
            <svg className="w-5 h-5 text-primary-red mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="font-medium">Your Saved Addresses</span>
          </div>
          <svg className={`w-5 h-5 transition-transform ${showSavedAddresses ? 'transform rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {showSavedAddresses && (
          <div className="mt-2 border border-gray-200 rounded-md divide-y">
            {savedAddresses.map(address => (
              <div
                key={address.id}
                onClick={() => selectSavedAddress(address)}
                className="p-3 hover:bg-gray-50 cursor-pointer"
              >
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">{address.name} {address.isDefault && <span className="text-xs text-primary-red ml-1">(Default)</span>}</p>
                    <p className="text-sm text-gray-600">{address.address1}</p>
                    {address.address2 && <p className="text-sm text-gray-600">{address.address2}</p>}
                    <p className="text-sm text-gray-600">{address.city}, {address.state} {address.zipCode}</p>
                  </div>
                  <button
                    type="button"
                    className="text-primary-red hover:text-red-700 text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      selectSavedAddress(address);
                    }}
                  >
                    Use
                  </button>
                </div>
              </div>
            ))}
            <div className="p-3">
              <button
                type="button"
                className="flex items-center text-primary-red hover:text-red-700 text-sm"
                onClick={() => setShowSavedAddresses(false)}
              >
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add a new address
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="address1" className="block text-sm font-medium text-gray-700 mb-1">
            Street Address
          </label>
          <input
            type="text"
            id="address1"
            name="address1"
            value={shippingInfo.address1}
            onChange={handleShippingInfoChange}
            className={`w-full rounded-md border ${validationErrors.address1 ? 'border-red-500' : 'border-gray-300'} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-red`}
            required
          />
          {validationErrors.address1 && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.address1}</p>
          )}
        </div>

        <div>
          <label htmlFor="address2" className="block text-sm font-medium text-gray-700 mb-1">
            Apartment, Suite, etc. (optional)
          </label>
          <input
            type="text"
            id="address2"
            name="address2"
            value={shippingInfo.address2}
            onChange={handleShippingInfoChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-red"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={shippingInfo.city}
              onChange={handleShippingInfoChange}
              className={`w-full rounded-md border ${validationErrors.city ? 'border-red-500' : 'border-gray-300'} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-red`}
              required
            />
            {validationErrors.city && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.city}</p>
            )}
          </div>

          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
              State
            </label>
            <input
              type="text"
              id="state"
              name="state"
              value={shippingInfo.state}
              onChange={handleShippingInfoChange}
              className={`w-full rounded-md border ${validationErrors.state ? 'border-red-500' : 'border-gray-300'} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-red`}
              required
            />
            {validationErrors.state && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.state}</p>
            )}
          </div>

          <div>
            <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
              ZIP Code
            </label>
            <input
              type="text"
              id="zipCode"
              name="zipCode"
              value={shippingInfo.zipCode}
              onChange={handleShippingInfoChange}
              className={`w-full rounded-md border ${validationErrors.zipCode ? 'border-red-500' : 'border-gray-300'} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-red`}
              required
            />
            {validationErrors.zipCode && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.zipCode}</p>
            )}
          </div>
        </div>

        {isAddressValidated && (
          <div className="bg-green-50 p-3 rounded-md border border-green-200">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-green-700 text-sm">Address validated successfully</span>
            </div>
          </div>
        )}

        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
            Country
          </label>
          <select
            id="country"
            name="country"
            value={shippingInfo.country}
            onChange={handleShippingInfoChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-red"
          >
            <option value="US">United States</option>
            <option value="CA">Canada</option>
            <option value="MX">Mexico</option>
          </select>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-800 mb-3">Shipping Method</h3>

          <div className="space-y-3">
            <label className="flex items-start p-3 border rounded-md cursor-pointer hover:border-primary-red transition-colors">
              <input
                type="radio"
                name="shippingMethod"
                value="standard"
                checked={shippingInfo.shippingMethod === 'standard'}
                onChange={() => setShippingInfo(prev => ({ ...prev, shippingMethod: 'standard' }))}
                className="mt-1 text-primary-red focus:ring-primary-red"
              />
              <div className="ml-3">
                <div className="font-medium">Standard Shipping - $15.00</div>
                <div className="text-sm text-gray-500">Delivery in 5-7 business days</div>
              </div>
            </label>

            <label className="flex items-start p-3 border rounded-md cursor-pointer hover:border-primary-red transition-colors">
              <input
                type="radio"
                name="shippingMethod"
                value="express"
                checked={shippingInfo.shippingMethod === 'express'}
                onChange={() => setShippingInfo(prev => ({ ...prev, shippingMethod: 'express' }))}
                className="mt-1 text-primary-red focus:ring-primary-red"
              />
              <div className="ml-3">
                <div className="font-medium">Express Shipping - $25.00</div>
                <div className="text-sm text-gray-500">Delivery in 2-3 business days</div>
              </div>
            </label>

            <label className="flex items-start p-3 border rounded-md cursor-pointer hover:border-primary-red transition-colors">
              <input
                type="radio"
                name="shippingMethod"
                value="overnight"
                checked={shippingInfo.shippingMethod === 'overnight'}
                onChange={() => setShippingInfo(prev => ({ ...prev, shippingMethod: 'overnight' }))}
                className="mt-1 text-primary-red focus:ring-primary-red"
              />
              <div className="ml-3">
                <div className="font-medium">Overnight Shipping - $35.00</div>
                <div className="text-sm text-gray-500">Next business day delivery</div>
              </div>
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={goToPreviousStep}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
        >
          Back
        </button>

        <button
          onClick={goToNextStep}
          disabled={!validateShippingInfo() || isAddressValidating}
          className={`px-6 py-2 rounded flex items-center ${
            validateShippingInfo() && !isAddressValidating
              ? 'bg-primary-red text-white hover:bg-secondary-red'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isAddressValidating ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Validating Address...
            </>
          ) : (
            'Continue to Payment'
          )}
        </button>
      </div>
    </div>
  );

  const renderPaymentStep = () => (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-6">Payment Method</h2>

      <div className="mb-6">
        <div className="flex border-b border-gray-200">
          <button
            className={`py-3 px-5 ${
              selectedPaymentMethod === 'braintree'
                ? 'border-b-2 border-primary-red text-primary-red'
                : 'text-gray-500'
            } font-medium`}
            onClick={() => setSelectedPaymentMethod('braintree')}
          >
            Credit Card / PayPal
          </button>
          <button
            className={`py-3 px-5 ${
              selectedPaymentMethod === 'klarna'
                ? 'border-b-2 border-primary-red text-primary-red'
                : 'text-gray-500'
            } font-medium`}
            onClick={() => setSelectedPaymentMethod('klarna')}
          >
            Klarna (Buy Now, Pay Later)
          </button>
        </div>
      </div>

      <div className="mt-4">
        {selectedPaymentMethod === 'braintree' ? (
          <BraintreeCheckout
            amount={orderSummary.total}
            onPaymentSuccess={handlePaymentComplete}
            onPaymentError={(err) => console.error('Payment error:', err)}
          />
        ) : (
          <KlarnaCheckout
            amount={orderSummary.total}
            onPaymentSuccess={handlePaymentComplete}
            onPaymentError={(err) => console.error('Payment error:', err)}
          />
        )}
      </div>

      <div className="flex justify-between mt-6">
        <button
          onClick={goToPreviousStep}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
        >
          Back
        </button>
      </div>
    </div>
  );

  const renderConfirmationStep = () => (
    <div className="text-center space-y-6">
      <div className="flex justify-center mb-6">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center"
        >
          <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Confirmed!</h2>
        <p className="text-lg text-gray-600 mb-1">Thank you for your purchase</p>
        <p className="text-gray-500 mb-6">Order #{paymentInfo?.paymentNonce}</p>

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6 text-left">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Date:</span>
            <span>{new Date().toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Email:</span>
            <span>{customerInfo.email}</span>
          </div>
          {/* Payment Method */}
          <div className="mb-4">
            <h3 className="font-medium text-sm text-gray-700 mb-1">Payment Method</h3>
            <p className="text-gray-800">
              {paymentInfo?.methodType || 'Card'}
              {paymentInfo?.lastFour && ` ending in ${paymentInfo.lastFour}`}
            </p>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 font-bold">Total:</span>
            <span className="font-bold">${orderSummary.total.toFixed(2)}</span>
          </div>
        </div>

        <p className="text-gray-600 mb-6">
          A confirmation email has been sent to {customerInfo.email}.
        </p>

        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 justify-center">
          <Link
            to="/"
            className="px-6 py-2 bg-primary-red text-white rounded hover:bg-secondary-red transition-colors"
          >
            Return to Home
          </Link>

          <button
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
          >
            Track Order
          </button>
        </div>
      </motion.div>
    </div>
  );

  // Render the order summary sidebar
  const renderOrderSummary = () => (
    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 h-fit">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Order Summary</h3>

      <div className="space-y-4 mb-6">
        {orderSummary.items.map((item, index) => (
          <div key={index} className="flex space-x-3">
            <div className="w-16 h-16 bg-gray-200 rounded flex-shrink-0"></div>
            <div className="flex-1">
              <div className="font-medium">{item.name}</div>
              <div className="text-sm text-gray-500">
                {item.dimensions && `${item.dimensions.width}"W × ${item.dimensions.height}"H`}
              </div>
              <div className="text-sm text-gray-500">
                {item.options['Color']} • {item.options['Slat Size']}
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-sm">${item.price.toFixed(2)}</span>
                <span className="text-sm">Qty: {item.quantity}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-200 pt-4 space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span>${orderSummary.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Shipping</span>
          <span>${orderSummary.shipping.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Tax</span>
          <span>${orderSummary.tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold border-t border-gray-200 pt-2 mt-2">
          <span>Total</span>
          <span className="text-primary-red">${orderSummary.total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );

  // Render the stepper
  const renderStepper = () => {
    const steps: { id: CheckoutStep; label: string }[] = [
      { id: 'information', label: 'Information' },
      { id: 'shipping', label: 'Shipping' },
      { id: 'payment', label: 'Payment' },
      { id: 'confirmation', label: 'Confirmation' }
    ];

    return (
      <div className="mb-8">
        <div className="flex justify-between items-center">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              {/* Step indicator */}
              <div className="flex flex-col items-center relative">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep === step.id
                      ? 'bg-primary-red text-white'
                      : steps.indexOf(steps.find(s => s.id === currentStep)!) > index
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {steps.indexOf(steps.find(s => s.id === currentStep)!) > index ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <span className={`mt-1 text-xs ${
                  currentStep === step.id ? 'text-primary-red font-medium' : 'text-gray-500'
                }`}>
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-2 h-0.5 bg-gray-200 relative">
                  <div
                    className="absolute top-0 left-0 h-full bg-primary-red transition-all duration-300"
                    style={{
                      width: steps.indexOf(steps.find(s => s.id === currentStep)!) > index
                        ? '100%'
                        : steps.indexOf(steps.find(s => s.id === currentStep)!) === index
                          ? '50%'
                          : '0%'
                    }}
                  ></div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-8 text-center">Checkout</h1>

      {/* Stepper */}
      {renderStepper()}

      <div className="flex flex-col md:flex-row gap-8">
        {/* Main content */}
        <div className="flex-1">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <AnimatePresence mode="wait" custom={animationDirection}>
              <motion.div
                key={currentStep}
                custom={animationDirection}
                variants={pageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'tween', duration: 0.3 }}
              >
                {currentStep === 'information' && renderCustomerInfoStep()}
                {currentStep === 'shipping' && renderShippingStep()}
                {currentStep === 'payment' && renderPaymentStep()}
                {currentStep === 'confirmation' && renderConfirmationStep()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Order summary */}
        {currentStep !== 'confirmation' && (
          <div className="md:w-1/3">
            {renderOrderSummary()}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedCheckoutPage;
