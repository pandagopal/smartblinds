import React, { useState, useEffect } from 'react';
import { Product } from '../models/Product';
import { addToCart } from '../services/cartService';
import { calculatePrice } from '../services/pricingService';
import WindowSimulator from './configurator/WindowSimulator';
import SocialSharing from './configurator/SocialSharing';
import SaveToPDF from './configurator/SaveToPDF';
import InspirationGallery from './configurator/InspirationGallery';
import AugmentedRealityView from './configurator/AugmentedRealityView';
import HomeStyleRecommendations from './configurator/HomeStyleRecommendations';
import ConfigurationComparison from './configurator/ConfigurationComparison';
import MeasurementGuide from './MeasurementGuide';
import { SavedConfiguration, getSavedConfigurations, saveConfiguration } from '../services/configurationService';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

interface ProductConfiguratorProps {
  product: Product;
}

// Define dimension interface
interface Dimension {
  whole: number;
  fraction: string;
}

// Define configurator options interface
interface ConfiguratorOptions {
  colors: Array<{ id: string, name: string, value: string }>;
  slatSizes: Array<{ id: string, name: string, value: number }>;
  mountTypes: Array<{ id: string, name: string }>;
  controlTypes: Array<{ id: string, name: string, priceFactor?: number }>;
  headrailTypes: Array<{ id: string, name: string, priceFactor?: number }>;
}

const ProductConfigurator: React.FC<ProductConfiguratorProps> = ({ product }) => {
  const navigate = useNavigate(); // Add navigation hook

  // Define state for all configuration options
  const [selectedColor, setSelectedColor] = useState<string>('White');
  const [width, setWidth] = useState<Dimension>({ whole: 36, fraction: '0' });
  const [height, setHeight] = useState<Dimension>({ whole: 48, fraction: '0' });
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState<number>(1);
  const [calculatedPrice, setCalculatedPrice] = useState<number>(product.price || 0);
  const [productImage, setProductImage] = useState<string>(product.image || '');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State for configurator options from database
  const [configuratorOptions, setConfiguratorOptions] = useState<ConfiguratorOptions>({
    colors: [],
    slatSizes: [],
    mountTypes: [],
    controlTypes: [],
    headrailTypes: []
  });

  // Opacity for the Window Simulator - derive from selectedOptions
  const [selectedOpacity, setSelectedOpacity] = useState<string>('Light Filtering');

  // New feature states
  const [showMeasurementGuide, setShowMeasurementGuide] = useState<boolean>(false);
  const [showARView, setShowARView] = useState<boolean>(false);
  const [savedConfigurations, setSavedConfigurations] = useState<SavedConfiguration[]>([]);
  const [activeFeature, setActiveFeature] = useState<string | null>(null);

  // Fraction options for measurements
  const fractions = [
    { value: '0', label: '0"' },
    { value: '0.125', label: '1/8"' },
    { value: '0.25', label: '1/4"' },
    { value: '0.375', label: '3/8"' },
    { value: '0.5', label: '1/2"' },
    { value: '0.625', label: '5/8"' },
    { value: '0.75', label: '3/4"' },
    { value: '0.875', label: '7/8"' }
  ];

  // Fetch configurator options from database
  useEffect(() => {
    const fetchConfiguratorOptions = async () => {
      try {
        setLoading(true);
        const options = await api.products.getConfiguratorOptions();
        console.log('Fetched configurator options:', options);
        if (options) {
          setConfiguratorOptions(options);
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching configurator options:', err);
        setError('Failed to load product configuration options. Please try again.');
        // Provide fallback options if API fails
        setConfiguratorOptions({
          colors: [
            { id: 'white', name: 'White', value: '#ffffff' },
            { id: 'cream', name: 'Cream', value: '#fffdd0' },
            { id: 'gray', name: 'Gray', value: '#808080' }
          ],
          slatSizes: [
            { id: '2inch', name: '2 inch', value: 2 },
            { id: '2.5inch', name: '2.5 inch', value: 2.5 }
          ],
          mountTypes: [
            { id: 'inside', name: 'Inside Mount' },
            { id: 'outside', name: 'Outside Mount' }
          ],
          controlTypes: [
            { id: 'standard', name: 'Standard Cord' },
            { id: 'cordless', name: 'Cordless', priceFactor: 1.25 }
          ],
          headrailTypes: [
            { id: 'standard', name: 'Standard Valance' },
            { id: 'deluxe', name: 'Deluxe Valance', priceFactor: 1.15 }
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchConfiguratorOptions();
  }, []);

  // Initialize options from product
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);

    const initialOptions: Record<string, string> = {};
    product.options.forEach(option => {
      initialOptions[option.name] = option.selectedValue || option.values[0];
    });
    setSelectedOptions(initialOptions);

    // Set opacity option if available
    if (initialOptions['Opacity']) {
      setSelectedOpacity(initialOptions['Opacity']);
    }
  }, [product]);

  // Calculate price when options or dimensions change
  useEffect(() => {
    const calculateProductPrice = async () => {
      try {
        // Calculate dimensions
        const widthInches = width.whole + (width.fraction === '0' ? 0 : parseFloat(width.fraction));
        const heightInches = height.whole + (height.fraction === '0' ? 0 : parseFloat(height.fraction));

        // Try to get price from the API
        const priceResponse = await api.products.getPrice(
          product.id,
          widthInches,
          heightInches,
          selectedOptions
        );

        setCalculatedPrice(priceResponse.price);
      } catch (err) {
        console.error("Error calculating price from API:", err);

        // Fallback to client-side calculation if API fails
        let basePrice = product.price || 0;

        // Calculate price based on dimensions
        const widthInches = width.whole + (width.fraction === '0' ? 0 : parseFloat(width.fraction));
        const heightInches = height.whole + (height.fraction === '0' ? 0 : parseFloat(height.fraction));

        // Apply a size multiplier
        const sizeMultiplier = (widthInches * heightInches) / (24 * 36); // Standard size reference
        basePrice = basePrice * Math.max(1, sizeMultiplier * 0.8); // Discount for larger sizes

        // Apply option-based pricing
        if (selectedOptions['Control Type'] === 'Motorized') {
          basePrice += 75; // Premium for motorization
        } else if (selectedOptions['Control Type'] === 'Cordless') {
          basePrice += 30; // Premium for cordless
        }

        if (selectedOptions['Light Blocker'] === 'Full Blackout Kit') {
          basePrice += 25;
        } else if (selectedOptions['Light Blocker'] === 'Side Channels') {
          basePrice += 15;
        }

        if (selectedOptions['Valance Type'] === 'Deluxe') {
          basePrice += 18;
        }

        // Round to 2 decimal places
        setCalculatedPrice(Math.round(basePrice * 100) / 100);
      }
    };

    calculateProductPrice();
  }, [product, selectedOptions, width, height]);

  // Load saved configurations
  useEffect(() => {
    const loadSavedConfigurations = async () => {
      const configs = await getSavedConfigurations();
      setSavedConfigurations(configs);
    };

    loadSavedConfigurations();
  }, []);

  // Handle color selection
  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setSelectedOptions(prev => ({ ...prev, Color: color }));
  };

  // Handle option changes
  const handleOptionChange = (optionName: string, value: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionName]: value
    }));

    // Update opacity for Window Simulator
    if (optionName === 'Opacity') {
      setSelectedOpacity(value);
    }
  };

  // Generate size options (for inches dropdown)
  const generateSizeOptions = (min: number, max: number) => {
    const options = [];
    for (let i = min; i <= max; i++) {
      options.push(i);
    }
    return options;
  };

  // Format dimension for display
  const formatDimension = (dim: Dimension): string => {
    return `${dim.whole}${dim.fraction === '0' ? '' : ` ${fractions.find(f => f.value === dim.fraction)?.label}`}`;
  };

  // Get a delivery estimate
  const getDeliveryEstimate = (): string => {
    const today = new Date();
    const estimatedDays = selectedOptions['expeditedProduction'] ? 7 : 14;
    const estimatedDate = new Date(today);
    estimatedDate.setDate(today.getDate() + estimatedDays);

    return estimatedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Handle add to cart
  const handleAddToCart = () => {
    const widthDecimal = width.whole + (width.fraction === '0' ? 0 : parseFloat(width.fraction));
    const heightDecimal = height.whole + (height.fraction === '0' ? 0 : parseFloat(height.fraction));

    // Combine all the selected options
    const finalOptions = {
      ...selectedOptions,
      'Color': selectedColor
    };

    addToCart(product, quantity, widthDecimal, heightDecimal, finalOptions);
    alert(`Added ${quantity} ${product.title} to cart!`);
  };

  // Add function to handle direct checkout
  const handleDirectCheckout = () => {
    const widthDecimal = width.whole + (width.fraction === '0' ? 0 : parseFloat(width.fraction));
    const heightDecimal = height.whole + (height.fraction === '0' ? 0 : parseFloat(height.fraction));

    // Combine all the selected options
    const finalOptions = {
      ...selectedOptions,
      'Color': selectedColor
    };

    // Add to cart first
    addToCart(product, quantity, widthDecimal, heightDecimal, finalOptions);

    // Then navigate to checkout
    navigate('/checkout');
  };

  // Apply configuration from inspiration gallery
  const handleApplyInspiration = (configuration: Record<string, string>) => {
    // Update options from inspiration
    setSelectedOptions(prev => ({
      ...prev,
      ...configuration
    }));

    // Update color if provided
    if (configuration['Color']) {
      setSelectedColor(configuration['Color']);
    }

    // Update opacity if provided
    if (configuration['Opacity']) {
      setSelectedOpacity(configuration['Opacity']);
    }
  };

  // Save current configuration
  const handleSaveConfiguration = () => {
    const widthDecimal = width.whole + (width.fraction === '0' ? 0 : parseFloat(width.fraction));
    const heightDecimal = height.whole + (height.fraction === '0' ? 0 : parseFloat(height.fraction));

    const config: SavedConfiguration = {
      id: `config-${Date.now()}`,
      name: `${product.title} - ${selectedColor}`,
      date: new Date().toISOString(),
      product: product,
      options: { ...selectedOptions, Color: selectedColor },
      width: widthDecimal,
      height: heightDecimal,
      quantity: quantity
    };

    saveConfiguration(config).then(updatedConfigs => {
      setSavedConfigurations(updatedConfigs);
      alert('Configuration saved successfully!');
    });
  };

  // Load a saved configuration
  const handleLoadConfiguration = (config: SavedConfiguration) => {
    // Update all state variables with the saved configuration
    setSelectedColor(config.options.Color || 'White');

    // Set dimensions
    const wholeWidth = Math.floor(config.width);
    const fractionWidth = (config.width - wholeWidth).toFixed(3);
    setWidth({
      whole: wholeWidth,
      fraction: fractionWidth === '0.000' ? '0' : fractionWidth
    });

    const wholeHeight = Math.floor(config.height);
    const fractionHeight = (config.height - wholeHeight).toFixed(3);
    setHeight({
      whole: wholeHeight,
      fraction: fractionHeight === '0.000' ? '0' : fractionHeight
    });

    // Set options
    setSelectedOptions(config.options);
    setQuantity(config.quantity);

    // Set opacity if available
    if (config.options['Opacity']) {
      setSelectedOpacity(config.options['Opacity']);
    }
  };

  // Apply style recommendation
  const handleApplyRecommendation = (productId: string, color?: string, opacity?: string) => {
    if (color) {
      setSelectedColor(color);
      setSelectedOptions(prev => ({ ...prev, Color: color }));
    }

    if (opacity) {
      setSelectedOpacity(opacity);
      setSelectedOptions(prev => ({ ...prev, Opacity: opacity }));
    }
  };

  // Toggle feature sections
  const toggleFeature = (feature: string) => {
    if (activeFeature === feature) {
      setActiveFeature(null);
    } else {
      setActiveFeature(feature);
    }
  };

  // Get the color hex code for the selected color
  const getSelectedColorHex = (): string => {
    const colorObj = configuratorOptions.colors.find(c => c.name === selectedColor);
    return colorObj ? colorObj.value : '#ffffff';
  };

  return (
    <div className="product-configurator">
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      <div className="mb-4 p-4 bg-gray-50 rounded-md">
        <h1 className="text-xl font-semibold">{product.title}</h1>
        <p className="text-sm text-gray-500">Configure Your Window Treatment</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column - Configuration options (expanded) */}
        <div className="md:col-span-1 bg-white p-4 rounded-md border border-gray-200">
          {/* Window dimensions */}
          <div className="mb-6">
            <h3 className="text-base font-semibold mb-3">Window Measurements (Inches)</h3>
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Width</label>
                <div className="flex">
                  <select
                    value={width.whole}
                    onChange={(e) => setWidth({ ...width, whole: parseInt(e.target.value) })}
                    className="flex-1 mr-1 rounded-l-md border border-gray-300 py-1 px-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-blue-600"
                  >
                    {generateSizeOptions(12, 96).map(num => (
                      <option key={`width-${num}`} value={num}>{num}</option>
                    ))}
                  </select>
                  <select
                    value={width.fraction}
                    onChange={(e) => setWidth({ ...width, fraction: e.target.value })}
                    className="w-16 rounded-r-md border border-gray-300 py-1 px-1 text-sm focus:border-blue-600 focus:outline-none focus:ring-blue-600"
                  >
                    {fractions.map(fraction => (
                      <option key={`width-${fraction.value}`} value={fraction.value}>{fraction.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Height</label>
                <div className="flex">
                  <select
                    value={height.whole}
                    onChange={(e) => setHeight({ ...height, whole: parseInt(e.target.value) })}
                    className="flex-1 mr-1 rounded-l-md border border-gray-300 py-1 px-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-blue-600"
                  >
                    {generateSizeOptions(12, 96).map(num => (
                      <option key={`height-${num}`} value={num}>{num}</option>
                    ))}
                  </select>
                  <select
                    value={height.fraction}
                    onChange={(e) => setHeight({ ...height, fraction: e.target.value })}
                    className="w-16 rounded-r-md border border-gray-300 py-1 px-1 text-sm focus:border-blue-600 focus:outline-none focus:ring-blue-600"
                  >
                    {fractions.map(fraction => (
                      <option key={`height-${fraction.value}`} value={fraction.value}>{fraction.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex items-center text-xs text-gray-600">
              <svg className="w-3 h-3 text-blue-600 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>Measure to the nearest 1/8".</span>
              <button
                onClick={() => setShowMeasurementGuide(true)}
                className="ml-2 text-blue-600 hover:text-blue-800 hover:underline"
              >
                Need help?
              </button>
            </div>
          </div>

          {/* Color options */}
          <div className="mb-6">
            <h3 className="text-base font-semibold mb-3">Select Blinds Colors with Ultra Cordless Rocking</h3>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {configuratorOptions.colors.map((color) => (
                <div
                  key={color.id}
                  className={`
                    border rounded-md p-2 cursor-pointer transition-all
                    ${selectedColor === color.name
                      ? 'border-blue-600'
                      : 'border-gray-300 hover:border-gray-400'
                    }
                  `}
                  onClick={() => handleColorSelect(color.name)}
                >
                  <div
                    className="h-16 rounded-md mb-1 border border-gray-200"
                    style={{ backgroundColor: color.value }}
                  ></div>
                  <p className="text-xs font-medium text-center">{color.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Other product options */}
          {product.options.map(option => (
            option.name !== 'Color' && (
              <div key={option.name} className="mb-6">
                <h3 className="text-base font-semibold mb-3">Choose Your {option.name}</h3>
                <div className="grid grid-cols-3 gap-2">
                  {option.values.map(value => (
                    <div
                      key={value}
                      className={`
                        border rounded-md p-2 cursor-pointer transition-all
                        ${selectedOptions[option.name] === value
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                        }
                      `}
                      onClick={() => handleOptionChange(option.name, value)}
                    >
                      <div className="h-16 flex items-center justify-center mb-1">
                        {/* Placeholder for option images */}
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-xs">{value.substring(0, 2)}</span>
                        </div>
                      </div>
                      <p className="text-xs font-medium text-center">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}

          {/* Window Simulator component */}
          <div className="mb-6">
            <WindowSimulator
              opacity={selectedOpacity}
              color={selectedColor}
              colorHex={getSelectedColorHex()}
              timeOfDay="afternoon"
            />
          </div>
        </div>

        {/* Right column - Product preview and Summary */}
        <div className="md:col-span-1 space-y-6">
          {/* Product Preview Section */}
          <div className="bg-white p-4 rounded-md border border-gray-200">
            <div className="mb-4">
              <div className="aspect-w-1 aspect-h-1 mb-3">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-cover rounded-md"
                />
              </div>
              {product.additionalImages && product.additionalImages.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.additionalImages.slice(0, 4).map((img, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-md overflow-hidden">
                      <img
                        src={img}
                        alt={`${product.title} view ${idx + 1}`}
                        className="w-full h-12 object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mb-4">
              <h3 className="text-base font-semibold mb-1">Product Details</h3>
              <p className="text-sm text-gray-600 mb-3">{product.description}</p>
              <ul className="text-xs text-gray-600 space-y-1">
                {product.features && product.features.slice(0, 3).map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <svg className="w-3 h-3 text-blue-600 mt-0.5 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-4">
              <h3 className="text-base font-semibold mb-3">Share and Export</h3>
              <div className="flex space-x-3">
                <SocialSharing
                  product={product}
                  configOptions={selectedOptions}
                  dimensions={{
                    width: width.whole + (width.fraction === '0' ? 0 : parseFloat(width.fraction)),
                    height: height.whole + (height.fraction === '0' ? 0 : parseFloat(height.fraction))
                  }}
                />

                <SaveToPDF
                  product={product}
                  configOptions={selectedOptions}
                  dimensions={{
                    width: width.whole + (width.fraction === '0' ? 0 : parseFloat(width.fraction)),
                    height: height.whole + (height.fraction === '0' ? 0 : parseFloat(height.fraction))
                  }}
                  price={calculatedPrice}
                  quantity={quantity}
                />
              </div>
            </div>
          </div>

          {/* Summary Section - Now placed under Product Details */}
          <div className="bg-white p-4 rounded-md border border-gray-200">
            <div className="mb-4">
              <div className="flex justify-between items-baseline mb-2">
                <h3 className="text-base font-semibold">Summary</h3>
                <span className="text-sm text-gray-500">ID: {product.id}</span>
              </div>
              <div className="flex justify-between">
                <div className="text-lg font-bold">${calculatedPrice.toFixed(2)}</div>
                <div className="text-xs text-gray-500 text-right">
                  <div>Est. Delivery</div>
                  <div>{getDeliveryEstimate()}</div>
                </div>
              </div>
              <div className="text-xs text-gray-600 mt-1">
                Free shipping & price match guarantee
              </div>
            </div>

            <div className="border-t border-gray-200 py-3 mb-4">
              <h4 className="text-sm font-medium mb-2">Your Selections</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Size:</span>
                  <span>{formatDimension(width)} W × {formatDimension(height)} H</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Color:</span>
                  <span>{selectedColor}</span>
                </div>
                {Object.entries(selectedOptions)
                  .filter(([key]) => key !== 'Color')
                  .map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-600">{key}:</span>
                      <span>{value}</span>
                    </div>
                  ))
                }
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="quantity" className="block text-xs font-medium text-gray-700 mb-1">
                Quantity
              </label>
              <div className="flex items-center">
                <button
                  type="button"
                  className="bg-gray-100 hover:bg-gray-200 p-1 rounded-l-md border border-gray-300"
                  onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                  </svg>
                </button>
                <input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-12 text-center border-t border-b border-gray-300 py-1"
                />
                <button
                  type="button"
                  className="bg-gray-100 hover:bg-gray-200 p-1 rounded-r-md border border-gray-300"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 px-4 rounded font-medium transition-colors mb-3"
            >
              Add to Cart
            </button>

            <button
              onClick={handleDirectCheckout}
              className="w-full bg-primary-red hover:bg-red-700 text-white py-3 px-4 rounded font-medium transition-colors mb-3"
            >
              Checkout Now
            </button>

            <button
              onClick={handleSaveConfiguration}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded font-medium transition-colors mb-3"
            >
              Save Configuration
            </button>

            <div className="text-xs space-y-2">
              <div className="flex items-center">
                <svg className="w-3 h-3 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Free shipping on all orders</span>
              </div>
              <div className="flex items-center">
                <svg className="w-3 h-3 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>100% satisfaction guarantee</span>
              </div>
              <div className="flex items-center">
                <svg className="w-3 h-3 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>SureFit™ measuring guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Features Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Interactive Tools & Recommendations</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Feature Cards */}
          <div
            className={`p-4 border rounded-lg cursor-pointer transition-all ${activeFeature === 'recommendations' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
            onClick={() => toggleFeature('recommendations')}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium">Personalized Recommendations</h3>
              <svg className={`w-5 h-5 text-gray-400 transition-transform ${activeFeature === 'recommendations' ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <p className="text-sm text-gray-600">Get blinds recommendations based on your home's colors and style.</p>
          </div>

          <div
            className={`p-4 border rounded-lg cursor-pointer transition-all ${activeFeature === 'ar-view' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
            onClick={() => toggleFeature('ar-view')}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium">AR Visualizer</h3>
              <svg className={`w-5 h-5 text-gray-400 transition-transform ${activeFeature === 'ar-view' ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <p className="text-sm text-gray-600">See how these blinds look in your own space with augmented reality.</p>
          </div>

          <div
            className={`p-4 border rounded-lg cursor-pointer transition-all ${activeFeature === 'comparison' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
            onClick={() => toggleFeature('comparison')}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium">Cost Comparison</h3>
              <svg className={`w-5 h-5 text-gray-400 transition-transform ${activeFeature === 'comparison' ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <p className="text-sm text-gray-600">Compare different configuration options and their costs.</p>
          </div>

          <div
            className={`p-4 border rounded-lg cursor-pointer transition-all ${showMeasurementGuide ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
            onClick={() => setShowMeasurementGuide(true)}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium">Measurement Guide</h3>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
            <p className="text-sm text-gray-600">Interactive tutorial for perfect window measurements.</p>
          </div>
        </div>

        {/* Feature Content Areas */}
        {activeFeature === 'recommendations' && (
          <div className="mb-8 animate-fadeIn">
            <HomeStyleRecommendations
              product={product}
              onApplyRecommendation={handleApplyRecommendation}
            />
          </div>
        )}

        {activeFeature === 'ar-view' && (
          <div className="mb-8 animate-fadeIn">
            <AugmentedRealityView
              productImage={product.image}
              blindColor={selectedColor}
              blindOpacity={selectedOpacity}
              blindWidth={width.whole + (width.fraction === '0' ? 0 : parseFloat(width.fraction))}
              blindHeight={height.whole + (height.fraction === '0' ? 0 : parseFloat(height.fraction))}
            />
          </div>
        )}

        {activeFeature === 'comparison' && savedConfigurations.length > 0 && (
          <div className="mb-8 animate-fadeIn">
            <ConfigurationComparison
              product={product}
              currentOptions={{ ...selectedOptions, Color: selectedColor }}
              currentWidth={width.whole + (width.fraction === '0' ? 0 : parseFloat(width.fraction))}
              currentHeight={height.whole + (height.fraction === '0' ? 0 : parseFloat(height.fraction))}
              savedConfigurations={savedConfigurations}
              onLoadConfiguration={handleLoadConfiguration}
            />
          </div>
        )}

        {activeFeature === 'comparison' && savedConfigurations.length === 0 && (
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-center text-blue-700">You don't have any saved configurations yet. Save your current configuration to enable comparison.</p>
          </div>
        )}
      </div>

      {/* Inspiration Gallery */}
      <div className="mt-10">
        <InspirationGallery
          product={product}
          onApplyInspiration={handleApplyInspiration}
        />
      </div>

      {/* Measurement Guide Modal */}
      <MeasurementGuide
        isOpen={showMeasurementGuide}
        onClose={() => setShowMeasurementGuide(false)}
      />
    </div>
  );
};

export default ProductConfigurator;
