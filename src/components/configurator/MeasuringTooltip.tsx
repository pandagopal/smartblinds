import React, { useState } from 'react';

interface MeasuringTooltipProps {
  mountType: string;
}

const MeasuringTooltip: React.FC<MeasuringTooltipProps> = ({ mountType }) => {
  const [isOpen, setIsOpen] = useState(false);

  const getTooltipContent = () => {
    if (mountType === 'Inside Mount') {
      return (
        <div className="tooltip-content">
          <h4 className="font-medium mb-2">Inside Mount Measuring Tips</h4>
          <ol className="list-decimal list-inside text-sm space-y-2">
            <li>Measure the inside width of your window opening at three points: top, middle, and bottom. Use the narrowest measurement.</li>
            <li>Measure the inside height from the top of the opening to the sill at three points: left, middle, and right. Use the shortest measurement.</li>
            <li>Measure the depth of your window to ensure you have enough space for the blind (minimum 1.5" for most blinds).</li>
            <li>We'll make the necessary deductions (typically 1/2" in width) to ensure proper fit and operation.</li>
          </ol>
          <div className="mt-3 flex justify-center">
            <img
              src="https://ext.same-assets.com/2035588304/inside-mount-measure.jpg"
              alt="Inside mount measuring diagram"
              className="max-w-full h-auto rounded"
            />
          </div>
        </div>
      );
    } else {
      return (
        <div className="tooltip-content">
          <h4 className="font-medium mb-2">Outside Mount Measuring Tips</h4>
          <ol className="list-decimal list-inside text-sm space-y-2">
            <li>Measure the exact width you want the blind to cover. We recommend adding 3-4" to the window opening width (1.5-2" on each side) for optimal light blockage.</li>
            <li>Measure the exact height you want the blind to cover. Add 3-4" to the window height (1.5-2" above the opening and 1.5-2" below).</li>
            <li>For the most attractive appearance, install the blinds at the same height as other window treatments in the room.</li>
            <li>Unlike inside mounts, we make your blinds at the exact measurements you provide.</li>
          </ol>
          <div className="mt-3 flex justify-center">
            <img
              src="https://ext.same-assets.com/2035588304/outside-mount-measure.jpg"
              alt="Outside mount measuring diagram"
              className="max-w-full h-auto rounded"
            />
          </div>
        </div>
      );
    }
  };

  return (
    <div className="measuring-tooltip relative inline-block">
      <button
        type="button"
        className="text-blue-600 hover:text-blue-800 inline-flex items-center"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        <svg
          className="w-5 h-5 mr-1"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
            clipRule="evenodd"
          />
        </svg>
        Measuring Tips
      </button>

      {isOpen && (
        <div className="absolute z-10 bottom-full mb-2 left-0 transform -translate-x-1/4 w-80">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
            {getTooltipContent()}

            <div className="mt-3 flex justify-between">
              <a
                href="#"
                className="text-sm text-blue-600 hover:underline"
                onClick={(e) => {
                  e.preventDefault();
                  window.open('/measuring-guide', '_blank');
                }}
              >
                View Full Guide
              </a>
              <button
                className="text-sm text-gray-500 hover:text-gray-700"
                onClick={() => setIsOpen(false)}
              >
                Close
              </button>
            </div>

            {/* Arrow pointing down */}
            <div className="absolute bottom-[-8px] left-1/4 transform translate-x-1/2 rotate-45 w-4 h-4 bg-white border-r border-b border-gray-200"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeasuringTooltip;
