import React, { useState, useEffect } from 'react';
import { Product, ProductOption } from '../../models/Product';
import { addToCart } from '../../services/cartService';
import RoomSelection from './RoomSelection';
import MountTypeSelection from './MountTypeSelection';
import ColorSelection from './ColorSelection';
import DimensionsInput from './DimensionsInput';
import OptionsSelection from './OptionsSelection';
import OrderSummary from './OrderSummary';

interface WizardConfiguratorProps {
  product: Product;
}

// Step type definition
type Step = 'room' | 'mount' | 'color' | 'dimensions' | 'options' | 'summary';

// Interface for dimensions
interface Dimension {
  whole: number;
  fraction: string;
}

const WizardConfigurator: React.FC<WizardConfiguratorProps> = ({ product }) => {
  // Define the steps in the wizard
  const steps: Step[] = ['room', 'mount', 'color', 'dimensions', 'options', 'summary'];
  const [currentStep, setCurrentStep] = useState<Step>('room');
  const [stepCompleted, setStepCompleted] = useState<Record<Step, boolean>>({
    room: false,
    mount: false,
    color: false,
    dimensions: false,
    options: false,
    summary: false
  });

  // Step data
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [selectedMount, setSelectedMount] = useState<string>('inside');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [width, setWidth] = useState<Dimension>({ whole: 36, fraction: '0' });
  const [height, setHeight] = useState<Dimension>({ whole: 48, fraction: '0' });
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState<number>(1);
  const [calculatedPrice, setCalculatedPrice] = useState<number>(product.basePrice || 0);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize options from product
  useEffect(() => {
    const initialOptions: Record<string, string> = {};
    product.options.forEach((option: ProductOption) => {
      initialOptions[option.name] = option.selectedValue;
    });
    setSelectedOptions(initialOptions);

    // If there is a color option, set the initial selected color
    const colorOption = product.options.find(opt => opt.name === 'Color');
    if (colorOption && colorOption.selectedValue) {
      setSelectedColor(colorOption.selectedValue.toLowerCase().replace(/\s+/g, ''));
    }
  }, [product]);

  // Organize options by category
  const optionCategories = [
    {
      name: 'Control Type',
      options: product.options.filter(opt => opt.name === 'Control Type')
    },
    {
      name: 'Opacity',
      options: product.options.filter(opt => opt.name === 'Opacity')
    },
    {
      name: 'Cell Type',
      options: product.options.filter(opt => opt.name === 'Cell Type')
    }
  ].filter(category => category.options.length > 0);

  // Calculate price based on selections
  useEffect(() => {
    const calculatePrice = () => {
      setLoading(true);

      // Start with base price
      const basePrice = product.basePrice || 0;
      let price = basePrice;

      // Size-based pricing
      const widthInches = width.whole + (width.fraction === '0' ? 0 : parseFloat(width.fraction));
      const heightInches = height.whole + (height.fraction === '0' ? 0 : parseFloat(height.fraction));
      const sizeMultiplier = (widthInches * heightInches) / (24 * 36);
      price = price * Math.max(1, sizeMultiplier);

      // Option-based pricing
      if (selectedOptions['Control Type'] === 'Motorized') {
        price += 75;
      } else if (selectedOptions['Control Type'] === 'Cordless') {
        price += 30;
      } else if (selectedOptions['Control Type'] === 'Day/Night') {
        price += 40;
      }

      if (selectedOptions['Opacity'] === 'Blackout') {
        price += 20;
      } else if (selectedOptions['Opacity'] === 'Room Darkening') {
        price += 10;
      }

      if (selectedOptions['Cell Type'] === 'Double Cell') {
        price += 15;
      }

      // Round to 2 decimal places
      setCalculatedPrice(Math.round(price * 100) / 100);
      setLoading(false);
    };

    calculatePrice();
  }, [product, width, height, selectedOptions]);

  // Handle room selection
  const handleRoomSelect = (room: string) => {
    setSelectedRoom(room);
    setStepCompleted(prev => ({ ...prev, room: true }));
  };

  // Handle mount type selection
  const handleMountSelect = (mount: string) => {
    setSelectedMount(mount);
    setStepCompleted(prev => ({ ...prev, mount: true }));
  };

  // Handle color selection
  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    // Also update the Color in selectedOptions
    const colorName = product.options
      .find(opt => opt.name === 'Color')?.values
      .find(val => val.toLowerCase().replace(/\s+/g, '') === color);

    if (colorName) {
      setSelectedOptions(prev => ({ ...prev, 'Color': colorName }));
    }

    setStepCompleted(prev => ({ ...prev, color: true }));
  };

  // Handle width change
  const handleWidthChange = (newWidth: Dimension) => {
    setWidth(newWidth);
    checkDimensionsCompleted(newWidth, height);
  };

  // Handle height change
  const handleHeightChange = (newHeight: Dimension) => {
    setHeight(newHeight);
    checkDimensionsCompleted(width, newHeight);
  };

  // Check if dimensions are completed
  const checkDimensionsCompleted = (w: Dimension, h: Dimension) => {
    // Simple validation - consider dimensions completed if both values are set
    if (w.whole > 0 && h.whole > 0) {
      setStepCompleted(prev => ({ ...prev, dimensions: true }));
    }
  };

  // Handle option selection
  const handleOptionSelect = (optionName: string, value: string) => {
    setSelectedOptions(prev => ({ ...prev, [optionName]: value }));
    // Mark options as completed when any option is selected
    setStepCompleted(prev => ({ ...prev, options: true }));
  };

  // Handle quantity change
  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(Math.max(1, newQuantity));
  };

  // Handle adding to cart
  const handleAddToCart = () => {
    if (quantity <= 0) {
      setErrorMessage('Please select a valid quantity');
      return;
    }

    // Convert dimensions to decimal
    const widthDecimal = width.whole + (width.fraction === '0' ? 0 : parseFloat(width.fraction));
    const heightDecimal = height.whole + (height.fraction === '0' ? 0 : parseFloat(height.fraction));

    // Add the mount type to the selected options
    const finalOptions = {
      ...selectedOptions,
      'Mount Type': selectedMount === 'inside' ? 'Inside Mount' : 'Outside Mount'
    };

    // Add to cart
    addToCart(
      product,
      quantity,
      widthDecimal,
      heightDecimal,
      finalOptions
    );

    // Show success message
    alert(`Added ${product.title} to your cart!`);
  };

  // Move to next step
  const goToNextStep = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  // Move to previous step
  const goToPreviousStep = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  // Get step label
  const getStepLabel = (step: Step): string => {
    switch (step) {
      case 'room': return 'Room';
      case 'mount': return 'Mount Type';
      case 'color': return 'Color';
      case 'dimensions': return 'Dimensions';
      case 'options': return 'Options';
      case 'summary': return 'Review';
    }
  };

  // Check if current step can proceed
  const canProceed = () => {
    return stepCompleted[currentStep];
  };

  return (
    <div className="product-configurator">
      <h1 className="text-2xl font-semibold mb-6">{product.title}</h1>

      {/* Wizard Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div
              key={step}
              className={`flex flex-col items-center ${index === steps.length - 1 ? 'flex-1' : 'flex-1 relative'}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                  steps.indexOf(currentStep) >= index
                    ? 'bg-primary-red text-white'
                    : stepCompleted[step]
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                }`}
              >
                {stepCompleted[step] ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>

              <div className="text-xs text-center font-medium">
                {getStepLabel(step)}
              </div>

              {/* Connecting line */}
              {index < steps.length - 1 && (
                <div
                  className={`absolute top-4 left-1/2 w-full h-0.5 ${
                    steps.indexOf(currentStep) > index
                      ? 'bg-primary-red'
                      : 'bg-gray-200'
                  }`}
                ></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          {currentStep === 'room' && (
            <RoomSelection
              selectedRoom={selectedRoom}
              onRoomSelect={handleRoomSelect}
            />
          )}

          {currentStep === 'mount' && (
            <MountTypeSelection
              selectedMount={selectedMount}
              onMountSelect={handleMountSelect}
            />
          )}

          {currentStep === 'color' && (
            <ColorSelection
              selectedColor={selectedColor}
              onColorSelect={handleColorSelect}
            />
          )}

          {currentStep === 'dimensions' && (
            <DimensionsInput
              width={width}
              height={height}
              onWidthChange={handleWidthChange}
              onHeightChange={handleHeightChange}
              mountType={selectedMount}
            />
          )}

          {currentStep === 'options' && (
            <OptionsSelection
              optionCategories={optionCategories}
              selectedOptions={selectedOptions}
              onOptionSelect={handleOptionSelect}
            />
          )}

          {currentStep === 'summary' && (
            <div className="mb-8">
              <h3 className="text-xl font-medium mb-4">Review Your Order</h3>
              <p className="text-gray-600 mb-6">Please review your selections before adding to cart</p>

              <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <h4 className="font-medium">Product Information</h4>
                </div>
                <div className="p-4">
                  <div className="flex">
                    <div className="w-24 h-24 mr-4 flex-shrink-0 overflow-hidden rounded border border-gray-200">
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h5 className="font-medium mb-1">{product.title}</h5>
                      <p className="text-sm text-gray-600">{product.description}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="p-3 bg-gray-50 border-b border-gray-200">
                    <h4 className="font-medium">Room & Mounting</h4>
                  </div>
                  <div className="p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Room:</span>
                        <span className="font-medium">{selectedRoom}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Mount Type:</span>
                        <span className="font-medium">{selectedMount === 'inside' ? 'Inside Mount' : 'Outside Mount'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="p-3 bg-gray-50 border-b border-gray-200">
                    <h4 className="font-medium">Dimensions</h4>
                  </div>
                  <div className="p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Width:</span>
                        <span className="font-medium">{width.whole}{width.fraction === '0' ? '"' : ` ${width.fraction}"`}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Height:</span>
                        <span className="font-medium">{height.whole}{height.fraction === '0' ? '"' : ` ${height.fraction}"`}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
                <div className="p-3 bg-gray-50 border-b border-gray-200">
                  <h4 className="font-medium">Selected Options</h4>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2">
                    <div className="flex justify-between pr-4">
                      <span className="text-gray-600">Color:</span>
                      <span className="font-medium">{selectedOptions['Color'] || 'Not Selected'}</span>
                    </div>
                    {Object.entries(selectedOptions)
                      .filter(([key]) => key !== 'Color')
                      .map(([key, value]) => (
                        <div key={key} className="flex justify-between pr-4">
                          <span className="text-gray-600">{key}:</span>
                          <span className="font-medium">{value}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={goToPreviousStep}
              className={`px-6 py-2 border border-gray-300 rounded font-medium ${
                currentStep === 'room' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
              }`}
              disabled={currentStep === 'room'}
            >
              Previous
            </button>

            {currentStep !== 'summary' ? (
              <button
                onClick={goToNextStep}
                className={`px-6 py-2 bg-primary-red text-white rounded font-medium ${
                  canProceed() ? 'hover:bg-red-700' : 'opacity-50 cursor-not-allowed'
                }`}
                disabled={!canProceed()}
              >
                Next
              </button>
            ) : null}
          </div>
        </div>

        {/* Order Summary - Always visible */}
        <div>
          <OrderSummary
            product={product}
            width={width}
            height={height}
            selectedOptions={selectedOptions}
            calculatedPrice={calculatedPrice}
            loading={loading}
            quantity={quantity}
            onQuantityChange={handleQuantityChange}
            onAddToCart={handleAddToCart}
            errorMessage={errorMessage}
            mountType={selectedMount}
          />
        </div>
      </div>
    </div>
  );
};

export default WizardConfigurator;
