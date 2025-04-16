import React, { useState } from 'react';

interface Dimensions {
  min_width: number;
  max_width: number;
  min_height: number;
  max_height: number;
  width_increment: number;
  height_increment: number;
}

interface DimensionsConfiguratorProps {
  dimensions: Dimensions;
  onChange: (dimensions: Dimensions) => void;
  onSave: () => void;
  isSaving: boolean;
}

const DimensionsConfigurator: React.FC<DimensionsConfiguratorProps> = ({
  dimensions,
  onChange,
  onSave,
  isSaving
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numericValue = parseFloat(value);

    if (isNaN(numericValue)) return;

    onChange({
      ...dimensions,
      [name]: numericValue
    });
  };

  const formatNumber = (value: number) => {
    // Format to 3 decimal places and trim trailing zeros
    return parseFloat(value.toFixed(3)).toString();
  };

  const validateDimensions = () => {
    if (dimensions.min_width >= dimensions.max_width) {
      return "Minimum width must be less than maximum width";
    }
    if (dimensions.min_height >= dimensions.max_height) {
      return "Minimum height must be less than maximum height";
    }
    if (dimensions.width_increment <= 0) {
      return "Width increment must be greater than 0";
    }
    if (dimensions.height_increment <= 0) {
      return "Height increment must be greater than 0";
    }
    return null;
  };

  const validationError = validateDimensions();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Dimensions</h3>
        <p className="text-sm text-gray-500 mb-4">
          Set the minimum and maximum dimensions your product supports.
          All measurements are in inches.
        </p>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex flex-wrap gap-8">
          {/* Width Section */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-800">Width</h4>

            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-600">Minimum Width (inches)</label>
              <div className="flex items-center">
                <input
                  type="number"
                  name="min_width"
                  value={formatNumber(dimensions.min_width)}
                  onChange={handleInputChange}
                  step="0.125"
                  min="0"
                  className="w-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="ml-2 text-gray-500 text-sm">inches</span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-600">Maximum Width (inches)</label>
              <div className="flex items-center">
                <input
                  type="number"
                  name="max_width"
                  value={formatNumber(dimensions.max_width)}
                  onChange={handleInputChange}
                  step="0.125"
                  min={dimensions.min_width}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="ml-2 text-gray-500 text-sm">inches</span>
              </div>
            </div>
          </div>

          {/* Height Section */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-800">Height</h4>

            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-600">Minimum Height (inches)</label>
              <div className="flex items-center">
                <input
                  type="number"
                  name="min_height"
                  value={formatNumber(dimensions.min_height)}
                  onChange={handleInputChange}
                  step="0.125"
                  min="0"
                  className="w-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="ml-2 text-gray-500 text-sm">inches</span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-600">Maximum Height (inches)</label>
              <div className="flex items-center">
                <input
                  type="number"
                  name="max_height"
                  value={formatNumber(dimensions.max_height)}
                  onChange={handleInputChange}
                  step="0.125"
                  min={dimensions.min_height}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="ml-2 text-gray-500 text-sm">inches</span>
              </div>
            </div>
          </div>
        </div>

        {/* Toggle Advanced Options Button */}
        <div className="mt-6">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 mr-1 transition-transform ${showAdvanced ? 'rotate-90' : ''}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            {showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options'}
          </button>
        </div>

        {/* Advanced Options */}
        {showAdvanced && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="font-medium text-gray-800 mb-4">Incremental Options</h4>

            <div className="flex flex-wrap gap-8">
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">Width Increment (inches)</label>
                <div className="flex items-center">
                  <input
                    type="number"
                    name="width_increment"
                    value={formatNumber(dimensions.width_increment)}
                    onChange={handleInputChange}
                    step="0.001"
                    min="0.001"
                    className="w-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="ml-2 text-gray-500 text-sm">inches</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Typical values: 0.125 (1/8"), 0.25 (1/4"), 0.5 (1/2")
                </p>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">Height Increment (inches)</label>
                <div className="flex items-center">
                  <input
                    type="number"
                    name="height_increment"
                    value={formatNumber(dimensions.height_increment)}
                    onChange={handleInputChange}
                    step="0.001"
                    min="0.001"
                    className="w-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="ml-2 text-gray-500 text-sm">inches</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Typical values: 0.125 (1/8"), 0.25 (1/4"), 0.5 (1/2")
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Visual Representation */}
        <div className="mt-6 border-t border-gray-200 pt-6">
          <h4 className="font-medium text-gray-800 mb-3">Size Range Preview</h4>

          <div className="aspect-[1/0.75] max-w-md relative border border-gray-300 bg-white">
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">
              Full Scale
            </div>

            <div
              className="absolute border-2 border-blue-500 bg-blue-50 bg-opacity-30"
              style={{
                left: `${(dimensions.min_width / 120) * 100}%`,
                top: `${(dimensions.min_height / 120) * 100}%`,
                right: `${100 - ((dimensions.max_width / 120) * 100)}%`,
                bottom: `${100 - ((dimensions.max_height / 120) * 100)}%`,
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white bg-opacity-70 p-1 text-xs text-blue-700 font-medium">
                  {dimensions.min_width}" × {dimensions.min_height}" to {dimensions.max_width}" × {dimensions.max_height}"
                </div>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Visual representation of your product's minimum and maximum dimensions.
          </p>
        </div>
      </div>

      {/* Validation message */}
      {validationError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {validationError}
        </div>
      )}

      {/* Save button */}
      <div className="flex justify-end mt-6">
        <button
          onClick={onSave}
          disabled={isSaving || validationError !== null}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Dimensions'}
        </button>
      </div>
    </div>
  );
};

export default DimensionsConfigurator;
