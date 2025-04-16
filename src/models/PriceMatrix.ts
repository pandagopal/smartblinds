/**
 * Price range for a particular size range
 */
export interface PriceRange {
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
  basePrice: number;
  additionalCostPerInch: number;
}

/**
 * Option pricing - additional cost for particular option values
 */
export interface OptionPricing {
  name: string;
  valuePricing: Record<string, number>; // Option value -> additional cost
}

/**
 * Price matrix for a product, includes size ranges and option pricing
 */
export interface PriceMatrix {
  productId: string;
  ranges: PriceRange[];
  optionPricing: OptionPricing[];
}

/**
 * Calculate the price based on dimensions and options
 */
export function calculatePrice(
  priceMatrix: PriceMatrix,
  width: number,
  height: number,
  selectedOptions: Record<string, string> = {}
): number {
  // Find the applicable price range
  const range = priceMatrix.ranges.find(range =>
    width >= range.minWidth &&
    width <= range.maxWidth &&
    height >= range.minHeight &&
    height <= range.maxHeight
  );

  if (!range) {
    console.error(`No applicable price range found for dimensions ${width}x${height}`);
    return 0;
  }

  // Calculate the base price based on dimensions
  let totalPrice = range.basePrice;

  // Add additional cost for size (if beyond the minimum)
  const extraWidth = Math.max(0, width - range.minWidth);
  const extraHeight = Math.max(0, height - range.minHeight);
  const extraInches = extraWidth + extraHeight;

  totalPrice += extraInches * range.additionalCostPerInch;

  // Add option pricing
  for (const option of priceMatrix.optionPricing) {
    const selectedValue = selectedOptions[option.name];
    if (selectedValue && option.valuePricing[selectedValue]) {
      totalPrice += option.valuePricing[selectedValue];
    }
  }

  return totalPrice;
}

// Sample price matrices for our products
export const SAMPLE_PRICE_MATRICES: Record<string, PriceMatrix> = {
  "product-1": {
    productId: "product-1",
    ranges: [
      {
        minWidth: 18,
        maxWidth: 36,
        minHeight: 24,
        maxHeight: 48,
        basePrice: 24.74,
        additionalCostPerInch: 0.5
      },
      {
        minWidth: 36,
        maxWidth: 60,
        minHeight: 24,
        maxHeight: 48,
        basePrice: 39.99,
        additionalCostPerInch: 0.75
      },
      {
        minWidth: 18,
        maxWidth: 36,
        minHeight: 48,
        maxHeight: 72,
        basePrice: 39.99,
        additionalCostPerInch: 0.75
      },
      {
        minWidth: 36,
        maxWidth: 60,
        minHeight: 48,
        maxHeight: 72,
        basePrice: 59.99,
        additionalCostPerInch: 1.0
      },
    ],
    optionPricing: [
      {
        name: "Mount Type",
        valuePricing: {
          "Inside Mount": 0,
          "Outside Mount": 5
        }
      },
      {
        name: "Lift Type",
        valuePricing: {
          "Standard Cord": 0,
          "Cordless": 20
        }
      },
      {
        name: "Color",
        valuePricing: {
          "White": 0,
          "Alabaster": 0,
          "Gray": 0,
          "Brown": 5,
          "Black": 5
        }
      }
    ]
  },
  "product-2": {
    productId: "product-2",
    ranges: [
      {
        minWidth: 18,
        maxWidth: 36,
        minHeight: 24,
        maxHeight: 48,
        basePrice: 35.24,
        additionalCostPerInch: 0.4
      },
      {
        minWidth: 36,
        maxWidth: 60,
        minHeight: 24,
        maxHeight: 48,
        basePrice: 45.99,
        additionalCostPerInch: 0.6
      },
      {
        minWidth: 18,
        maxWidth: 36,
        minHeight: 48,
        maxHeight: 72,
        basePrice: 45.99,
        additionalCostPerInch: 0.6
      },
      {
        minWidth: 36,
        maxWidth: 60,
        minHeight: 48,
        maxHeight: 72,
        basePrice: 65.99,
        additionalCostPerInch: 0.8
      },
    ],
    optionPricing: [
      {
        name: "Mount Type",
        valuePricing: {
          "Inside Mount": 0,
          "Outside Mount": 5
        }
      },
      {
        name: "Lift Type",
        valuePricing: {
          "Standard Cord": 0,
          "Cordless": 25
        }
      }
    ]
  },
  "product-3": {
    productId: "product-3",
    ranges: [
      {
        minWidth: 18,
        maxWidth: 36,
        minHeight: 24,
        maxHeight: 48,
        basePrice: 47.24,
        additionalCostPerInch: 0.7
      },
      {
        minWidth: 36,
        maxWidth: 60,
        minHeight: 24,
        maxHeight: 48,
        basePrice: 67.99,
        additionalCostPerInch: 0.9
      },
      {
        minWidth: 18,
        maxWidth: 36,
        minHeight: 48,
        maxHeight: 72,
        basePrice: 67.99,
        additionalCostPerInch: 0.9
      },
      {
        minWidth: 36,
        maxWidth: 60,
        minHeight: 48,
        maxHeight: 72,
        basePrice: 89.99,
        additionalCostPerInch: 1.2
      },
    ],
    optionPricing: [
      {
        name: "Mount Type",
        valuePricing: {
          "Inside Mount": 0,
          "Outside Mount": 5
        }
      },
      {
        name: "Light Control",
        valuePricing: {
          "Light Filtering": 0,
          "Room Darkening": 15,
          "Blackout": 25
        }
      },
      {
        name: "Lift Type",
        valuePricing: {
          "Standard Cord": 0,
          "Cordless": 30,
          "Motorized": 120
        }
      }
    ]
  },
  "product-4": {
    productId: "product-4",
    ranges: [
      {
        minWidth: 18,
        maxWidth: 36,
        minHeight: 24,
        maxHeight: 48,
        basePrice: 29.48,
        additionalCostPerInch: 0.4
      },
      {
        minWidth: 36,
        maxWidth: 60,
        minHeight: 24,
        maxHeight: 48,
        basePrice: 39.99,
        additionalCostPerInch: 0.6
      },
      {
        minWidth: 18,
        maxWidth: 36,
        minHeight: 48,
        maxHeight: 72,
        basePrice: 39.99,
        additionalCostPerInch: 0.6
      },
      {
        minWidth: 36,
        maxWidth: 60,
        minHeight: 48,
        maxHeight: 72,
        basePrice: 59.99,
        additionalCostPerInch: 0.8
      },
    ],
    optionPricing: [
      {
        name: "Mount Type",
        valuePricing: {
          "Inside Mount": 0,
          "Outside Mount": 5
        }
      },
      {
        name: "Opacity",
        valuePricing: {
          "Light Filtering": 0,
          "Room Darkening": 15,
          "Blackout": 25
        }
      },
      {
        name: "Lift Type",
        valuePricing: {
          "Standard Chain": 0,
          "Motorized": 100
        }
      }
    ]
  },
  "product-5": {
    productId: "product-5",
    ranges: [
      {
        minWidth: 18,
        maxWidth: 36,
        minHeight: 24,
        maxHeight: 48,
        basePrice: 31.79,
        additionalCostPerInch: 0.3
      },
      {
        minWidth: 36,
        maxWidth: 60,
        minHeight: 24,
        maxHeight: 48,
        basePrice: 41.99,
        additionalCostPerInch: 0.5
      },
      {
        minWidth: 18,
        maxWidth: 36,
        minHeight: 48,
        maxHeight: 72,
        basePrice: 41.99,
        additionalCostPerInch: 0.5
      },
      {
        minWidth: 36,
        maxWidth: 60,
        minHeight: 48,
        maxHeight: 72,
        basePrice: 51.99,
        additionalCostPerInch: 0.7
      },
    ],
    optionPricing: [
      {
        name: "Mount Type",
        valuePricing: {
          "Inside Mount": 0,
          "Outside Mount": 5
        }
      },
      {
        name: "Lift Type",
        valuePricing: {
          "Standard Cord": 0,
          "Cordless": 15
        }
      }
    ]
  },
  "product-6": {
    productId: "product-6",
    ranges: [
      {
        minWidth: 24,
        maxWidth: 48,
        minHeight: 36,
        maxHeight: 72,
        basePrice: 39.74,
        additionalCostPerInch: 0.5
      },
      {
        minWidth: 48,
        maxWidth: 84,
        minHeight: 36,
        maxHeight: 72,
        basePrice: 59.99,
        additionalCostPerInch: 0.6
      },
      {
        minWidth: 48,
        maxWidth: 84,
        minHeight: 72,
        maxHeight: 120,
        basePrice: 79.99,
        additionalCostPerInch: 0.7
      },
      {
        minWidth: 24,
        maxWidth: 48,
        minHeight: 72,
        maxHeight: 120,
        basePrice: 69.99,
        additionalCostPerInch: 0.7
      },
    ],
    optionPricing: [
      {
        name: "Material",
        valuePricing: {
          "PVC": 0,
          "Fabric": 15,
          "Vinyl": 5
        }
      },
      {
        name: "Stack Direction",
        valuePricing: {
          "Left": 0,
          "Right": 0,
          "Split": 10
        }
      },
      {
        name: "Control Type",
        valuePricing: {
          "Wand": 0,
          "Cord and Chain": 10
        }
      }
    ]
  },
};
