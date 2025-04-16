/**
 * Price breakdown structure
 */
export interface PriceBreakdown {
  basePrice: number;
  sizeAdjustment: number;
  controlTypePrice: number;
  headrailPrice: number;
  clothTapePrice: number;
  opacityPrice: number;
  tiltTypePrice: number;
  professionalInstallationPrice: number;
  professionalMeasurementPrice: number;
  expeditedProductionPrice: number;
  total: number;
}

/**
 * Product configuration options for pricing calculation
 */
export interface ProductPricingConfig {
  width: number;
  height: number;
  slatSize: string;
  mountType: string;
  controlType: string;
  headrailType: string;
  productType: string;
  opacity?: string;
  slatStyle?: string;
  tiltType?: string;
  clothTape?: boolean;
  professionalInstallation?: boolean;
  professionalMeasurement?: boolean;
  expeditedProduction?: boolean;
}

/**
 * Calculate the price breakdown based on product configuration
 * @param config Product configuration options
 * @returns Price breakdown details
 */
export function calculatePrice(config: ProductPricingConfig): PriceBreakdown {
  // Base price depends on product type
  let basePrice = 39.99; // Default base price for faux wood blinds

  switch (config.productType.toLowerCase()) {
    case 'cellular':
      basePrice = 89.99;
      break;
    case 'roller':
      basePrice = 49.99;
      break;
    case 'wood':
      basePrice = 129.99;
      break;
    case 'woven wood':
      basePrice = 119.99;
      break;
    case 'roman':
      basePrice = 149.99;
      break;
    case 'faux wood':
    default:
      basePrice = 39.99;
      break;
  }

  // Adjust for larger sizes
  let sizeAdjustment = 0;
  const area = config.width * config.height; // Total area in square inches

  if (area > 1500) {
    // Base adjustment is $5 for every 500 square inches over 1500
    const extraArea = area - 1500;
    sizeAdjustment = Math.ceil(extraArea / 500) * 5;
  }

  // Add costs for premium options

  // Control type price
  let controlTypePrice = 0;
  switch (config.controlType) {
    case 'cordless':
      controlTypePrice = 25;
      break;
    case 'motorized':
      controlTypePrice = 120;
      break;
    default: // standard cord
      controlTypePrice = 0;
      break;
  }

  // Headrail type price
  let headrailPrice = 0;
  if (config.headrailType === 'deluxe') {
    headrailPrice = 15;
  }

  // Cloth tape price
  let clothTapePrice = 0;
  if (config.clothTape) {
    clothTapePrice = 18.99;
  }

  // Opacity price
  let opacityPrice = 0;
  if (config.opacity === 'room_darkening') {
    opacityPrice = 10;
  } else if (config.opacity === 'blackout') {
    opacityPrice = 25;
  }

  // Tilt type price
  let tiltTypePrice = 0;
  if (config.tiltType === 'cord') {
    tiltTypePrice = 5;
  }

  // Professional installation price
  let professionalInstallationPrice = 0;
  if (config.professionalInstallation) {
    // Base price per blind for installation
    professionalInstallationPrice = 79.99;
  }

  // Professional measurement price
  let professionalMeasurementPrice = 0;
  if (config.professionalMeasurement) {
    professionalMeasurementPrice = 39.99;
  }

  // Expedited production price
  let expeditedProductionPrice = 0;
  if (config.expeditedProduction) {
    // 25% surcharge for expedited production
    expeditedProductionPrice = basePrice * 0.25;
  }

  // Adjust for slat size - 2.5 inch costs more
  if (config.slatSize === '2.5inch') {
    basePrice += 10;
  }

  // Calculate total price
  const total = basePrice + sizeAdjustment + controlTypePrice + headrailPrice +
               clothTapePrice + opacityPrice + tiltTypePrice +
               professionalInstallationPrice + professionalMeasurementPrice +
               expeditedProductionPrice;

  return {
    basePrice,
    sizeAdjustment,
    controlTypePrice,
    headrailPrice,
    clothTapePrice,
    opacityPrice,
    tiltTypePrice,
    professionalInstallationPrice,
    professionalMeasurementPrice,
    expeditedProductionPrice,
    total
  };
}

/**
 * Calculate product price based on base price, dimensions and options
 * @param basePrice The product's base price
 * @param width Width in inches
 * @param height Height in inches
 * @param options Product configuration options
 * @returns The calculated price
 */
export function calculateProductPrice(
  basePrice: number,
  width: number,
  height: number,
  options: any
): number {
  // Create a simplified config for the price calculation
  const config: ProductPricingConfig = {
    width,
    height,
    slatSize: options.slatSize || '2inch',
    mountType: options.mountType || 'inside',
    controlType: options.controlType || 'standard',
    headrailType: options.headrailType || 'standard',
    productType: options.productType || 'faux wood',
    opacity: options.opacity || 'light_filtering',
    clothTape: options.clothTape || false,
    professionalInstallation: options.professionalInstallation || false,
    professionalMeasurement: options.professionalMeasurement || false,
    expeditedProduction: options.expeditedProduction || false
  };

  // Calculate price breakdown using the main calculation function
  const priceBreakdown = calculatePrice(config);

  // For products with a predefined base price different from the calculated one,
  // we adjust the final price while maintaining the extras
  if (basePrice !== priceBreakdown.basePrice) {
    const extras = priceBreakdown.total - priceBreakdown.basePrice;
    return basePrice + extras;
  }

  return priceBreakdown.total;
}
