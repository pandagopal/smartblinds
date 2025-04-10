import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Product } from '../models/Product';
import { SAMPLE_PRODUCTS } from '../models/Product';
import WizardConfigurator from './configurator/WizardConfigurator';
import ProductConfigurator from './ProductConfigurator';

interface EnhancedProductConfiguratorProps {
  product?: Product;
}

const EnhancedProductConfigurator: React.FC<EnhancedProductConfiguratorProps> = ({ product: initialProduct }) => {
  const { id } = useParams<{ id: string }>();
  const [viewMode, setViewMode] = useState<'wizard' | 'classic'>('wizard');

  // Get the product from sample products if not provided
  const product = initialProduct || SAMPLE_PRODUCTS.find(p => p.id === id) || SAMPLE_PRODUCTS[0];

  return (
    <div className="mb-12">
      {/* Mode Switcher */}
      <div className="flex justify-end mb-6">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            type="button"
            onClick={() => setViewMode('wizard')}
            className={`px-4 py-2 text-sm font-medium rounded-l-md focus:z-10 ${
              viewMode === 'wizard'
                ? 'bg-primary-red text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            }`}
            aria-pressed={viewMode === 'wizard'}
          >
            Step-by-Step Wizard
          </button>
          <button
            type="button"
            onClick={() => setViewMode('classic')}
            className={`px-4 py-2 text-sm font-medium rounded-r-md focus:z-10 ${
              viewMode === 'classic'
                ? 'bg-primary-red text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            }`}
            aria-pressed={viewMode === 'classic'}
          >
            Classic View
          </button>
        </div>
      </div>

      {/* Display the selected configurator */}
      {viewMode === 'wizard' ? (
        <WizardConfigurator product={product} />
      ) : (
        <ProductConfigurator product={product} />
      )}
    </div>
  );
};

export default EnhancedProductConfigurator;
