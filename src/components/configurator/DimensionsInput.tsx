import React from 'react';

interface Dimension {
  whole: number;
  fraction: string;
}

interface DimensionsInputProps {
  width: Dimension;
  height: Dimension;
  onWidthChange: (width: Dimension) => void;
  onHeightChange: (height: Dimension) => void;
  mountType: string;
}

const DimensionsInput: React.FC<DimensionsInputProps> = ({
  width,
  height,
  onWidthChange,
  onHeightChange,
  mountType
}) => {
  // Fraction options for dropdown
  const fractionOptions = [
    { value: '0', display: '0"' },
    { value: '1/8', display: '1/8"' },
    { value: '1/4', display: '1/4"' },
    { value: '3/8', display: '3/8"' },
    { value: '1/2', display: '1/2"' },
    { value: '5/8', display: '5/8"' },
    { value: '3/4', display: '3/4"' },
    { value: '7/8', display: '7/8"' }
  ];

  // Generate whole number options
  const generateWholeOptions = (min: number, max: number) => {
    return Array.from({ length: max - min + 1 }, (_, i) => i + min);
  };

  // Width and height ranges based on mount type
  const widthRange = mountType === 'inside'
    ? { min: 12, max: 96 }
    : { min: 12, max: 120 };

  const heightRange = mountType === 'inside'
    ? { min: 12, max: 96 }
    : { min: 12, max: 120 };

  return (
    <div className="mb-8">
      <h3 className="text-xl font-medium mb-4">Enter Your Window Measurements</h3>

      <div className="mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <div className="flex">
            <div className="text-blue-500 mr-3 mt-1">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-1">Measuring Tips for {mountType === 'inside' ? 'Inside' : 'Outside'} Mount</h4>
              {mountType === 'inside' ? (
                <ul className="text-sm text-blue-800 list-disc pl-5 space-y-1">
                  <li>Measure the exact inside width and height of your window opening</li>
                  <li>Measure in three places and use the smallest measurement</li>
                  <li>Do not make any deductions - we'll do that for you</li>
                  <li>Round down to the nearest 1/8 inch</li>
                </ul>
              ) : (
                <ul className="text-sm text-blue-800 list-disc pl-5 space-y-1">
                  <li>Measure the width and height of the area you want to cover</li>
                  <li>Add 3" to each side of the window (6" total width) for optimal coverage</li>
                  <li>Add 3" above and 1" below the window (4" total height)</li>
                </ul>
              )}
              <a href="/measure-install" className="inline-block mt-2 text-primary-red text-sm font-medium hover:underline">
                View detailed measuring guide
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="border border-gray-200 rounded-lg p-6">
          <h4 className="font-medium mb-4 flex items-center">
            <span className="bg-primary-red text-white w-6 h-6 rounded-full flex items-center justify-center mr-2 text-sm">1</span>
            Width Measurement
          </h4>

          <div className="mb-4">
            <img
              src="https://ext.same-assets.com/2035588304/1982937456.jpeg"
              alt="Width measurement diagram"
              className="w-full h-auto rounded-lg border border-gray-200"
            />
          </div>

          <div className="flex items-end space-x-2">
            <div className="flex-grow">
              <label htmlFor="width-whole" className="block text-sm font-medium text-gray-700 mb-1">Inches</label>
              <select
                id="width-whole"
                value={width.whole}
                onChange={(e) => onWidthChange({ ...width, whole: parseInt(e.target.value) })}
                className="w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 focus:border-primary-red focus:outline-none focus:ring-primary-red"
                aria-label="Width in whole inches"
              >
                {generateWholeOptions(widthRange.min, widthRange.max).map(num => (
                  <option key={`width-${num}`} value={num}>{num}"</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="width-fraction" className="block text-sm font-medium text-gray-700 mb-1">Fraction</label>
              <select
                id="width-fraction"
                value={width.fraction}
                onChange={(e) => onWidthChange({ ...width, fraction: e.target.value })}
                className="w-28 rounded-md border border-gray-300 py-2 pl-3 pr-10 focus:border-primary-red focus:outline-none focus:ring-primary-red"
                aria-label="Width fraction of inch"
              >
                {fractionOptions.map(option => (
                  <option key={`width-${option.value}`} value={option.value}>{option.display}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-6">
          <h4 className="font-medium mb-4 flex items-center">
            <span className="bg-primary-red text-white w-6 h-6 rounded-full flex items-center justify-center mr-2 text-sm">2</span>
            Height Measurement
          </h4>

          <div className="mb-4">
            <img
              src="https://ext.same-assets.com/2035588304/2983647152.jpeg"
              alt="Height measurement diagram"
              className="w-full h-auto rounded-lg border border-gray-200"
            />
          </div>

          <div className="flex items-end space-x-2">
            <div className="flex-grow">
              <label htmlFor="height-whole" className="block text-sm font-medium text-gray-700 mb-1">Inches</label>
              <select
                id="height-whole"
                value={height.whole}
                onChange={(e) => onHeightChange({ ...height, whole: parseInt(e.target.value) })}
                className="w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 focus:border-primary-red focus:outline-none focus:ring-primary-red"
                aria-label="Height in whole inches"
              >
                {generateWholeOptions(heightRange.min, heightRange.max).map(num => (
                  <option key={`height-${num}`} value={num}>{num}"</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="height-fraction" className="block text-sm font-medium text-gray-700 mb-1">Fraction</label>
              <select
                id="height-fraction"
                value={height.fraction}
                onChange={(e) => onHeightChange({ ...height, fraction: e.target.value })}
                className="w-28 rounded-md border border-gray-300 py-2 pl-3 pr-10 focus:border-primary-red focus:outline-none focus:ring-primary-red"
                aria-label="Height fraction of inch"
              >
                {fractionOptions.map(option => (
                  <option key={`height-${option.value}`} value={option.value}>{option.display}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="text-gray-700 mr-3">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
        <p className="text-sm">
          <span className="font-medium">Not sure about your measurements?</span> Our customer service team can help, or consider our professional measuring service.
        </p>
      </div>
    </div>
  );
};

export default DimensionsInput;
