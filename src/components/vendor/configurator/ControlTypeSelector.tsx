import React, { useState } from 'react';

interface ControlType {
  control_id: number;
  name: string;
  description?: string;
  image_url?: string;
  price_adjustment: number;
}

interface SelectedControlType {
  control_id: number;
  is_default: boolean;
  additional_price_adjustment: number;
}

interface ControlTypeSelectorProps {
  controlTypes: ControlType[];
  selectedControlTypes: SelectedControlType[];
  onChange: (selectedControlTypes: SelectedControlType[]) => void;
  onSave: () => void;
  isSaving: boolean;
}

const ControlTypeSelector: React.FC<ControlTypeSelectorProps> = ({
  controlTypes,
  selectedControlTypes,
  onChange,
  onSave,
  isSaving
}) => {
  const [editingPriceId, setEditingPriceId] = useState<number | null>(null);
  const [newPriceAdjustment, setNewPriceAdjustment] = useState<string>('');

  // Check if a control type is selected
  const isControlTypeSelected = (controlId: number) => {
    return selectedControlTypes.some(selected => selected.control_id === controlId);
  };

  // Get a selected control type object
  const getSelectedControlType = (controlId: number) => {
    return selectedControlTypes.find(selected => selected.control_id === controlId);
  };

  // Check if a control type is default
  const isDefaultControlType = (controlId: number) => {
    const selected = getSelectedControlType(controlId);
    return selected ? selected.is_default : false;
  };

  // Get price adjustment for a control type
  const getPriceAdjustment = (controlId: number) => {
    const selected = getSelectedControlType(controlId);
    return selected ? selected.additional_price_adjustment : 0;
  };

  // Get base price adjustment for a control type
  const getBaseControlPrice = (controlId: number) => {
    const controlType = controlTypes.find(ct => ct.control_id === controlId);
    return controlType ? controlType.price_adjustment : 0;
  };

  // Get total price adjustment for a control type
  const getTotalPriceAdjustment = (controlId: number) => {
    return getBaseControlPrice(controlId) + getPriceAdjustment(controlId);
  };

  // Handle toggling a control type selection
  const handleToggleControl = (controlId: number) => {
    if (isControlTypeSelected(controlId)) {
      // If this is the default, don't allow deselecting
      if (isDefaultControlType(controlId) && selectedControlTypes.length > 1) {
        alert('Cannot remove the default control type. Set another control type as default first.');
        return;
      }

      // Remove the control type
      onChange(selectedControlTypes.filter(selected => selected.control_id !== controlId));
    } else {
      // Add the control type
      const isFirst = selectedControlTypes.length === 0;
      onChange([
        ...selectedControlTypes,
        {
          control_id: controlId,
          is_default: isFirst, // First selected control type becomes default
          additional_price_adjustment: 0
        }
      ]);
    }
  };

  // Handle setting a control type as default
  const handleSetDefault = (controlId: number) => {
    onChange(
      selectedControlTypes.map(selected => ({
        ...selected,
        is_default: selected.control_id === controlId
      }))
    );
  };

  // Handle starting price edit
  const handleStartPriceEdit = (controlId: number) => {
    setEditingPriceId(controlId);
    setNewPriceAdjustment(getPriceAdjustment(controlId).toString());
  };

  // Handle saving price adjustment
  const handleSavePriceAdjustment = () => {
    if (editingPriceId === null) return;

    const priceValue = parseFloat(newPriceAdjustment);
    if (isNaN(priceValue)) {
      alert('Please enter a valid price');
      return;
    }

    onChange(
      selectedControlTypes.map(selected => {
        if (selected.control_id === editingPriceId) {
          return {
            ...selected,
            additional_price_adjustment: priceValue
          };
        }
        return selected;
      })
    );

    setEditingPriceId(null);
  };

  // Function to render a control type visual
  const renderControlTypeImage = (controlType: ControlType) => {
    if (controlType.image_url) {
      return (
        <img
          src={controlType.image_url}
          alt={controlType.name}
          className="w-full h-full object-cover"
        />
      );
    }

    // Render a simple visual representation based on control type name
    switch (controlType.name.toLowerCase()) {
      case 'cordless':
        return (
          <div className="w-full h-full flex items-center justify-center">
            <div className="relative h-24 w-40 bg-gray-200 rounded">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-4 bg-gray-400 rounded-b"></div>
              <div className="absolute top-8 inset-x-4 bottom-4 border-b-2 border-x-2 border-gray-400">
                <div className="absolute left-1/2 -translate-x-1/2 bottom-2 w-8 h-3 bg-gray-500 rounded"></div>
              </div>
              <div className="absolute top-5 left-1/2 transform -translate-x-1/2 text-xs text-red-500 font-bold rounded-full bg-white px-1 border border-red-500">NO CORD</div>
            </div>
          </div>
        );
      case 'standard cord':
        return (
          <div className="w-full h-full flex items-center justify-center">
            <div className="relative h-24 w-40 bg-gray-200 rounded">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-4 bg-gray-400 rounded-b"></div>
              <div className="absolute top-8 inset-x-4 bottom-4 border-b-2 border-x-2 border-gray-400">
                <div className="absolute left-1/2 -translate-x-1/2 bottom-2 w-8 h-3 bg-gray-500 rounded"></div>
              </div>
              <div className="absolute top-4 right-4 w-1 bg-gray-600" style={{ height: '70%' }}></div>
              <div className="absolute bottom-3 right-4 w-1 h-4 bg-gray-600 rounded-full"></div>
            </div>
          </div>
        );
      case 'continuous cord loop':
        return (
          <div className="w-full h-full flex items-center justify-center">
            <div className="relative h-24 w-40 bg-gray-200 rounded">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-4 bg-gray-400 rounded-b"></div>
              <div className="absolute top-8 inset-x-4 bottom-4 border-b-2 border-x-2 border-gray-400">
                <div className="absolute left-1/2 -translate-x-1/2 bottom-2 w-8 h-3 bg-gray-500 rounded"></div>
              </div>
              <div className="absolute top-4 right-4 w-1 bg-gray-600 rounded-full" style={{ height: '70%' }}></div>
              <div className="absolute top-4 right-4 w-6 h-6 border-2 border-gray-600 rounded-full border-r-0 border-b-0"></div>
              <div className="absolute bottom-3 right-4 w-1 h-10 bg-gray-600 rounded-full"></div>
            </div>
          </div>
        );
      case 'motorized':
        return (
          <div className="w-full h-full flex items-center justify-center">
            <div className="relative h-24 w-40 bg-gray-200 rounded">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-4 bg-gray-400 rounded-b"></div>
              <div className="absolute top-8 inset-x-4 bottom-4 border-b-2 border-x-2 border-gray-400">
                <div className="absolute left-1/2 -translate-x-1/2 bottom-2 w-8 h-3 bg-gray-500 rounded"></div>
              </div>
              <div className="absolute top-4 right-6 w-10 h-5 bg-white rounded border border-gray-400 flex items-center justify-center">
                <span className="text-xs text-gray-700">⚡ Motor</span>
              </div>
              <div className="absolute top-12 right-7 w-6 h-10 bg-gray-300 rounded border border-gray-400 flex flex-col items-center justify-evenly p-1">
                <div className="w-3 h-2 bg-gray-500 rounded-full"></div>
                <div className="w-3 h-2 bg-gray-500 rounded-full"></div>
                <div className="w-3 h-2 bg-gray-500 rounded-full"></div>
              </div>
            </div>
          </div>
        );
      case 'smart home':
        return (
          <div className="w-full h-full flex items-center justify-center">
            <div className="relative h-24 w-40 bg-gray-200 rounded">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-4 bg-gray-400 rounded-b"></div>
              <div className="absolute top-8 inset-x-4 bottom-4 border-b-2 border-x-2 border-gray-400">
                <div className="absolute left-1/2 -translate-x-1/2 bottom-2 w-8 h-3 bg-gray-500 rounded"></div>
              </div>
              <div className="absolute top-3 right-2 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="absolute top-4 left-3 w-8 h-5 flex flex-col items-center justify-center">
                <div className="w-6 h-3 border border-gray-500 rounded-t-md"></div>
                <div className="w-3 h-3 bg-gray-500"></div>
                <div className="w-5 h-2 bg-gray-500 rounded-b-md"></div>
              </div>
              <div className="absolute bottom-2 left-3 text-[8px] text-blue-700 font-bold">SMART</div>
            </div>
          </div>
        );
      case 'wand':
        return (
          <div className="w-full h-full flex items-center justify-center">
            <div className="relative h-24 w-40 bg-gray-200 rounded">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-4 bg-gray-400 rounded-b"></div>
              <div className="absolute top-8 inset-x-4 bottom-4 border-b-2 border-x-2 border-gray-400">
                <div className="absolute left-1/2 -translate-x-1/2 bottom-2 w-8 h-3 bg-gray-500 rounded"></div>
              </div>
              <div className="absolute top-4 right-10 w-1.5 bg-gray-600" style={{ height: '70%' }}></div>
              <div className="absolute top-4 right-8 h-1.5 w-6 bg-gray-600 rounded-full"></div>
            </div>
          </div>
        );
      default:
        return (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-gray-400">
              {controlType.name}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Control Types</h3>
        <p className="text-sm text-gray-500 mb-4">
          Select the control types this product supports and set their pricing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {controlTypes.map((controlType) => {
          const isSelected = isControlTypeSelected(controlType.control_id);
          const isDefault = isDefaultControlType(controlType.control_id);
          const totalPrice = isSelected ? getTotalPriceAdjustment(controlType.control_id) : controlType.price_adjustment;

          return (
            <div
              key={controlType.control_id}
              className={`border rounded-lg overflow-hidden transition ${
                isSelected
                  ? isDefault
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-green-500'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Control type image/preview */}
              <div className="h-36 bg-gray-100 relative">
                {renderControlTypeImage(controlType)}

                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}

                {/* Default indicator */}
                {isDefault && (
                  <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                    Default
                  </div>
                )}

                {/* Base price indicator */}
                <div className="absolute bottom-2 right-2 bg-white bg-opacity-75 text-gray-800 text-xs rounded px-2 py-1 font-medium">
                  Base: ${controlType.price_adjustment.toFixed(2)}
                </div>
              </div>

              {/* Control type info */}
              <div className="p-4">
                <h4 className="font-medium text-gray-900">{controlType.name}</h4>
                {controlType.description && (
                  <p className="text-sm text-gray-500 mt-1">{controlType.description}</p>
                )}

                {/* Price adjustment (if selected) */}
                {isSelected && (
                  <div className="mt-3">
                    {editingPriceId === controlType.control_id ? (
                      <div className="flex items-center mt-2">
                        <span className="text-gray-500 text-sm mr-2">Additional $</span>
                        <input
                          type="number"
                          value={newPriceAdjustment}
                          onChange={(e) => setNewPriceAdjustment(e.target.value)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded"
                          step="0.01"
                          min="0"
                        />
                        <button
                          onClick={handleSavePriceAdjustment}
                          className="ml-2 text-sm bg-blue-500 text-white px-2 py-1 rounded"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between mt-2">
                        <div>
                          <span className="text-sm">
                            Additional: <span className="font-medium">${getPriceAdjustment(controlType.control_id).toFixed(2)}</span>
                          </span>
                          <div className="text-sm font-medium mt-1">
                            Total: ${totalPrice.toFixed(2)}
                          </div>
                        </div>
                        <button
                          onClick={() => handleStartPriceEdit(controlType.control_id)}
                          className="text-sm text-blue-500 hover:text-blue-700"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex justify-between mt-4">
                  <button
                    onClick={() => handleToggleControl(controlType.control_id)}
                    className={`px-2 py-1 rounded text-sm font-medium ${
                      isSelected
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {isSelected ? 'Remove' : 'Add'}
                  </button>

                  {isSelected && !isDefault && selectedControlTypes.length > 1 && (
                    <button
                      onClick={() => handleSetDefault(controlType.control_id)}
                      className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium hover:bg-blue-200"
                    >
                      Set as Default
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Save button */}
      <div className="flex justify-end mt-6">
        <button
          onClick={onSave}
          disabled={isSaving || selectedControlTypes.length === 0}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Control Types'}
        </button>
      </div>
    </div>
  );
};

export default ControlTypeSelector;
