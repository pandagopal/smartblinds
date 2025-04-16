import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '../models/Product';
import { addToCart } from '../services/cartService';
import { calculatePrice } from '../services/pricingService';
import { getAvailableColors } from '../services/colorService';
import { toggleFavorite, isFavorite } from '../services/favoritesService';
import { AnimationWrapper } from './AnimationProvider';

// Define types for the component
interface MobileProductConfiguratorProps {
  product: Product;
  initialOptions?: {
    width?: number;
    height?: number;
    color?: string;
    slatSize?: string;
    mountType?: string;
    controlType?: string;
    quantity?: number;
  };
}

// Define configuration steps
type ConfigStep = 'dimensions' | 'color' | 'options' | 'review';

const MobileProductConfigurator: React.FC<MobileProductConfiguratorProps> = ({
  product,
  initialOptions
}) => {
  // Current step state
  const [currentStep, setCurrentStep] = useState<ConfigStep>('dimensions');

  // Configurator state
  const [quantity, setQuantity] = useState<number>(1);

  // Main configuration state
  const [selectedOptions, setSelectedOptions] = useState({
    width: initialOptions?.width || 0,
    height: initialOptions?.height || 0,
    color: initialOptions?.color || 'white',
    slatSize: initialOptions?.slatSize || '2inch',
    mountType: initialOptions?.mountType || 'inside',
    controlType: initialOptions?.controlType || 'standard',
    headrailType: 'standard'
  });

  const [widthFeet, setWidthFeet] = useState<number>(
    initialOptions?.width ? Math.floor(initialOptions.width / 12) : 3
  );
  const [widthInches, setWidthInches] = useState<number>(
    initialOptions?.width ? initialOptions.width % 12 : 0
  );
  const [heightFeet, setHeightFeet] = useState<number>(
    initialOptions?.height ? Math.floor(initialOptions.height / 12) : 5
  );
  const [heightInches, setHeightInches] = useState<number>(
    initialOptions?.height ? initialOptions.height % 12 : 0
  );
  const [widthDecimal, setWidthDecimal] = useState<number>(
    initialOptions?.width || widthFeet * 12 + widthInches
  );
  const [heightDecimal, setHeightDecimal] = useState<number>(
    initialOptions?.height || heightFeet * 12 + heightInches
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Favorite state
  const [isFavorited, setIsFavorited] = useState<boolean>(false);

  // Get the available colors for this product
  const productType = 'faux wood'; // Default to faux wood if product type not available
  const availableColors = getAvailableColors(productType);
  const selectedColorOption = availableColors.find(c => c.id === selectedOptions.color);

  // Calculate price based on current selections
  const priceBreakdown = calculatePrice({
    width: widthDecimal,
    height: heightDecimal,
    slatSize: selectedOptions.slatSize,
    mountType: selectedOptions.mountType,
    controlType: selectedOptions.controlType,
    headrailType: selectedOptions.headrailType,
    productType: productType
  });

  // Check if this configuration is favorited
  useEffect(() => {
    // Generate the configuration ID
    const configId = `${product.id}-${widthDecimal}-${heightDecimal}-${selectedColorOption?.name || 'White'}`.replace(/\s+/g, '');
    setIsFavorited(isFavorite(configId));
  }, [product.id, widthDecimal, heightDecimal, selectedOptions.color, selectedColorOption?.name]);

  // Handle toggling favorite status
  const handleToggleFavorite = () => {
    const newIsFavorited = toggleFavorite({
      productId: product.id,
      productTitle: product.title,
      width: widthDecimal,
      height: heightDecimal,
      colorName: selectedColorOption?.name || 'White',
      thumbnail: product.image,
      slatSize: selectedOptions.slatSize,
      mountType: selectedOptions.mountType,
      controlType: selectedOptions.controlType
    });

    setIsFavorited(newIsFavorited);
  };

  // Handle dimension changes
  const updateDimensions = () => {
    // Calculate decimal values
    const newWidthDecimal = widthFeet * 12 + widthInches;
    const newHeightDecimal = heightFeet * 12 + heightInches;

    // Validate dimensions
    if (newWidthDecimal < 12 || newWidthDecimal > 96) {
      setErrorMessage('Width must be between 12" and 96"');
      return;
    }

    if (newHeightDecimal < 12 || newHeightDecimal > 96) {
      setErrorMessage('Height must be between 12" and 96"');
      return;
    }

    // Clear any errors and update dimensions
    setErrorMessage(null);
    setWidthDecimal(newWidthDecimal);
    setHeightDecimal(newHeightDecimal);

    // Move to next step if valid
    if (currentStep === 'dimensions') {
      setCurrentStep('color');
    }
  };

  // Handle configuration changes
  const handleConfigChange = (option: string, value: string | number) => {
    setSelectedOptions(prev => ({
      ...prev,
      [option]: value
    }));

    // Update selected color
    if (option === 'color') {
      // Since we've removed the selectedColor state, we don't need to update it directly
      // Only update the selectedOptions state which is already done above
    }
  };

  // Handle adding to cart
  const handleAddToCart = () => {
    if (widthDecimal === 0 || heightDecimal === 0) {
      setErrorMessage('Please specify dimensions before adding to cart');
      return;
    }

    // Prepare options for the cart item
    const options: Record<string, string> = {
      'Color': selectedColorOption?.name || 'White',
      'Slat Size': selectedOptions.slatSize === '2.5inch' ? '2.5 inch' : '2 inch',
      'Mount Type': selectedOptions.mountType === 'inside' ? 'Inside Mount' : 'Outside Mount',
      'Control Type': selectedOptions.controlType === 'standard' ? 'Standard Cord' :
                    selectedOptions.controlType === 'cordless' ? 'Cordless' : 'Motorized',
      'Headrail': selectedOptions.headrailType === 'standard' ? 'Standard Valance' : 'Deluxe Valance'
    };

    // Add to cart using the product, quantity, dimensions, and options
    addToCart(product, quantity, widthDecimal, heightDecimal, options);

    // Display success message
    alert(`Added ${quantity} ${product.title} to cart!`);
  };

  // Navigation between steps
  const goToNextStep = () => {
    if (currentStep === 'dimensions') {
      updateDimensions(); // This will move to color if dimensions are valid
    } else if (currentStep === 'color') {
      setCurrentStep('options');
    } else if (currentStep === 'options') {
      setCurrentStep('review');
    }
  };

  const goToPreviousStep = () => {
    if (currentStep === 'color') {
      setCurrentStep('dimensions');
    } else if (currentStep === 'options') {
      setCurrentStep('color');
    } else if (currentStep === 'review') {
      setCurrentStep('options');
    }
  };

  // Render the dimensions step
  const renderDimensionsStep = () => (
    <div className="dimensions-step">
      <h3 className="text-lg font-medium mb-4">Step 1: Select Dimensions</h3>

      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
          {errorMessage}
        </div>
      )}

      <div className="mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Width</label>
          <div className="flex">
            <div className="flex-1 mr-2">
              <label className="block text-xs text-gray-500 mb-1">Feet</label>
              <select
                value={widthFeet}
                onChange={(e) => setWidthFeet(Number(e.target.value))}
                className="w-full rounded border-gray-300"
              >
                {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((ft) => (
                  <option key={ft} value={ft}>{ft} ft</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Inches</label>
              <select
                value={widthInches}
                onChange={(e) => setWidthInches(Number(e.target.value))}
                className="w-full rounded border-gray-300"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i} value={i}>{i}"</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
          <div className="flex">
            <div className="flex-1 mr-2">
              <label className="block text-xs text-gray-500 mb-1">Feet</label>
              <select
                value={heightFeet}
                onChange={(e) => setHeightFeet(Number(e.target.value))}
                className="w-full rounded border-gray-300"
              >
                {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((ft) => (
                  <option key={ft} value={ft}>{ft} ft</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Inches</label>
              <select
                value={heightInches}
                onChange={(e) => setHeightInches(Number(e.target.value))}
                className="w-full rounded border-gray-300"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i} value={i}>{i}"</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={updateDimensions}
        className="w-full bg-primary-red text-white py-3 rounded-lg font-medium hover:bg-secondary-red transition-colors"
      >
        Continue to Colors
      </button>
    </div>
  );

  // Render the color selection step
  const renderColorStep = () => (
    <div className="color-step">
      <h3 className="text-lg font-medium mb-4">Step 2: Select Color</h3>

      <div className="mb-4">
        {/* Simple color preview */}
        <div style={{ backgroundColor: selectedColorOption?.value as string || '#ffffff', width: '100%', height: '100px' }}>
          <span>{selectedColorOption?.name || 'White'}</span>
        </div>
      </div>

      <div className="mb-6">
        {/* Simple color samples */}
        <div className="grid grid-cols-3 gap-4">
          {availableColors.map(color => (
            <button
              key={color.id}
              onClick={() => handleConfigChange('color', color.id)}
              className={`w-full h-16 rounded ${selectedOptions.color === color.id ? 'border-2 border-primary-red' : ''}`}
              style={{ backgroundColor: color.value }}
            />
          ))}
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={goToPreviousStep}
          className="w-1/2 bg-gray-200 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
        >
          Back
        </button>
        <button
          onClick={goToNextStep}
          className="w-1/2 bg-primary-red text-white py-3 rounded-lg font-medium hover:bg-secondary-red transition-colors"
        >
          Continue to Options
        </button>
      </div>
    </div>
  );

  // Render the options step
  const renderOptionsStep = () => (
    <div className="options-step">
      <h3 className="text-lg font-medium mb-4">Step 3: Customize Options</h3>

      {/* Slat size */}
      <div className="mb-6">
        <h4 className="text-md font-medium mb-2">Slat Size</h4>
        <div className="grid grid-cols-2 gap-4">
          <button
            className={`border rounded py-2 px-4 text-center ${
              selectedOptions.slatSize === '2inch'
                ? 'bg-primary-red text-white border-primary-red'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => handleConfigChange('slatSize', '2inch')}
          >
            2 Inch
          </button>
          <button
            className={`border rounded py-2 px-4 text-center ${
              selectedOptions.slatSize === '2.5inch'
                ? 'bg-primary-red text-white border-primary-red'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => handleConfigChange('slatSize', '2.5inch')}
          >
            2.5 Inch
          </button>
        </div>
      </div>

      {/* Mount type */}
      <div className="mb-6">
        <h4 className="text-md font-medium mb-2">Mount Type</h4>
        <div className="grid grid-cols-2 gap-4">
          <button
            className={`border rounded py-2 px-4 text-center ${
              selectedOptions.mountType === 'inside'
                ? 'bg-primary-red text-white border-primary-red'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => handleConfigChange('mountType', 'inside')}
          >
            Inside Mount
          </button>
          <button
            className={`border rounded py-2 px-4 text-center ${
              selectedOptions.mountType === 'outside'
                ? 'bg-primary-red text-white border-primary-red'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => handleConfigChange('mountType', 'outside')}
          >
            Outside Mount
          </button>
        </div>
      </div>

      {/* Control type */}
      <div className="mb-6">
        <h4 className="text-md font-medium mb-2">Control Type</h4>
        <div className="grid grid-cols-3 gap-4">
          <button
            className={`border rounded py-2 px-2 text-center text-sm ${
              selectedOptions.controlType === 'standard'
                ? 'bg-primary-red text-white border-primary-red'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => handleConfigChange('controlType', 'standard')}
          >
            Standard
          </button>
          <button
            className={`border rounded py-2 px-2 text-center text-sm ${
              selectedOptions.controlType === 'cordless'
                ? 'bg-primary-red text-white border-primary-red'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => handleConfigChange('controlType', 'cordless')}
          >
            Cordless
          </button>
          <button
            className={`border rounded py-2 px-2 text-center text-sm ${
              selectedOptions.controlType === 'motorized'
                ? 'bg-primary-red text-white border-primary-red'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => handleConfigChange('controlType', 'motorized')}
          >
            Motorized
          </button>
        </div>
      </div>

      {/* Quantity */}
      <div className="mb-6">
        <h4 className="text-md font-medium mb-2">Quantity</h4>
        <div className="flex items-center">
          <button
            className="bg-gray-200 text-gray-700 rounded-l px-3 py-1"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
          >
            -
          </button>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-16 text-center py-1 border-t border-b border-gray-300"
          />
          <button
            className="bg-gray-200 text-gray-700 rounded-r px-3 py-1"
            onClick={() => setQuantity(quantity + 1)}
          >
            +
          </button>
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={goToPreviousStep}
          className="w-1/2 bg-gray-200 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
        >
          Back
        </button>
        <button
          onClick={goToNextStep}
          className="w-1/2 bg-primary-red text-white py-3 rounded-lg font-medium hover:bg-secondary-red transition-colors"
        >
          Continue to Review
        </button>
      </div>
    </div>
  );

  // Render the review step
  const renderReviewStep = () => (
    <div className="review-step">
      <h3 className="text-lg font-medium mb-4">Step 4: Review and Add to Cart</h3>

      <div className="mb-6">
        {/* Simple color preview */}
        <div style={{ backgroundColor: selectedColorOption?.value as string || '#ffffff', width: '100%', height: '100px' }}>
          <span>{selectedColorOption?.name || 'White'}</span>
        </div>

        <div className="mt-2 flex justify-end">
          <button
            onClick={handleToggleFavorite}
            className={`flex items-center px-3 py-1 rounded ${isFavorited ? 'text-white bg-primary-red' : 'text-gray-600 bg-gray-100'}`}
          >
            <svg className="w-4 h-4 mr-1" fill={isFavorited ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {isFavorited ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>

      {/* Configuration Summary */}
      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium mb-3">Configuration Summary</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="font-medium">Dimensions:</span>
            <span>{widthDecimal}" W × {heightDecimal}" H</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Color:</span>
            <span>{selectedColorOption?.name || 'White'}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Slat Size:</span>
            <span>{selectedOptions.slatSize === '2.5inch' ? '2.5 inch' : '2 inch'}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Mount Type:</span>
            <span>{selectedOptions.mountType === 'inside' ? 'Inside Mount' : 'Outside Mount'}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Control Type:</span>
            <span>
              {selectedOptions.controlType === 'standard' ? 'Standard' :
               selectedOptions.controlType === 'cordless' ? 'Cordless' : 'Motorized'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Quantity:</span>
            <span>{quantity}</span>
          </div>
        </div>
      </div>

      {/* Price breakdown */}
      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium mb-3">Price Breakdown</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Base Price:</span>
            <span>${priceBreakdown.basePrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Size Adjustment:</span>
            <span>${priceBreakdown.sizeAdjustment.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Control Type:</span>
            <span>${priceBreakdown.controlTypePrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-medium">
            <span>Total (per unit):</span>
            <span>${priceBreakdown.total.toFixed(2)}</span>
          </div>
          {quantity > 1 && (
            <div className="flex justify-between font-bold pt-2 border-t border-gray-300">
              <span>Total ({quantity} blinds):</span>
              <span>${(priceBreakdown.total * quantity).toFixed(2)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={goToPreviousStep}
          className="w-1/2 bg-gray-200 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleAddToCart}
          className="w-1/2 bg-primary-red text-white py-3 rounded-lg font-medium hover:bg-secondary-red transition-colors"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );

  // Progress indicator
  const renderProgressIndicator = () => {
    const steps = [
      { id: 'dimensions', label: 'Dimensions' },
      { id: 'color', label: 'Color' },
      { id: 'options', label: 'Options' },
      { id: 'review', label: 'Review' }
    ];

    const currentIndex = steps.findIndex(step => step.id === currentStep);

    return (
      <div className="mb-6">
        <div className="flex justify-between items-center">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center relative">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep === step.id
                    ? 'bg-primary-red text-white'
                    : index < currentIndex
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                }`}
              >
                {index < currentIndex ? (
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

              {index < steps.length - 1 && (
                <div className="absolute h-0.5 bg-gray-200 top-4 left-8" style={{ width: '100%' }}>
                  <div
                    className="absolute top-0 left-0 h-full bg-primary-red transition-all duration-300"
                    style={{
                      width: index < currentIndex ? '100%' : index === currentIndex ? '50%' : '0%'
                    }}
                  ></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <AnimationWrapper>
      <div className="mobile-product-configurator px-4 py-6">
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">{product.title}</h2>
        </div>

        {renderProgressIndicator()}

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep === 'dimensions' && renderDimensionsStep()}
            {currentStep === 'color' && renderColorStep()}
            {currentStep === 'options' && renderOptionsStep()}
            {currentStep === 'review' && renderReviewStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </AnimationWrapper>
  );
};

export default MobileProductConfigurator;
