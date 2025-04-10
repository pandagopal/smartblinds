import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

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

  useEffect(() => {
    let isMounted = true;

    const loadKlarnaScript = () => {
      return new Promise<void>((resolve) => {
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

        // Simulate Klarna initialization
        // In a real app, you would call Klarna's API to initialize the payment
        if (containerRef.current) {
          // Create a demo UI to simulate Klarna
          containerRef.current.innerHTML = `
            <div class="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div class="flex items-center mb-4">
                <img src="https://cdn.klarna.com/1.0/shared/image/generic/logo/en_us/basic/logo_black.png"
                     alt="Klarna" class="h-6 mr-2" />
                <span class="text-lg font-semibold">Buy now, pay later</span>
              </div>
              <div class="text-sm text-gray-700 mb-4">
                <p>Pay in 4 interest-free installments of <strong>$${(amount / 4).toFixed(2)}</strong></p>
                <p class="mt-2">First payment today, remaining 3 payments every 2 weeks. No impact to your credit.</p>
              </div>
              <div class="flex flex-col space-y-3">
                <div class="p-3 bg-white rounded border border-gray-200 flex justify-between">
                  <span>First payment today</span>
                  <span class="font-medium">$${(amount / 4).toFixed(2)}</span>
                </div>
                <div class="p-3 bg-white rounded border border-gray-200 flex justify-between">
                  <span>Payment 2</span>
                  <span class="font-medium">$${(amount / 4).toFixed(2)}</span>
                </div>
                <div class="p-3 bg-white rounded border border-gray-200 flex justify-between">
                  <span>Payment 3</span>
                  <span class="font-medium">$${(amount / 4).toFixed(2)}</span>
                </div>
                <div class="p-3 bg-white rounded border border-gray-200 flex justify-between">
                  <span>Payment 4</span>
                  <span class="font-medium">$${(amount / 4).toFixed(2)}</span>
                </div>
              </div>
            </div>
          `;
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

      // Generate fake token and order ID for demo
      const fakeToken = 'klarna_' + Math.random().toString(36).substring(2, 15);
      const fakeOrderId = 'KLR' + Math.floor(1000000000 + Math.random() * 9000000000);

      const paymentDetails = {
        paymentMethod: 'klarna',
        token: fakeToken,
        orderId: fakeOrderId
      };

      onPaymentSuccess(paymentDetails);
    } catch (err) {
      console.error('Klarna payment error:', err);
      setError('Payment failed. Please try again.');
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
            className={`w-full py-3 px-4 rounded text-white text-lg font-medium transition ${
              isLoading || isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
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
