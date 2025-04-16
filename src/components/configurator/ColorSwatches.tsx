import React from 'react';

interface ColorSwatchesProps {
  colors: string[];
  selectedColor: string;
  onColorSelect: (color: string) => void;
  colorMap: Record<string, string>;
}

const ColorSwatches: React.FC<ColorSwatchesProps> = ({
  colors,
  selectedColor,
  onColorSelect,
  colorMap
}) => {
  return (
    <div className="mt-4">
      <div className="mb-3">
        <h3 className="font-medium text-lg">Select a Color</h3>
        <p className="text-sm text-gray-600">
          Shown: <span className="font-medium">{selectedColor}</span>
        </p>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
        {colors.map(color => (
          <div
            key={color}
            className={`
              relative rounded-md overflow-hidden cursor-pointer
              transform transition-transform duration-150
              ${selectedColor === color ? 'ring-2 ring-primary-red scale-105' : 'hover:scale-105'}
            `}
            onClick={() => onColorSelect(color)}
          >
            {/* Color swatch */}
            <div
              className="w-full h-16 rounded-t-md"
              style={{ backgroundColor: colorMap[color] || color }}
            />

            {/* Color name */}
            <div className="text-xs p-1 text-center bg-white text-gray-800 truncate">
              {color}
            </div>

            {/* Selected indicator */}
            {selectedColor === color && (
              <div className="absolute top-1 right-1 bg-white rounded-full p-0.5">
                <svg
                  className="w-4 h-4 text-primary-red"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ColorSwatches;
