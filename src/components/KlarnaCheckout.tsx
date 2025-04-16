import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

export interface KlarnaPaymentResult {
  paymentMethod: string;
  token: string;
  orderId?: string;
}

interface KlarnaCheckoutProps {
  amount?: number;
  onPaymentSuccess: (details: KlarnaPaymentResult) => void;
  onPaymentError: (error: any) => void;
}

const KlarnaCheckout: React.FC<KlarnaCheckoutProps> = ({
  amount = 99.99,
  onPaymentSuccess,
  onPaymentError
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedOption, setSelectedOption] = useState<'payIn4' | 'payLater' | 'financing'>('payIn4');

  // Function to initialize Klarna session
  const initializeKlarnaSession = async () => {
    try {
      // In a real implementation, this would be an API call to your server
      // For this demo, we'll simulate this with a timeout and a fake session ID
      await new Promise(resolve => setTimeout(resolve, 500));

      // Normally you would do:
      // const response = await axios.post('/api/payment/klarna/create-session', {
      //   amount: amount,
      //   currency: 'USD'
      // });
      // return response.data.sessionId;

      return 'fake_klarna_session_' + Date.now();
    } catch (error) {
      console.error('Error creating Klarna session:', error);
      throw new Error('Unable to initialize Klarna payment. Please try again later.');
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadKlarnaScript = () => {
      return new Promise<void>((resolve, reject) => {
        // In a real implementation, you would load the actual Klarna script
        // const script = document.createElement('script');
        // script.src = 'https://x.klarnacdn.net/kp/lib/v1/api.js';
        // script.async = true;
        // script.onload = () => resolve();
        // script.onerror = () => reject(new Error('Failed to load Klarna script'));
        // document.head.appendChild(script);

        // For this demo, we'll simulate the script loading
        setTimeout(() => resolve(), 1000);
      });
    };

    const initializeKlarna = async () => {
      try {
        if (!containerRef.current) return;
        setIsLoading(true);

        // Load Klarna script
        await loadKlarnaScript();

        // Initialize Klarna session
        await initializeKlarnaSession();

        // Simulate Klarna initialization
        if (containerRef.current) {
          // Create an improved demo UI to simulate Klarna
          containerRef.current.innerHTML = `
            <div class="p-6 bg-gray-50 rounded-lg border border-gray-200">
              <div class="flex items-center mb-4">
                <img src="https://cdn.klarna.com/1.0/shared/image/generic/logo/en_us/basic/logo_black.png?width=180"
                     alt="Klarna" class="h-8" />
              </div>

              <div class="mb-6">
                <div class="text-sm text-gray-600 mb-3">Choose how you'd like to pay with Klarna:</div>

                <div class="space-y-3">
                  <div class="relative">
                    <input type="radio" id="klarna-option-1" name="klarna-option" checked class="sr-only peer">
                    <label for="klarna-option-1" class="flex p-4 bg-white border border-gray-300 rounded-lg cursor-pointer peer-checked:border-pink-400 peer-checked:bg-pink-50 hover:bg-gray-50">
                      <div class="flex flex-col">
                        <strong class="text-gray-900">Pay in 4 installments</strong>
                        <span class="text-sm text-gray-500">4 interest-free payments of $${(amount / 4).toFixed(2)}</span>
                      </div>
                    </label>
                  </div>

                  <div class="relative">
                    <input type="radio" id="klarna-option-2" name="klarna-option" class="sr-only peer">
                    <label for="klarna-option-2" class="flex p-4 bg-white border border-gray-300 rounded-lg cursor-pointer peer-checked:border-pink-400 peer-checked:bg-pink-50 hover:bg-gray-50">
                      <div class="flex flex-col">
                        <strong class="text-gray-900">Pay in 30 days</strong>
                        <span class="text-sm text-gray-500">Pay later, with no interest or fees</span>
                      </div>
                    </label>
                  </div>

                  <div class="relative">
                    <input type="radio" id="klarna-option-3" name="klarna-option" class="sr-only peer">
                    <label for="klarna-option-3" class="flex p-4 bg-white border border-gray-300 rounded-lg cursor-pointer peer-checked:border-pink-400 peer-checked:bg-pink-50 hover:bg-gray-50">
                      <div class="flex flex-col">
                        <strong class="text-gray-900">Financing</strong>
                        <span class="text-sm text-gray-500">Split into 6-36 monthly payments</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <div class="bg-white p-4 rounded-lg border border-gray-200 mb-4">
                <div class="flex justify-between mb-2">
                  <div class="text-sm text-gray-600">Order total</div>
                  <div class="font-medium">$${amount.toFixed(2)}</div>
                </div>
                <div class="text-xs text-gray-500">View payment schedule</div>
              </div>

              <div class="text-sm text-gray-600 mb-2">
                <p>By selecting "Complete payment", I agree to Klarna's terms of service and confirm I have read Klarna's privacy policy.</p>
              </div>
            </div>
          `;

          // Add event listeners to radio buttons
          const radioButtons = containerRef.current.querySelectorAll('input[type="radio"]');
          radioButtons.forEach((radio, index) => {
            radio.addEventListener('change', () => {
              const options = ['payIn4', 'payLater', 'financing'] as const;
              setSelectedOption(options[index]);
            });
          });
        }

        if (isMounted) {
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error initializing Klarna:', err);
        if (isMounted) {
          setError('Failed to load Klarna payment options. Please try again later.');
          setIsLoading(false);
          onPaymentError(err);
        }
      }
    };

    initializeKlarna();

    return () => {
      isMounted = false;
    };
  }, [amount, onPaymentError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Simulate Klarna payment authorization
      // In a real app, you would call Klarna's API to authorize the payment
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In a real app, you would submit to your server for processing
      // const response = await axios.post('/api/payment/klarna/process', {
      //   sessionId: klarnaSessionId,
      //   paymentOption: selectedOption,
      //   amount: amount
      // });

      // Generate fake token and order ID for demo
      const fakeToken = 'klarna_' + Math.random().toString(36).substring(2, 15);
      const fakeOrderId = 'KLR' + Math.floor(1000000000 + Math.random() * 9000000000);

      const paymentDetails: KlarnaPaymentResult = {
        paymentMethod: 'klarna_' + selectedOption,
        token: fakeToken,
        orderId: fakeOrderId
      };

      onPaymentSuccess(paymentDetails);
    } catch (err) {
      console.error('Klarna payment error:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Payment authorization failed. Please try a different payment method.'
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
      className="klarna-checkout"
    >
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="p-3 mb-4 bg-red-50 border border-red-200 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="text-sm mb-2 text-gray-600">
          Pay over time with Klarna:
        </div>

        <div ref={containerRef} className="mb-4">
          {isLoading && (
            <div className="flex justify-center items-center py-8">
              <svg className="animate-spin h-8 w-8 text-[#ffb3c7]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
            className={`w-full py-3 px-4 rounded text-lg font-medium transition ${
              isLoading || isSubmitting
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : 'bg-[#ffb3c7] hover:bg-[#ff8ab0] text-black'
            }`}
          >
            {isSubmitting ? (
              <span className="flex justify-center items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              `Complete Klarna Payment`
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default KlarnaCheckout;
