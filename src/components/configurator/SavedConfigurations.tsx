import React, { useState, useEffect } from 'react';
import { Product } from '../../models/Product';

interface SavedConfiguration {
  id: string;
  name: string;
  date: string;
  product: Product;
  options: Record<string, string>;
  width: number;
  height: number;
  quantity: number;
}

interface SavedConfigurationsProps {
  product: Product;
  selectedOptions: Record<string, string>;
  width: number;
  height: number;
  quantity: number;
  onLoadConfiguration: (config: SavedConfiguration) => void;
}

const SavedConfigurations: React.FC<SavedConfigurationsProps> = ({
  product,
  selectedOptions,
  width,
  height,
  quantity,
  onLoadConfiguration
}) => {
  const [savedConfigs, setSavedConfigs] = useState<SavedConfiguration[]>([]);
  const [configName, setConfigName] = useState<string>('');
  const [showSaveForm, setShowSaveForm] = useState<boolean>(false);
  const [showConfigs, setShowConfigs] = useState<boolean>(false);

  // Load saved configurations from localStorage on component mount
  useEffect(() => {
    const loadSavedConfigs = () => {
      const savedConfigsString = localStorage.getItem('savedConfigurations');
      if (savedConfigsString) {
        try {
          const parsedConfigs = JSON.parse(savedConfigsString);
          setSavedConfigs(parsedConfigs || []);
        } catch (error) {
          console.error('Error parsing saved configurations:', error);
          setSavedConfigs([]);
        }
      }
    };

    loadSavedConfigs();
  }, []);

  // Save configurations to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('savedConfigurations', JSON.stringify(savedConfigs));
  }, [savedConfigs]);

  // Handle saving current configuration
  const handleSaveConfiguration = () => {
    if (!configName.trim()) {
      alert('Please enter a name for this configuration');
      return;
    }

    const newConfig: SavedConfiguration = {
      id: Date.now().toString(),
      name: configName.trim(),
      date: new Date().toLocaleDateString(),
      product: product,
      options: { ...selectedOptions },
      width,
      height,
      quantity
    };

    setSavedConfigs([...savedConfigs, newConfig]);
    setConfigName('');
    setShowSaveForm(false);
    alert('Configuration saved successfully!');
  };

  // Handle deleting a saved configuration
  const handleDeleteConfig = (id: string) => {
    if (confirm('Are you sure you want to delete this saved configuration?')) {
      setSavedConfigs(savedConfigs.filter(config => config.id !== id));
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="saved-configurations mt-4">
      <div className="flex justify-between items-center mb-3">
        <button
          className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
          onClick={() => setShowConfigs(!showConfigs)}
        >
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
          {showConfigs ? 'Hide Saved Configurations' : 'View Saved Configurations'}
        </button>
        <button
          className="text-green-600 hover:text-green-800 text-sm flex items-center"
          onClick={() => setShowSaveForm(!showSaveForm)}
        >
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Save Current Configuration
        </button>
      </div>

      {/* Save Configuration Form */}
      {showSaveForm && (
        <div className="border rounded-md p-4 mb-4 bg-gray-50">
          <h4 className="font-medium mb-2">Save Your Configuration</h4>
          <p className="text-sm text-gray-600 mb-3">Give your configuration a name to easily identify it later.</p>

          <div className="mb-3">
            <label htmlFor="configName" className="block text-sm font-medium text-gray-700 mb-1">
              Configuration Name
            </label>
            <input
              type="text"
              id="configName"
              value={configName}
              onChange={(e) => setConfigName(e.target.value)}
              placeholder="e.g., Living Room Blinds"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex space-x-3">
            <button
              className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={handleSaveConfiguration}
            >
              Save
            </button>
            <button
              className="px-3 py-1 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              onClick={() => setShowSaveForm(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Saved Configurations List */}
      {showConfigs && (
        <div className="border rounded-md overflow-hidden mb-4">
          <div className="bg-gray-50 px-4 py-2 border-b">
            <h4 className="font-medium">Your Saved Configurations</h4>
          </div>

          {savedConfigs.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              You don't have any saved configurations yet.
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {savedConfigs.map(config => (
                <li key={config.id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{config.name}</p>
                      <div className="text-sm text-gray-500">
                        <span>{config.product.title}</span>
                        <span className="mx-1">•</span>
                        <span>{config.width}" × {config.height}"</span>
                        <span className="mx-1">•</span>
                        <span>Saved on {formatDate(config.date)}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        <span className="font-medium">Options:</span>
                        {Object.entries(config.options)
                          .filter(([key, value]) => key === 'Color' || key === 'Mount Type')
                          .map(([key, value]) => (
                            <span key={key} className="ml-1">{key}: {value}</span>
                          ))
                        }
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        className="text-blue-600 hover:text-blue-800 p-1"
                        onClick={() => onLoadConfiguration(config)}
                        title="Load this configuration"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button
                        className="text-red-600 hover:text-red-800 p-1"
                        onClick={() => handleDeleteConfig(config.id)}
                        title="Delete this configuration"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default SavedConfigurations;
