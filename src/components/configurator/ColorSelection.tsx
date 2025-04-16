import React, { useState } from 'react';

interface ColorOption {
  id: string;
  name: string;
  hexCode: string;
  image?: string;
  productCode?: string;
  category: string;
}

interface ColorSelectionProps {
  selectedColor: string;
  onColorSelect: (colorId: string) => void;
}

const ColorSelection: React.FC<ColorSelectionProps> = ({ selectedColor, onColorSelect }) => {
  // Color category tabs
  const categories = [
    { id: 'lightFiltering', name: 'Light Filtering Colors' },
    { id: 'roomDarkening', name: 'Room Darkening Colors' },
    { id: 'blackout', name: 'Blackout Colors' },
  ];

  const [activeCategory, setActiveCategory] = useState(categories[0].id);

  // Sample color options - in a real app, these would be fetched from an API
  const colorOptions: ColorOption[] = [
    // Light Filtering Colors
    { id: 'white', name: 'White', hexCode: '#FFFFFF', productCode: 'LF-101', category: 'lightFiltering', image: 'https://ext.same-assets.com/2035588304/1984627145.jpeg' },
    { id: 'alabaster', name: 'Alabaster', hexCode: '#F2F0E6', productCode: 'LF-102', category: 'lightFiltering', image: 'https://ext.same-assets.com/2035588304/1984627145.jpeg' },
    { id: 'ivory', name: 'Ivory', hexCode: '#FFFFF0', productCode: 'LF-103', category: 'lightFiltering', image: 'https://ext.same-assets.com/2035588304/2983745120.jpeg' },
    { id: 'linen', name: 'Linen', hexCode: '#FAF0E6', productCode: 'LF-104', category: 'lightFiltering', image: 'https://ext.same-assets.com/2035588304/2983745120.jpeg' },
    { id: 'sand', name: 'Sand', hexCode: '#E2CA76', productCode: 'LF-105', category: 'lightFiltering', image: 'https://ext.same-assets.com/2035588304/2983745120.jpeg' },
    { id: 'gray', name: 'Gray', hexCode: '#808080', productCode: 'LF-106', category: 'lightFiltering', image: 'https://ext.same-assets.com/2035588304/4182936740.jpeg' },

    // Room Darkening Colors
    { id: 'rdWhite', name: 'White', hexCode: '#F9F9F9', productCode: 'RD-201', category: 'roomDarkening', image: 'https://ext.same-assets.com/2035588304/1984627145.jpeg' },
    { id: 'rdGray', name: 'Gray', hexCode: '#707070', productCode: 'RD-202', category: 'roomDarkening', image: 'https://ext.same-assets.com/2035588304/4182936740.jpeg' },
    { id: 'silver', name: 'Silver', hexCode: '#C0C0C0', productCode: 'RD-203', category: 'roomDarkening', image: 'https://ext.same-assets.com/2035588304/4182936740.jpeg' },
    { id: 'mocha', name: 'Mocha', hexCode: '#8B4513', productCode: 'RD-204', category: 'roomDarkening', image: 'https://ext.same-assets.com/2035588304/1928734651.jpeg' },
    { id: 'navy', name: 'Navy', hexCode: '#000080', productCode: 'RD-205', category: 'roomDarkening', image: 'https://ext.same-assets.com/2035588304/1982736450.jpeg' },

    // Blackout Colors
    { id: 'boWhite', name: 'White', hexCode: '#F5F5F5', productCode: 'BO-301', category: 'blackout', image: 'https://ext.same-assets.com/2035588304/1984627145.jpeg' },
    { id: 'boGray', name: 'Charcoal', hexCode: '#505050', productCode: 'BO-302', category: 'blackout', image: 'https://ext.same-assets.com/2035588304/4182936740.jpeg' },
    { id: 'black', name: 'Black', hexCode: '#121212', productCode: 'BO-303', category: 'blackout', image: 'https://ext.same-assets.com/2035588304/1982736450.jpeg' },
  ];

  // Filter colors by active category
  const filteredColors = colorOptions.filter(color => color.category === activeCategory);

  return (
    <div className="mb-8">
      <h3 className="text-xl font-medium mb-4">Choose Your Color</h3>
      <p className="text-gray-600 mb-6">Select a color that complements your room décor</p>

      {/* Category Tabs */}
      <div className="flex border-b mb-6">
        {categories.map(category => (
          <button
            key={category.id}
            className={`px-4 py-2 font-medium text-sm focus:outline-none ${
              activeCategory === category.id
                ? 'text-primary-red border-b-2 border-primary-red'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setActiveCategory(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Color Swatches */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredColors.map(color => (
          <div
            key={color.id}
            className={`border rounded-lg overflow-hidden cursor-pointer transition-all ${
              selectedColor === color.id
                ? 'border-primary-red ring-1 ring-red-400'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onColorSelect(color.id)}
            role="button"
            aria-pressed={selectedColor === color.id}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onColorSelect(color.id);
              }
            }}
          >
            <div className="h-24 overflow-hidden">
              {color.image ? (
                <img
                  src={color.image}
                  alt={color.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full"
                  style={{ backgroundColor: color.hexCode }}
                ></div>
              )}
            </div>
            <div className="p-2 text-center">
              <div className="font-medium text-sm">{color.name}</div>
              {color.productCode && (
                <div className="text-xs text-gray-500">{color.productCode}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Sample request */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200 flex items-center">
        <div className="text-primary-red mr-3">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16" />
          </svg>
        </div>
        <div>
          <h4 className="font-medium">Want to see colors in person?</h4>
          <p className="text-sm text-gray-600">Order free color samples to ensure you choose the perfect match for your home.</p>
          <button className="mt-2 text-primary-red text-sm font-medium hover:underline">
            Order Free Samples
          </button>
        </div>
      </div>
    </div>
  );
};

export default ColorSelection;
