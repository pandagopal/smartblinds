import React, { useState } from 'react';
import { Product } from '../models/Product';

interface FilterOptions {
  priceRange: [number, number];
  colors: string[];
  materials: string[];
  opacity: string[];
  onSale: boolean;
}

interface ProductFiltersProps {
  products: Product[];
  onFilterChange: (filteredProducts: Product[]) => void;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({ products, onFilterChange }) => {
  const [expanded, setExpanded] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    priceRange: [0, 500],
    colors: [],
    materials: [],
    opacity: [],
    onSale: false,
  });

  // Extract unique values from products
  const allColors = [...new Set(products.map(p => p.attributes?.color).filter(Boolean))];
  const allMaterials = [...new Set(products.map(p => p.attributes?.material).filter(Boolean))];
  const allOpacityLevels = ['Sheer', 'Light Filtering', 'Room Darkening', 'Blackout'];

  // Get min and max price from products
  const priceMin = Math.min(...products.map(p => p.basePrice || 0));
  const priceMax = Math.max(...products.map(p => p.basePrice || 0));

  const handlePriceChange = (min: number, max: number) => {
    const newFilters = {
      ...filters,
      priceRange: [min, max] as [number, number]
    };
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  const handleCheckboxChange = (category: keyof FilterOptions, value: string) => {
    let updatedCategory = [...(filters[category] as string[])];

    if (updatedCategory.includes(value)) {
      updatedCategory = updatedCategory.filter(item => item !== value);
    } else {
      updatedCategory.push(value);
    }

    const newFilters = {
      ...filters,
      [category]: updatedCategory
    };

    setFilters(newFilters);
    applyFilters(newFilters);
  };

  const handleToggleOnSale = () => {
    const newFilters = {
      ...filters,
      onSale: !filters.onSale
    };
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  const applyFilters = (currentFilters: FilterOptions) => {
    const filtered = products.filter(product => {
      // Price filter
      const price = product.basePrice || 0;
      if (price < currentFilters.priceRange[0] || price > currentFilters.priceRange[1]) {
        return false;
      }

      // Sale filter
      if (currentFilters.onSale && !product.salePrice) {
        return false;
      }

      // Color filter
      if (currentFilters.colors.length > 0 &&
          !currentFilters.colors.includes(product.attributes?.color || '')) {
        return false;
      }

      // Material filter
      if (currentFilters.materials.length > 0 &&
          !currentFilters.materials.includes(product.attributes?.material || '')) {
        return false;
      }

      // Opacity filter
      if (currentFilters.opacity.length > 0 &&
          !currentFilters.opacity.includes(product.attributes?.opacity || '')) {
        return false;
      }

      return true;
    });

    onFilterChange(filtered);
  };

  const resetFilters = () => {
    const defaultFilters = {
      priceRange: [priceMin, priceMax],
      colors: [],
      materials: [],
      opacity: [],
      onSale: false,
    };
    setFilters(defaultFilters);
    applyFilters(defaultFilters);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Filters</h3>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-gray-500 hover:text-primary-red"
          aria-expanded={expanded}
          aria-controls="filter-panel"
        >
          {expanded ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </button>
      </div>

      <div id="filter-panel" className={`space-y-6 ${expanded ? 'block' : 'hidden md:block'}`}>
        {/* Price Range Slider */}
        <div>
          <h4 className="font-medium mb-2">Price Range</h4>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">${filters.priceRange[0]}</span>
            <span className="text-sm text-gray-600">${filters.priceRange[1]}</span>
          </div>
          <input
            type="range"
            min={priceMin}
            max={priceMax}
            value={filters.priceRange[0]}
            onChange={(e) => handlePriceChange(Number(e.target.value), filters.priceRange[1])}
            className="w-full mb-2"
            aria-label="Minimum price"
          />
          <input
            type="range"
            min={priceMin}
            max={priceMax}
            value={filters.priceRange[1]}
            onChange={(e) => handlePriceChange(filters.priceRange[0], Number(e.target.value))}
            className="w-full"
            aria-label="Maximum price"
          />
        </div>

        {/* Sale Items */}
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.onSale}
              onChange={handleToggleOnSale}
              className="h-4 w-4 text-primary-red focus:ring-primary-red border-gray-300 rounded mr-2"
            />
            <span className="text-sm">On Sale</span>
          </label>
        </div>

        {/* Colors */}
        <div>
          <h4 className="font-medium mb-2">Colors</h4>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {allColors.map(color => (
              <label key={color} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.colors.includes(color)}
                  onChange={() => handleCheckboxChange('colors', color)}
                  className="h-4 w-4 text-primary-red focus:ring-primary-red border-gray-300 rounded mr-2"
                />
                <span className="text-sm">{color}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Materials */}
        <div>
          <h4 className="font-medium mb-2">Materials</h4>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {allMaterials.map(material => (
              <label key={material} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.materials.includes(material)}
                  onChange={() => handleCheckboxChange('materials', material)}
                  className="h-4 w-4 text-primary-red focus:ring-primary-red border-gray-300 rounded mr-2"
                />
                <span className="text-sm">{material}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Opacity */}
        <div>
          <h4 className="font-medium mb-2">Light Control</h4>
          <div className="space-y-1">
            {allOpacityLevels.map(level => (
              <label key={level} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.opacity.includes(level)}
                  onChange={() => handleCheckboxChange('opacity', level)}
                  className="h-4 w-4 text-primary-red focus:ring-primary-red border-gray-300 rounded mr-2"
                />
                <span className="text-sm">{level}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Reset Button */}
        <button
          onClick={resetFilters}
          className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded text-sm transition"
          aria-label="Reset filters"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
};

export default ProductFilters;
