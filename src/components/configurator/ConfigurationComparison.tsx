import React, { useState, useEffect } from 'react';
import { Product } from '../../models/Product';
import { SavedConfiguration } from '../../services/configurationService';

interface ConfigurationComparisonProps {
  product: Product;
  currentOptions: Record<string, string>;
  currentWidth: number;
  currentHeight: number;
  savedConfigurations: SavedConfiguration[];
  onLoadConfiguration: (config: SavedConfiguration) => void;
}

const ConfigurationComparison: React.FC<ConfigurationComparisonProps> = ({
  product,
  currentOptions,
  currentWidth,
  currentHeight,
  savedConfigurations,
  onLoadConfiguration
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedConfigs, setSelectedConfigs] = useState<SavedConfiguration[]>([]);
  const [showAllOptions, setShowAllOptions] = useState<boolean>(false);

  // Create a configuration object from current options for comparison
  const currentConfig: SavedConfiguration = {
    id: 'current',
    name: 'Current Configuration',
    date: new Date().toISOString(),
    product: product,
    options: currentOptions,
    width: currentWidth,
    height: currentHeight,
    quantity: 1
  };

  // Reset selected configs when opening the comparison
  useEffect(() => {
    if (isOpen) {
      // Start with just the current configuration
      setSelectedConfigs([currentConfig]);
    }
  }, [isOpen, currentOptions, currentWidth, currentHeight]);

  // Toggle a configuration in/out of the comparison
  const toggleConfig = (config: SavedConfiguration) => {
    if (selectedConfigs.some(c => c.id === config.id)) {
      setSelectedConfigs(selectedConfigs.filter(c => c.id !== config.id));
    } else {
      // Limit to 3 configurations total
      if (selectedConfigs.length < 3) {
        setSelectedConfigs([...selectedConfigs, config]);
      } else {
        alert('You can compare up to 3 configurations at once.');
      }
    }
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get color for display
  const getColorDisplay = (options: Record<string, string>): JSX.Element => {
    const color = options['Color'] || 'White';
    const colorMap: Record<string, string> = {
      'White': '#ffffff',
      'Cream': '#fffdd0',
      'Tan': '#d2b48c',
      'Brown': '#964b00',
      'Gray': '#808080',
      'Black': '#000000',
      'Navy': '#000080',
      'Red': '#ff0000',
      'Golden Oak': '#b5651d',
      'Walnut': '#773f1a',
    };

    return (
      <div className="flex items-center">
        <div
          className="w-4 h-4 rounded-full border border-gray-300 mr-2"
          style={{ backgroundColor: colorMap[color] || color }}
        ></div>
        <span>{color}</span>
      </div>
    );
  };

  // Get all unique option keys across configurations
  const getAllOptionKeys = (): string[] => {
    const allKeys = new Set<string>();

    // Add keys from current config
    Object.keys(currentOptions).forEach(key => allKeys.add(key));

    // Add keys from selected configs
    selectedConfigs.forEach(config => {
      Object.keys(config.options).forEach(key => allKeys.add(key));
    });

    // Return sorted array of keys
    return Array.from(allKeys).sort();
  };

  // Determine which options to show
  const getOptionsToShow = (): string[] => {
    const allKeys = getAllOptionKeys();

    // If showing all options, return all keys
    if (showAllOptions) {
      return allKeys;
    }

    // Otherwise return just important keys
    const importantKeys = ['Mount Type', 'Color', 'Control Type', 'Opacity', 'Light Blocker'];
    return allKeys.filter(key => importantKeys.includes(key));
  };

  // Calculate estimated price for a configuration
  const calculatePrice = (config: SavedConfiguration): number => {
    let price = product.price || 0;

    // Size adjustments
    const sizeMultiplier = (config.width * config.height) / (24 * 36);
    price = price * Math.max(1, sizeMultiplier * 0.8);

    // Option adjustments
    if (config.options['Control Type'] === 'Motorized') {
      price += 75;
    } else if (config.options['Control Type'] === 'Cordless') {
      price += 30;
    }

    if (config.options['Light Blocker'] === 'Full Blackout Kit') {
      price += 25;
    } else if (config.options['Light Blocker'] === 'Side Channels') {
      price += 15;
    }

    if (config.options['Valance Type'] === 'Deluxe') {
      price += 18;
    }

    return Math.round(price * 100) / 100;
  };

  return (
    <div className="configuration-comparison mt-4">
      <button
        className="w-full py-2 px-4 border border-blue-600 text-blue-600 rounded-md font-medium hover:bg-blue-50 flex items-center justify-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
        </svg>
        {isOpen ? 'Close Comparison' : 'Compare Configurations'}
      </button>

      {isOpen && (
        <div className="mt-4 border rounded-lg overflow-hidden">
          <div className="bg-gray-50 p-4 border-b">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Compare Configurations</h3>
              <label className="flex items-center text-sm">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={showAllOptions}
                  onChange={() => setShowAllOptions(!showAllOptions)}
                />
                Show All Options
              </label>
            </div>

            {savedConfigurations.length === 0 ? (
              <div className="mt-2 text-sm text-gray-600">
                You don't have any saved configurations to compare. Save a configuration first.
              </div>
            ) : (
              <div className="mt-2 text-sm">
                <p>Select up to 3 configurations to compare side by side:</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {savedConfigurations.map(config => (
                    <button
                      key={config.id}
                      className={`px-3 py-1 rounded-full text-xs font-medium
                        ${selectedConfigs.some(c => c.id === config.id)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        }`}
                      onClick={() => toggleConfig(config)}
                    >
                      {config.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Comparison Table */}
          <div className="p-4 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left pb-2 pr-2 font-medium text-sm">Feature</th>
                  {selectedConfigs.map(config => (
                    <th key={config.id} className="text-left pb-2 px-2 font-medium text-sm min-w-[180px]">
                      {config.id === 'current' ? 'Current Configuration' : config.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Basic info */}
                <tr className="border-b">
                  <td className="py-2 pr-2 text-sm font-medium text-gray-700">Dimensions</td>
                  {selectedConfigs.map(config => (
                    <td key={config.id} className="py-2 px-2 text-sm">
                      {config.width}" × {config.height}"
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="py-2 pr-2 text-sm font-medium text-gray-700">Price</td>
                  {selectedConfigs.map(config => (
                    <td key={config.id} className="py-2 px-2 text-sm font-medium">
                      ${calculatePrice(config).toFixed(2)}
                    </td>
                  ))}
                </tr>

                {/* Options */}
                {getOptionsToShow().map(optionKey => (
                  <tr key={optionKey} className="border-b">
                    <td className="py-2 pr-2 text-sm font-medium text-gray-700">{optionKey}</td>
                    {selectedConfigs.map(config => (
                      <td key={config.id} className="py-2 px-2 text-sm">
                        {optionKey === 'Color'
                          ? getColorDisplay(config.options)
                          : config.options[optionKey] || '-'
                        }
                      </td>
                    ))}
                  </tr>
                ))}

                {/* Date created */}
                <tr className="border-b">
                  <td className="py-2 pr-2 text-sm font-medium text-gray-700">Date Saved</td>
                  {selectedConfigs.map(config => (
                    <td key={config.id} className="py-2 px-2 text-sm text-gray-600">
                      {config.id === 'current' ? 'Current session' : formatDate(config.date)}
                    </td>
                  ))}
                </tr>

                {/* Actions */}
                <tr>
                  <td className="pt-3 pr-2"></td>
                  {selectedConfigs.map(config => (
                    <td key={config.id} className="pt-3 px-2 text-sm">
                      {config.id !== 'current' && (
                        <button
                          className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                          onClick={() => onLoadConfiguration(config)}
                        >
                          Load This Configuration
                        </button>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfigurationComparison;
