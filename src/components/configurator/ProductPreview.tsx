import React from 'react';
import { Product } from '../../models/Product';

interface ProductPreviewProps {
  product: Product;
  selectedOptions: Record<string, string>;
  colorMap: Record<string, string>;
}

const ProductPreview: React.FC<ProductPreviewProps> = ({
  product,
  selectedOptions,
  colorMap
}) => {
  // Helper to determine if we should show a custom visualization based on options
  const shouldCustomizePreview = (): boolean => {
    // Check if we have color and if it's different from default
    return (
      selectedOptions['Color'] !== undefined &&
      selectedOptions['Color'] !== product.options.find(o => o.name === 'Color')?.selectedValue
    );
  };

  // Get the selected color's hex code
  const getSelectedColorHex = (): string => {
    const selectedColor = selectedOptions['Color'] || '';
    return colorMap[selectedColor] || '#FFFFFF';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="aspect-w-4 aspect-h-3 mb-4 overflow-hidden rounded-md">
        {/* Main product image */}
        <div className="relative group">
          {/* Base product image */}
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover rounded-md"
          />

          {/* Color overlay for visualization - shown only for certain product types */}
          {shouldCustomizePreview() && (
            <div
              className="absolute inset-0 opacity-60 mix-blend-multiply rounded-md"
              style={{ backgroundColor: getSelectedColorHex() }}
            />
          )}

          {/* Hover zoom magnifier */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-black bg-opacity-40 rounded-full p-2">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Additional images */}
      {product.additionalImages && product.additionalImages.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {product.additionalImages.slice(0, 4).map((img, idx) => (
            <div key={idx} className="aspect-w-1 aspect-h-1 overflow-hidden rounded cursor-pointer hover:ring-2 hover:ring-primary-red transition-all">
              <img
                src={img}
                alt={`${product.title} view ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {/* Product visualization description */}
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-700">
          {product.title}
        </h3>

        {shouldCustomizePreview() && (
          <p className="text-sm text-gray-500 mt-1">
            Shown in: <span className="font-medium">{selectedOptions['Color']}</span>
          </p>
        )}

        {/* Display key product features */}
        <div className="mt-2">
          <h4 className="text-xs font-medium text-gray-700">Features:</h4>
          <ul className="mt-1 text-xs text-gray-500 space-y-1">
            {product.features.slice(0, 3).map((feature, idx) => (
              <li key={idx} className="flex items-start">
                <svg className="w-3 h-3 text-primary-red mt-0.5 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProductPreview;
