import React, { useState, useEffect } from 'react';

interface DeliveryEstimatorProps {
  selectedOptions: Record<string, string>;
  mountType: string;
  hasCustomFeatures: boolean;
}

const DeliveryEstimator: React.FC<DeliveryEstimatorProps> = ({
  selectedOptions,
  mountType,
  hasCustomFeatures
}) => {
  const [estimatedDays, setEstimatedDays] = useState<number>(14); // Default to 14 days
  const [expeditedAvailable, setExpeditedAvailable] = useState<boolean>(true);
  const [showExpedited, setShowExpedited] = useState<boolean>(false);
  const [expeditedPrice, setExpeditedPrice] = useState<number>(39.99);
  const [expeditedDays, setExpeditedDays] = useState<number>(7);

  // Calculate delivery date
  useEffect(() => {
    // Start with base production time
    let baseDays = 10; // Standard production time

    // Adjust for selected options
    if (selectedOptions['Control Type'] === 'Motorized') {
      baseDays += 5; // Motorized controls take longer
      setExpeditedAvailable(false); // Expedited not available for motorized
    } else {
      setExpeditedAvailable(true);
    }

    if (hasCustomFeatures) {
      baseDays += 2; // Custom features add time
    }

    // Special fabrics or materials
    if (selectedOptions['Color']?.includes('Special') ||
        selectedOptions['Material']?.includes('Premium')) {
      baseDays += 3;
    }

    // Add shipping time (3-4 days)
    const shippingDays = 4;
    setEstimatedDays(baseDays + shippingDays);

    // Calculate expedited time (typically cuts production time in half)
    setExpeditedDays(Math.max(7, Math.floor(baseDays / 2) + shippingDays));

    // Adjust expedited price based on complexity
    let price = 39.99;
    if (hasCustomFeatures) {
      price += 10;
    }
    if (mountType === 'Outside Mount' && selectedOptions['Light Blocker'] === 'Full Blackout Kit') {
      price += 15;
    }
    setExpeditedPrice(price);

  }, [selectedOptions, mountType, hasCustomFeatures]);

  // Calculate estimated delivery date from today
  const getDeliveryDateString = (days: number): string => {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + days);

    // Format date as Month Day, Year
    return deliveryDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get a range of dates (estimatedDate - 2 days to estimatedDate + 2 days)
  const getDeliveryDateRange = (days: number): string => {
    const earliestDate = new Date();
    earliestDate.setDate(earliestDate.getDate() + days - 2);

    const latestDate = new Date();
    latestDate.setDate(latestDate.getDate() + days + 2);

    const earliestFormatted = earliestDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });

    const latestFormatted = latestDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    return `${earliestFormatted} - ${latestFormatted}`;
  };

  return (
    <div className="delivery-estimator mt-4">
      <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
        <div className="mb-3">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-medium">Estimated Delivery</h3>
            <span className="text-sm text-green-600 font-medium">{getDeliveryDateRange(estimatedDays)}</span>
          </div>
          <div className="mt-1 flex items-center">
            <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
              <div
                className="bg-green-600 h-2.5 rounded-full"
                style={{ width: `${Math.min(100, (estimatedDays / 30) * 100)}%` }}
              ></div>
            </div>
            <span className="text-xs text-gray-500">{estimatedDays} days</span>
          </div>
        </div>

        {expeditedAvailable && (
          <div className="mb-2">
            <button
              type="button"
              className="text-blue-600 text-sm font-medium flex items-center"
              onClick={() => setShowExpedited(!showExpedited)}
            >
              <svg
                className={`w-4 h-4 mr-1 transition-transform ${showExpedited ? 'transform rotate-90' : ''}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              Need it faster?
            </button>

            {showExpedited && (
              <div className="mt-2 p-3 bg-blue-50 rounded-md">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-sm">Expedited Production</h4>
                    <p className="text-xs text-gray-600 mt-1">
                      Get your blinds in approximately {expeditedDays} days
                    </p>
                    <p className="text-xs font-medium text-green-600 mt-1">
                      {getDeliveryDateRange(expeditedDays)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium">${expeditedPrice.toFixed(2)}</span>
                    <button
                      type="button"
                      className="block mt-1 text-xs text-white bg-blue-600 py-1 px-2 rounded hover:bg-blue-700"
                    >
                      Add to Order
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-gray-600">
          <p>• Production time: {estimatedDays - 4} business days</p>
          <p>• Shipping time: 3-4 business days</p>
          <p className="mt-1">* Delivery estimate will be confirmed at checkout</p>
        </div>
      </div>
    </div>
  );
};

export default DeliveryEstimator;
