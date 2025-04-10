import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface OrderConfirmationPageProps {
  orderNumber?: string;
  shippingDetails?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    zipCode: string;
    shippingMethod: string;
  };
  paymentDetails?: {
    paymentMethod: string;
    lastFour?: string;
    orderId?: string;
  };
  orderTotal?: number;
}

const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = (props) => {
  // Get location state from navigation
  const location = useLocation();
  const stateData = location.state;

  // Use the data from location state if available, otherwise use props
  const orderNumber = stateData?.orderNumber || props.orderNumber || 'SMB-123456789';
  const shippingDetails = stateData?.shippingDetails || props.shippingDetails || {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "(555) 123-4567",
    address1: "123 Main St",
    city: "Springfield",
    state: "IL",
    zipCode: "62704",
    shippingMethod: "standard"
  };
  const paymentDetails = stateData?.paymentDetails || props.paymentDetails || {
    paymentMethod: "card",
    lastFour: "4242"
  };
  const orderTotal = stateData?.orderTotal || props.orderTotal || 286.22;

  // Calculate estimated delivery date (7-10 business days from now)
  const getEstimatedDeliveryDate = () => {
    const today = new Date();
    const deliveryDate = new Date(today);

    // Add 7-10 business days (excluding weekends)
    const daysToAdd = shippingDetails.shippingMethod === 'expedited' ? 3 : 8;
    let businessDaysAdded = 0;

    while (businessDaysAdded < daysToAdd) {
      deliveryDate.setDate(deliveryDate.getDate() + 1);
      // Skip weekends (0 = Sunday, 6 = Saturday)
      if (deliveryDate.getDay() !== 0 && deliveryDate.getDay() !== 6) {
        businessDaysAdded++;
      }
    }

    return deliveryDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format payment method for display
  const getPaymentMethodDisplay = () => {
    switch (paymentDetails.paymentMethod) {
      case 'card':
        return `Credit Card ending in ${paymentDetails.lastFour || '****'}`;
      case 'paypal':
        return 'PayPal';
      case 'klarna':
        return `Klarna (Order ID: ${paymentDetails.orderId || 'Pending'})`;
      default:
        return 'Payment method not available';
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-8 border-b border-gray-200">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-green-100 rounded-full p-3">
            <svg className="h-12 w-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center mb-2">Order Confirmed!</h2>
        <p className="text-gray-600 text-center mb-6">Thank you for your order. We've received your payment and will start processing right away.</p>
        <div className="bg-gray-50 p-4 rounded-lg text-center mb-6">
          <span className="text-gray-600">Order Number:</span>
          <span className="font-bold text-xl ml-2">{orderNumber}</span>
        </div>
        <p className="text-gray-600 text-center text-sm">
          We've sent a confirmation email to <span className="font-semibold">{shippingDetails.email}</span> with all your order details.
        </p>
      </div>

      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Order Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-2 text-gray-700">Shipping Address</h4>
            <div className="text-sm text-gray-600">
              <p>{shippingDetails.firstName} {shippingDetails.lastName}</p>
              <p>{shippingDetails.address1}</p>
              {shippingDetails.address2 && <p>{shippingDetails.address2}</p>}
              <p>{shippingDetails.city}, {shippingDetails.state} {shippingDetails.zipCode}</p>
              <p>Phone: {shippingDetails.phone}</p>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2 text-gray-700">Payment Information</h4>
            <div className="text-sm text-gray-600">
              <p>{getPaymentMethodDisplay()}</p>
              <p>Amount: ${orderTotal.toFixed(2)}</p>
              <p>Billing Address: {shippingDetails.address1}</p>
              <p>{shippingDetails.city}, {shippingDetails.state} {shippingDetails.zipCode}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold mb-2">Shipping Details</h3>
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Shipping Method:</span> {shippingDetails.shippingMethod === 'standard' ? 'Standard Shipping (5-7 business days)' : 'Expedited Shipping (2-3 business days)'}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Estimated Delivery:</span> {getEstimatedDeliveryDate()}
          </p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Tracking Information</h4>
          <p className="text-sm text-blue-700 mb-3">
            You will receive a shipping confirmation email with tracking information once your order ships.
          </p>
          <a href={`/track-order?order=${orderNumber}`} className="text-sm text-blue-600 hover:underline">
            Check Order Status →
          </a>
        </div>
      </div>

      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <Link to="/" className="bg-primary-red hover:bg-red-700 text-white py-3 px-6 rounded font-medium transition mb-4 md:mb-0 w-full md:w-auto text-center">
            Continue Shopping
          </Link>
          <div className="flex space-x-4">
            <button className="border border-gray-300 text-gray-700 hover:bg-gray-50 py-3 px-4 rounded font-medium transition">
              Print Receipt
            </button>
            <button className="border border-gray-300 text-gray-700 hover:bg-gray-50 py-3 px-4 rounded font-medium transition">
              Email Receipt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
