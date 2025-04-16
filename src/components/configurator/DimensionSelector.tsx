import React from 'react';

interface DimensionValue {
  whole: number;
  fraction: string;
}

interface DimensionSelectorProps {
  width: DimensionValue;
  height: DimensionValue;
  onWidthChange: (width: DimensionValue) => void;
  onHeightChange: (height: DimensionValue) => void;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
}

const DimensionSelector: React.FC<DimensionSelectorProps> = ({
  width,
  height,
  onWidthChange,
  onHeightChange,
  minWidth = 12,
  maxWidth = 96,
  minHeight = 12,
  maxHeight = 96
}) => {
  // Generate an array of numbers for the select dropdown
  const generateNumbers = (min: number, max: number) => {
    return Array.from({ length: max - min + 1 }, (_, i) => i + min);
  };

  // Fractions
  const fractions = ['0', '1/8', '1/4', '3/8', '1/2', '5/8', '3/4', '7/8'];

  return (
    <div className="mt-6">
      <div className="mb-3">
        <h3 className="font-medium text-lg">Enter your dimensions</h3>
        <div className="text-sm text-gray-600 mt-1 flex items-center">
          <svg className="w-4 h-4 text-primary-red mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>Measure to the nearest 1/8 inch</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Width selector */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <label className="block text-sm font-medium text-gray-700 mb-2">Width</label>
          <div className="flex items-center">
            <div className="relative flex-1 mr-2">
              <select
                value={width.whole}
                onChange={(e) => onWidthChange({ ...width, whole: parseInt(e.target.value) })}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-red focus:border-primary-red"
                aria-label="Width (inches)"
              >
                {generateNumbers(minWidth, maxWidth).map(num => (
                  <option key={`width-${num}`} value={num}>{num}"</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
            <div className="relative w-24">
              <select
                value={width.fraction}
                onChange={(e) => onWidthChange({ ...width, fraction: e.target.value })}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-red focus:border-primary-red"
                aria-label="Width (fraction)"
              >
                {fractions.map(frac => (
                  <option key={`width-frac-${frac}`} value={frac}>{frac === '0' ? '0' : frac + '"'}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Min: {minWidth}" | Max: {maxWidth}"
          </p>
        </div>

        {/* Height selector */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <label className="block text-sm font-medium text-gray-700 mb-2">Height</label>
          <div className="flex items-center">
            <div className="relative flex-1 mr-2">
              <select
                value={height.whole}
                onChange={(e) => onHeightChange({ ...height, whole: parseInt(e.target.value) })}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-red focus:border-primary-red"
                aria-label="Height (inches)"
              >
                {generateNumbers(minHeight, maxHeight).map(num => (
                  <option key={`height-${num}`} value={num}>{num}"</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
            <div className="relative w-24">
              <select
                value={height.fraction}
                onChange={(e) => onHeightChange({ ...height, fraction: e.target.value })}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-red focus:border-primary-red"
                aria-label="Height (fraction)"
              >
                {fractions.map(frac => (
                  <option key={`height-frac-${frac}`} value={frac}>{frac === '0' ? '0' : frac + '"'}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Min: {minHeight}" | Max: {maxHeight}"
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mt-4">
        <div className="flex">
          <svg className="w-5 h-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-medium">Need help measuring?</p>
            <p className="mt-1">Check out our <a href="#" className="text-primary-red hover:underline">Measuring Guide</a> for step-by-step instructions.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DimensionSelector;
