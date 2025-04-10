import React from 'react';
import { ProductOption } from '../../models/Product';

interface OptionCategory {
  name: string;
  options: ProductOption[];
  description?: string;
}

interface OptionsSelectionProps {
  optionCategories: OptionCategory[];
  selectedOptions: Record<string, string>;
  onOptionSelect: (optionName: string, value: string) => void;
}

const OptionsSelection: React.FC<OptionsSelectionProps> = ({
  optionCategories,
  selectedOptions,
  onOptionSelect
}) => {
  // Helper to generate image path for option visuals
  const getOptionImage = (categoryName: string, optionValue: string): string => {
    // In a real app, these would be actual image paths for each option
    const baseUrl = 'https://ext.same-assets.com/2035588304/';

    const optionImages: Record<string, Record<string, string>> = {
      'Control Type': {
        'Standard Cord': `${baseUrl}3927461834.jpeg`,
        'Cordless': `${baseUrl}9283746123.jpeg`,
        'Motorized': `${baseUrl}2387461234.jpeg`,
        'Top Down/Bottom Up': `${baseUrl}3746123498.jpeg`,
      },
      'Opacity': {
        'Light Filtering': `${baseUrl}8273461234.jpeg`,
        'Room Darkening': `${baseUrl}7234612349.jpeg`,
        'Blackout': `${baseUrl}6234123498.jpeg`,
      }
    };

    return optionImages[categoryName]?.[optionValue] || '';
  };

  return (
    <div className="mb-8">
      <h3 className="text-xl font-medium mb-6">Customize Your Options</h3>

      {optionCategories.map((category) => (
        <div key={category.name} className="mb-10">
          <h4 className="text-lg font-medium mb-3">{category.name}</h4>
          {category.description && (
            <p className="text-gray-600 text-sm mb-4">{category.description}</p>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {category.options
              .filter(option => option.name === category.name)
              .flatMap(option => option.values.map(value => {
                const isSelected = selectedOptions[option.name] === value;
                const optionImage = getOptionImage(category.name, value);

                return (
                  <div
                    key={`${option.name}-${value}`}
                    className={`border rounded-lg overflow-hidden cursor-pointer transition-all ${
                      isSelected
                        ? 'border-primary-red ring-1 ring-red-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => onOptionSelect(option.name, value)}
                    role="button"
                    aria-pressed={isSelected}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onOptionSelect(option.name, value);
                      }
                    }}
                  >
                    {optionImage && (
                      <div className="h-32 overflow-hidden">
                        <img
                          src={optionImage}
                          alt={`${value} ${option.name}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="p-3">
                      <div className="flex items-center">
                        <div
                          className={`w-4 h-4 rounded-full border flex-shrink-0 mr-2 ${
                            isSelected
                              ? 'border-primary-red bg-primary-red'
                              : 'border-gray-400'
                          }`}
                        >
                          {isSelected && (
                            <div className="w-2 h-2 bg-white rounded-full m-auto"></div>
                          )}
                        </div>
                        <div>
                          <h5 className="font-medium">{value}</h5>
                          {optionDescriptions[category.name]?.[value] && (
                            <p className="text-xs text-gray-600 mt-1">
                              {optionDescriptions[category.name][value]}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }))}
          </div>
        </div>
      ))}

      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h4 className="font-medium mb-2">Customization Guide</h4>
        <p className="text-sm text-gray-600 mb-2">
          Each option affects the functionality, appearance, and price of your window covering.
          Review all options carefully to ensure you get the perfect product for your needs.
        </p>
        <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
          <li>Control options impact how you raise and lower your blinds</li>
          <li>Opacity options affect privacy and light filtering</li>
          <li>Some options may affect the final price of your product</li>
        </ul>
      </div>
    </div>
  );
};

// Helper object with descriptions for options
const optionDescriptions: Record<string, Record<string, string>> = {
  'Control Type': {
    'Standard Cord': 'Traditional cord control at an affordable price.',
    'Cordless': 'Enhanced safety for homes with children and pets.',
    'Motorized': 'Convenient remote control operation.',
    'Top Down/Bottom Up': 'Versatile option that allows light from top or bottom.',
    'Day/Night': 'Dual-function shades for maximum light control.',
  },
  'Opacity': {
    'Light Filtering': 'Allows soft light through while maintaining privacy.',
    'Room Darkening': 'Blocks most light for better sleep and privacy.',
    'Blackout': 'Maximum light blockage for bedrooms and media rooms.',
  },
  'Cell Type': {
    'Single Cell': 'Standard insulation at great value.',
    'Double Cell': 'Enhanced insulation for energy efficiency.',
  }
};

export default OptionsSelection;
