import React from 'react';
import { ProductOption } from '../../models/Product';

interface OptionSelectorProps {
  option: ProductOption;
  selectedValue: string;
  onChange: (optionName: string, value: string) => void;
  helpText?: string;
}

const OptionSelector: React.FC<OptionSelectorProps> = ({
  option,
  selectedValue,
  onChange,
  helpText
}) => {
  // Map of option types to help texts if not provided
  const defaultHelpTexts: Record<string, string> = {
    'Mount Type': 'Choose how your window treatment will be installed',
    'Control Type': 'Select how you want to operate your blinds',
    'Cell Type': 'Choose the cellular structure that affects insulation',
    'Opacity': 'Determines how much light filters through',
    'Operating System': 'Controls how your shade moves',
    'Smart Home System': 'Choose your preferred smart home integration',
    'Privacy Liner': 'Adds additional privacy and light blocking',
    'Decorative Tape': 'Adds a decorative accent to the front of the blind'
  };

  // Map of option values to descriptions for common options
  const optionValueDescriptions: Record<string, Record<string, string>> = {
    'Mount Type': {
      'Inside Mount': 'Mounts inside the window frame for a clean look',
      'Outside Mount': 'Mounts outside the window frame, covering the entire window'
    },
    'Control Type': {
      'Standard Cord': 'Traditional pull cord operation',
      'Cordless': 'No visible cords for enhanced safety and clean appearance',
      'Motorized': 'Battery-powered or wired motorized operation with remote control',
      'Smart Home Compatible': 'Integrates with smart home systems',
      'Day/Night': 'Two shades in one with separate controls for light filtering and privacy'
    },
    'Opacity': {
      'Light Filtering': 'Allows diffused light to enter the room',
      'Room Darkening': 'Blocks most light for better privacy',
      'Blackout': 'Maximum light blocking for bedrooms and media rooms'
    },
    'Cell Type': {
      'Single Cell': 'Standard insulation properties',
      'Double Cell': 'Enhanced insulation for energy efficiency'
    },
    'Operating System': {
      'Standard': 'Traditional up and down operation',
      'Top Down/Bottom Up': 'Can be operated from the top down or bottom up for flexible light control'
    }
  };

  const showDescriptions = optionValueDescriptions[option.name] !== undefined;
  const text = helpText || defaultHelpTexts[option.name] || `Select your preferred ${option.name.toLowerCase()}`;

  return (
    <div className="my-6 bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="mb-3">
        <h3 className="font-medium text-lg">{option.name}</h3>
        <p className="text-sm text-gray-600 mt-1">{text}</p>
      </div>

      {showDescriptions ? (
        // Radio button selection with descriptions for important options
        <div className="space-y-3">
          {option.values.map(value => (
            <div
              key={value}
              className={`
                border rounded-md p-3 cursor-pointer transition-colors
                ${selectedValue === value
                  ? 'border-primary-red bg-red-50'
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
              onClick={() => onChange(option.name, value)}
            >
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    type="radio"
                    checked={selectedValue === value}
                    onChange={() => onChange(option.name, value)}
                    className="h-4 w-4 text-primary-red border-gray-300 focus:ring-primary-red"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label className="font-medium text-gray-700">{value}</label>
                  <p className="text-gray-500 mt-1">{optionValueDescriptions[option.name][value] || ''}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Dropdown selection for options with many values or less important options
        <div className="relative">
          <select
            value={selectedValue}
            onChange={(e) => onChange(option.name, e.target.value)}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-red focus:border-primary-red"
            aria-label={`Select ${option.name}`}
          >
            {option.values.map(value => (
              <option key={`${option.name}-${value}`} value={value}>{value}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};

export default OptionSelector;
