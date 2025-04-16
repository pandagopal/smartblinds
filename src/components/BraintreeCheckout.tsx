import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import dropin from 'braintree-web-drop-in';
import type { Dropin, PaymentMethodPayload } from 'braintree-web-drop-in';
import axios from 'axios';

// Add a createDropin helper to convert the callback-based API to a Promise-based one
function createDropin(options: any): Promise<Dropin> {
  return new Promise((resolve, reject) => {
    dropin.create(options, (err, instance) => {
      if (err) {
        reject(err);
      } else {
        resolve(instance);
      }
    });
  });
}

// Add teardown helper
function teardownDropin(instance: Dropin): Promise<void> {
  return new Promise((resolve, reject) => {
    instance.teardown((err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

// Add requestPayment helper
function requestPayment(instance: Dropin): Promise<PaymentMethodPayload> {
  return new Promise((resolve, reject) => {
    instance.requestPaymentMethod((err, payload) => {
      if (err) {
        reject(err);
      } else {
        resolve(payload);
      }
    });
  });
}

export interface PaymentResult {
  paymentMethod: string;
  lastFour: string;
  nonce: string;
}

interface BraintreeCheckoutProps {
  amount?: number;
  onPaymentSuccess: (result: PaymentResult) => void;
  onPaymentError: (error: any) => void;
}

const BraintreeCheckout: React.FC<BraintreeCheckoutProps> = ({
  amount = 99.99,
  onPaymentSuccess,
  onPaymentError
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [dropinInstance, setDropinInstance] = useState<Dropin | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Function to get client token from server
  const getClientToken = async (): Promise<string> => {
    try {
      // In a real implementation, this would be an API call to your server
      // For this demo, we'll simulate this with a timeout and a fake token
      await new Promise(resolve => setTimeout(resolve, 500));

      // Normally you would do:
      // const response = await axios.get('/api/payment/braintree/client-token');
      // return response.data.clientToken;

      return 'fake_client_token_for_demo';
    } catch (error) {
      console.error('Error fetching client token:', error);
      throw new Error('Unable to fetch payment authorization token');
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initializeBraintree = async () => {
      try {
        if (!containerRef.current) return;
        setIsLoading(true);

        // Get client token from server
        const clientToken = await getClientToken();

        // Create drop-in UI
        const instance = await createDropin({
          authorization: clientToken,
          container: containerRef.current,
          card: {
            cardholderName: {
              required: true
            }
          },
          paypal: {
            flow: 'checkout',
            amount: amount.toString(),
            currency: 'USD'
          },
          venmo: {
            allowDesktop: true
          },
          applePay: {
            displayName: 'SmartBlinds',
            paymentRequest: {
              total: {
                label: 'SmartBlinds',
                amount: amount.toString()
              }
            }
          },
          googlePay: {
            googlePayVersion: 2,
            merchantId: 'merchant-id-from-google',
            transactionInfo: {
              totalPriceStatus: 'FINAL',
              totalPrice: amount.toString(),
              currencyCode: 'USD'
            }
          }
        });

        if (isMounted) {
          setDropinInstance(instance);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error initializing Braintree:', err);
        if (isMounted) {
          setError('Failed to load payment form. Please try again later.');
          setIsLoading(false);
          onPaymentError(err);
        }
      }
    };

    initializeBraintree();

    return () => {
      isMounted = false;
      if (dropinInstance) {
        teardownDropin(dropinInstance)
          .catch(err => console.error('Error tearing down Braintree:', err));
      }
    };
  }, [amount, onPaymentError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!dropinInstance) {
      setError('Payment form not initialized. Please refresh and try again.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Get payment method nonce
      const payload = await requestPayment(dropinInstance);

      // In a real app, you would send the nonce to your server
      // const response = await axios.post('/api/payment/braintree/process', {
      //   paymentMethodNonce: payload.nonce,
      //   amount: amount
      // });

      // For demo, we'll simulate a server response
      console.log('Payment nonce:', payload.nonce);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Get payment method details
      const getPaymentMethodName = (payload: PaymentMethodPayload): string => {
        return payload.type === 'CreditCard' ? 'card' : payload.type.toLowerCase();
      };

      const getLastFour = (payload: PaymentMethodPayload): string => {
        if (payload.type === 'CreditCard' && payload.details && payload.details.lastFour) {
          return payload.details.lastFour;
        }
        return '****';
      };

      // Create success result
      const result: PaymentResult = {
        paymentMethod: getPaymentMethodName(payload),
        lastFour: getLastFour(payload),
        nonce: payload.nonce
      };

      onPaymentSuccess(result);
    } catch (err) {
      console.error('Payment error:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Payment failed. Please check your information and try again.'
      );
      onPaymentError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="braintree-checkout"
    >
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="p-3 mb-4 bg-red-50 border border-red-200 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="text-sm mb-2 text-gray-600">
          Securely pay using your preferred payment method:
        </div>

        <div ref={containerRef} className="mb-4">
          {isLoading && (
            <div className="flex justify-center items-center py-8">
              <svg className="animate-spin h-8 w-8 text-primary-red" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}
        </div>

        <div className="mt-6">
          <button
            type="submit"
            disabled={isLoading || isSubmitting}
            className={`w-full py-3 px-4 rounded text-white text-lg font-medium transition ${
              isLoading || isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-primary-red hover:bg-red-700'
            }`}
          >
            {isSubmitting ? (
              <span className="flex justify-center items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              `Pay $${amount.toFixed(2)}`
            )}
          </button>
        </div>

        <div className="mt-4 flex justify-center space-x-4">
          <img src="https://cdn.bfldr.com/6JG7T5SF/at/9pvcz69b4d98xhvw5qhpqh/Visa.svg" alt="Visa" className="h-6" />
          <img src="https://cdn.bfldr.com/6JG7T5SF/at/hhcn69xrkcrcmh89t4sw/MC.svg" alt="Mastercard" className="h-6" />
          <img src="https://cdn.bfldr.com/6JG7T5SF/at/wb4knxfqbtpr68sw5vqqnkn/Amex.svg" alt="American Express" className="h-6" />
          <img src="https://cdn.paypal.com/paypal-apps-svg-logo/paypal_logo/logo-paypal.svg" alt="PayPal" className="h-6" />
        </div>
      </form>
    </motion.div>
  );
};

export default BraintreeCheckout;
