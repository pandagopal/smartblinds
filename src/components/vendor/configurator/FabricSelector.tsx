import React, { useState } from 'react';

interface FabricType {
  fabric_id: number;
  name: string;
  description?: string;
  opacity_range?: string;
}

interface SelectedFabric {
  fabric_id: number;
  color_name: string;
  color_code: string;
  color_image_url?: string;
  is_default: boolean;
  price_adjustment: number;
}

interface FabricSelectorProps {
  fabricTypes: FabricType[];
  selectedFabrics: SelectedFabric[];
  onChange: (selectedFabrics: SelectedFabric[]) => void;
  onSave: () => void;
  isSaving: boolean;
}

// Predefined color palettes for quick selection
const colorPalettes = {
  neutrals: [
    { name: 'White', code: '#FFFFFF' },
    { name: 'Off White', code: '#F5F5F5' },
    { name: 'Ivory', code: '#FFFFF0' },
    { name: 'Beige', code: '#F5F5DC' },
    { name: 'Cream', code: '#FFFDD0' },
    { name: 'Tan', code: '#D2B48C' },
    { name: 'Taupe', code: '#B38B6D' },
    { name: 'Gray', code: '#808080' },
    { name: 'Charcoal', code: '#36454F' },
    { name: 'Black', code: '#000000' }
  ],
  blues: [
    { name: 'Light Blue', code: '#ADD8E6' },
    { name: 'Sky Blue', code: '#87CEEB' },
    { name: 'Cornflower Blue', code: '#6495ED' },
    { name: 'Steel Blue', code: '#4682B4' },
    { name: 'Navy Blue', code: '#000080' }
  ],
  greens: [
    { name: 'Mint Green', code: '#98FB98' },
    { name: 'Sage Green', code: '#9CAF88' },
    { name: 'Lime Green', code: '#32CD32' },
    { name: 'Forest Green', code: '#228B22' },
    { name: 'Olive Green', code: '#808000' }
  ],
  reds: [
    { name: 'Pink', code: '#FFC0CB' },
    { name: 'Rose', code: '#FF007F' },
    { name: 'Red', code: '#FF0000' },
    { name: 'Burgundy', code: '#800020' },
    { name: 'Maroon', code: '#800000' }
  ],
  yellows: [
    { name: 'Light Yellow', code: '#FFFFE0' },
    { name: 'Yellow', code: '#FFFF00' },
    { name: 'Gold', code: '#FFD700' },
    { name: 'Amber', code: '#FFBF00' },
    { name: 'Orange', code: '#FFA500' }
  ],
  purples: [
    { name: 'Lavender', code: '#E6E6FA' },
    { name: 'Lilac', code: '#C8A2C8' },
    { name: 'Violet', code: '#8F00FF' },
    { name: 'Purple', code: '#800080' },
    { name: 'Indigo', code: '#4B0082' }
  ]
};

const FabricSelector: React.FC<FabricSelectorProps> = ({
  fabricTypes,
  selectedFabrics,
  onChange,
  onSave,
  isSaving
}) => {
  const [activeFabricId, setActiveFabricId] = useState<number | null>(null);
  const [colorPalette, setColorPalette] = useState<string>('neutrals');
  const [customColorName, setCustomColorName] = useState<string>('');
  const [customColorCode, setCustomColorCode] = useState<string>('#FFFFFF');
  const [priceAdjustment, setPriceAdjustment] = useState<string>('0');

  // Get selected fabrics for a fabric type
  const getSelectedFabricsForType = (fabricId: number) => {
    return selectedFabrics.filter(fabric => fabric.fabric_id === fabricId);
  };

  // Check if a fabric type has been selected
  const isFabricTypeSelected = (fabricId: number) => {
    return selectedFabrics.some(fabric => fabric.fabric_id === fabricId);
  };

  // Get the default fabric color for a type
  const getDefaultFabricColor = (fabricId: number) => {
    const colors = getSelectedFabricsForType(fabricId);
    return colors.find(color => color.is_default);
  };

  // Handle selecting a fabric type
  const handleSelectFabricType = (fabricId: number) => {
    setActiveFabricId(fabricId);

    // If this fabric type doesn't have any colors yet, reset the form
    if (!isFabricTypeSelected(fabricId)) {
      setCustomColorName('');
      setCustomColorCode('#FFFFFF');
      setPriceAdjustment('0');
    }
  };

  // Handle adding a color from the palette
  const handleAddPaletteColor = (colorName: string, colorCode: string) => {
    if (!activeFabricId) return;

    // Check if this color already exists for this fabric
    const existingColors = getSelectedFabricsForType(activeFabricId);
    if (existingColors.some(color => color.color_code === colorCode)) {
      alert(`A color with code ${colorCode} already exists for this fabric.`);
      return;
    }

    const newColor: SelectedFabric = {
      fabric_id: activeFabricId,
      color_name: colorName,
      color_code: colorCode,
      is_default: existingColors.length === 0, // First color is default
      price_adjustment: 0
    };

    onChange([...selectedFabrics, newColor]);
  };

  // Handle adding a custom color
  const handleAddCustomColor = () => {
    if (!activeFabricId) return;
    if (!customColorName.trim()) {
      alert('Please enter a color name');
      return;
    }

    // Check if this color already exists for this fabric
    const existingColors = getSelectedFabricsForType(activeFabricId);
    if (existingColors.some(color => color.color_code === customColorCode)) {
      alert(`A color with code ${customColorCode} already exists for this fabric.`);
      return;
    }

    const priceValue = parseFloat(priceAdjustment);
    if (isNaN(priceValue)) {
      alert('Please enter a valid price adjustment');
      return;
    }

    const newColor: SelectedFabric = {
      fabric_id: activeFabricId,
      color_name: customColorName.trim(),
      color_code: customColorCode,
      is_default: existingColors.length === 0, // First color is default
      price_adjustment: priceValue
    };

    onChange([...selectedFabrics, newColor]);

    // Reset form
    setCustomColorName('');
    setPriceAdjustment('0');
  };

  // Handle deleting a color
  const handleDeleteColor = (fabricId: number, colorCode: string) => {
    // Check if it's the default color and not the only one
    const colorsForFabric = getSelectedFabricsForType(fabricId);
    const colorToDelete = colorsForFabric.find(c => c.color_code === colorCode);

    if (colorToDelete?.is_default && colorsForFabric.length > 1) {
      alert('Cannot delete the default color. Set another color as default first.');
      return;
    }

    // If we're deleting the last color for a fabric, ask for confirmation
    if (colorsForFabric.length === 1) {
      if (!window.confirm('This is the last color for this fabric. Removing it will also remove the fabric type. Continue?')) {
        return;
      }
    }

    onChange(selectedFabrics.filter(f => !(f.fabric_id === fabricId && f.color_code === colorCode)));
  };

  // Handle setting a color as default
  const handleSetDefaultColor = (fabricId: number, colorCode: string) => {
    onChange(
      selectedFabrics.map(fabric => ({
        ...fabric,
        is_default: fabric.fabric_id === fabricId ?
          fabric.color_code === colorCode : fabric.is_default
      }))
    );
  };

  // Handle editing a color's price
  const handleUpdateColorPrice = (fabricId: number, colorCode: string, newPrice: string) => {
    const priceValue = parseFloat(newPrice);
    if (isNaN(priceValue)) return;

    onChange(
      selectedFabrics.map(fabric => {
        if (fabric.fabric_id === fabricId && fabric.color_code === colorCode) {
          return { ...fabric, price_adjustment: priceValue };
        }
        return fabric;
      })
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Fabrics and Colors</h3>
        <p className="text-sm text-gray-500 mb-4">
          Select the fabric types your product offers and configure available colors.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fabric Types Column */}
        <div className="lg:col-span-1 border-r pr-6">
          <h4 className="font-medium text-gray-900 mb-3">Available Fabrics</h4>
          <div className="space-y-2">
            {fabricTypes.map(fabric => {
              const isSelected = isFabricTypeSelected(fabric.fabric_id);
              const isActive = activeFabricId === fabric.fabric_id;
              const colorCount = getSelectedFabricsForType(fabric.fabric_id).length;
              const defaultColor = getDefaultFabricColor(fabric.fabric_id);

              return (
                <div
                  key={fabric.fabric_id}
                  onClick={() => handleSelectFabricType(fabric.fabric_id)}
                  className={`p-3 border rounded-lg cursor-pointer transition ${
                    isActive ? 'border-blue-500 ring-2 ring-blue-200' :
                    isSelected ? 'border-green-500 bg-green-50' :
                    'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-medium text-gray-900">{fabric.name}</h5>
                      {fabric.opacity_range && (
                        <span className="inline-block mt-1 text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded">
                          {fabric.opacity_range}
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <div className="flex items-center">
                        <span className="text-xs text-gray-500 mr-2">{colorCount} colors</span>
                        {defaultColor && (
                          <div
                            className="w-4 h-4 rounded-full border border-gray-300"
                            style={{ backgroundColor: defaultColor.color_code }}
                          ></div>
                        )}
                      </div>
                    )}
                  </div>
                  {fabric.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{fabric.description}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Colors Column */}
        <div className="lg:col-span-2">
          {activeFabricId ? (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">
                Colors for {fabricTypes.find(f => f.fabric_id === activeFabricId)?.name}
              </h4>

              {/* Color Palette Selector */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Quick-Add from Palette</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {Object.keys(colorPalettes).map(key => (
                    <button
                      key={key}
                      onClick={() => setColorPalette(key)}
                      className={`text-xs px-2 py-1.5 rounded-lg ${
                        colorPalette === key
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-5 sm:grid-cols-5 gap-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                  {colorPalettes[colorPalette as keyof typeof colorPalettes].map(color => (
                    <button
                      key={color.code}
                      onClick={() => handleAddPaletteColor(color.name, color.code)}
                      className="flex flex-col items-center p-1 hover:bg-gray-100 rounded"
                    >
                      <div
                        className="w-8 h-8 rounded-full border border-gray-300 mb-1"
                        style={{ backgroundColor: color.code }}
                      ></div>
                      <span className="text-xs text-gray-700">{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Color Adder */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h5 className="font-medium text-gray-900 mb-3">Add Custom Color</h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Color Name</label>
                    <input
                      type="text"
                      value={customColorName}
                      onChange={(e) => setCustomColorName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Midnight Blue"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Color Code</label>
                    <div className="flex">
                      <input
                        type="color"
                        value={customColorCode}
                        onChange={(e) => setCustomColorCode(e.target.value)}
                        className="h-10 w-10 border border-gray-300 rounded-l-md"
                      />
                      <input
                        type="text"
                        value={customColorCode}
                        onChange={(e) => setCustomColorCode(e.target.value)}
                        className="flex-grow px-3 py-2 border border-gray-300 border-l-0 rounded-r-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="#RRGGBB"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price Adjustment ($)</label>
                    <input
                      type="number"
                      value={priceAdjustment}
                      onChange={(e) => setPriceAdjustment(e.target.value)}
                      step="0.01"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleAddCustomColor}
                    disabled={!customColorName.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    Add Color
                  </button>
                </div>
              </div>

              {/* Selected Colors */}
              <div>
                <h5 className="font-medium text-gray-900 mb-3">Selected Colors</h5>

                {getSelectedFabricsForType(activeFabricId).length === 0 ? (
                  <p className="text-sm text-gray-500">No colors selected for this fabric yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {getSelectedFabricsForType(activeFabricId).map(color => (
                      <div
                        key={color.color_code}
                        className={`p-3 border rounded-lg ${
                          color.is_default ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-full border border-gray-300"
                            style={{ backgroundColor: color.color_code }}
                          ></div>
                          <div className="flex-grow">
                            <div className="flex justify-between">
                              <h6 className="font-medium text-gray-900">{color.color_name}</h6>
                              {color.is_default && (
                                <span className="text-xs text-blue-600 font-medium">Default</span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">{color.color_code}</div>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center">
                            <label className="text-xs text-gray-700 mr-2">Price +$</label>
                            <input
                              type="number"
                              value={color.price_adjustment}
                              onChange={(e) => handleUpdateColorPrice(
                                activeFabricId,
                                color.color_code,
                                e.target.value
                              )}
                              step="0.01"
                              min="0"
                              className="w-16 px-2 py-1 text-xs border border-gray-300 rounded"
                            />
                          </div>

                          <div className="flex space-x-2">
                            {!color.is_default && (
                              <button
                                onClick={() => handleSetDefaultColor(activeFabricId, color.color_code)}
                                className="text-xs text-blue-600 hover:text-blue-800"
                              >
                                Set Default
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteColor(activeFabricId, color.color_code)}
                              className="text-xs text-red-600 hover:text-red-800"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 h-full">
              <p className="text-gray-500 mb-4">Select a fabric type to manage its colors</p>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Save button */}
      <div className="flex justify-end mt-6">
        <button
          onClick={onSave}
          disabled={isSaving || selectedFabrics.length === 0}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Fabrics & Colors'}
        </button>
      </div>
    </div>
  );
};

export default FabricSelector;
