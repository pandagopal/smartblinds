import React, { useState } from 'react';

interface MountType {
  mount_id: number;
  name: string;
  description?: string;
  image_url?: string;
}

interface SelectedMountType {
  mount_id: number;
  is_default: boolean;
  price_adjustment: number;
}

interface MountTypeSelectorProps {
  mountTypes: MountType[];
  selectedMountTypes: SelectedMountType[];
  onChange: (selectedMountTypes: SelectedMountType[]) => void;
  onSave: () => void;
  isSaving: boolean;
}

const MountTypeSelector: React.FC<MountTypeSelectorProps> = ({
  mountTypes,
  selectedMountTypes,
  onChange,
  onSave,
  isSaving
}) => {
  const [editingPriceId, setEditingPriceId] = useState<number | null>(null);
  const [newPriceAdjustment, setNewPriceAdjustment] = useState<string>('');

  // Check if a mount type is selected
  const isMountTypeSelected = (mountId: number) => {
    return selectedMountTypes.some(selected => selected.mount_id === mountId);
  };

  // Get a selected mount type object
  const getSelectedMountType = (mountId: number) => {
    return selectedMountTypes.find(selected => selected.mount_id === mountId);
  };

  // Check if a mount type is default
  const isDefaultMountType = (mountId: number) => {
    const selected = getSelectedMountType(mountId);
    return selected ? selected.is_default : false;
  };

  // Get price adjustment for a mount type
  const getPriceAdjustment = (mountId: number) => {
    const selected = getSelectedMountType(mountId);
    return selected ? selected.price_adjustment : 0;
  };

  // Handle toggling a mount type selection
  const handleToggleMount = (mountId: number) => {
    if (isMountTypeSelected(mountId)) {
      // If this is the default, don't allow deselecting
      if (isDefaultMountType(mountId) && selectedMountTypes.length > 1) {
        alert('Cannot remove the default mount type. Set another mount type as default first.');
        return;
      }

      // Remove the mount type
      onChange(selectedMountTypes.filter(selected => selected.mount_id !== mountId));
    } else {
      // Add the mount type
      const isFirst = selectedMountTypes.length === 0;
      onChange([
        ...selectedMountTypes,
        {
          mount_id: mountId,
          is_default: isFirst, // First selected mount type becomes default
          price_adjustment: 0
        }
      ]);
    }
  };

  // Handle setting a mount type as default
  const handleSetDefault = (mountId: number) => {
    onChange(
      selectedMountTypes.map(selected => ({
        ...selected,
        is_default: selected.mount_id === mountId
      }))
    );
  };

  // Handle starting price edit
  const handleStartPriceEdit = (mountId: number) => {
    setEditingPriceId(mountId);
    setNewPriceAdjustment(getPriceAdjustment(mountId).toString());
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
      selectedMountTypes.map(selected => {
        if (selected.mount_id === editingPriceId) {
          return {
            ...selected,
            price_adjustment: priceValue
          };
        }
        return selected;
      })
    );

    setEditingPriceId(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Mount Types</h3>
        <p className="text-sm text-gray-500 mb-4">
          Select the mount types this product supports and set their pricing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mountTypes.map((mountType) => {
          const isSelected = isMountTypeSelected(mountType.mount_id);
          const isDefault = isDefaultMountType(mountType.mount_id);

          return (
            <div
              key={mountType.mount_id}
              className={`border rounded-lg overflow-hidden transition ${
                isSelected
                  ? isDefault
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-green-500'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Mount type image/preview */}
              <div className="h-36 bg-gray-100 relative">
                {mountType.image_url ? (
                  <img
                    src={mountType.image_url}
                    alt={mountType.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full p-4">
                    {mountType.name === 'Inside Mount' && (
                      <div className="relative w-32 h-24">
                        <div className="absolute inset-0 border-8 border-gray-400"></div>
                        <div className="absolute inset-x-8 inset-y-4 bg-gray-300"></div>
                      </div>
                    )}
                    {mountType.name === 'Outside Mount' && (
                      <div className="relative w-32 h-24">
                        <div className="absolute inset-4 border-8 border-gray-400"></div>
                        <div className="absolute inset-x-4 inset-y-2 bg-gray-300"></div>
                        <div className="absolute inset-0 border-2 border-gray-600"></div>
                      </div>
                    )}
                    {mountType.name === 'Ceiling Mount' && (
                      <div className="relative w-32 h-24">
                        <div className="absolute top-0 inset-x-0 h-4 bg-gray-600"></div>
                        <div className="absolute top-4 inset-x-4 h-20 border-x-8 border-b-8 border-gray-400"></div>
                        <div className="absolute top-8 inset-x-8 bottom-4 bg-gray-300"></div>
                      </div>
                    )}
                  </div>
                )}

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
              </div>

              {/* Mount type info */}
              <div className="p-4">
                <h4 className="font-medium text-gray-900">{mountType.name}</h4>
                {mountType.description && (
                  <p className="text-sm text-gray-500 mt-1">{mountType.description}</p>
                )}

                {/* Price adjustment (if selected) */}
                {isSelected && (
                  <div className="mt-3">
                    {editingPriceId === mountType.mount_id ? (
                      <div className="flex items-center mt-2">
                        <span className="text-gray-500 text-sm mr-2">$</span>
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
                        <span className="text-sm">
                          Price Adjustment: <span className="font-medium">${getPriceAdjustment(mountType.mount_id).toFixed(2)}</span>
                        </span>
                        <button
                          onClick={() => handleStartPriceEdit(mountType.mount_id)}
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
                    onClick={() => handleToggleMount(mountType.mount_id)}
                    className={`px-2 py-1 rounded text-sm font-medium ${
                      isSelected
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {isSelected ? 'Remove' : 'Add'}
                  </button>

                  {isSelected && !isDefault && selectedMountTypes.length > 1 && (
                    <button
                      onClick={() => handleSetDefault(mountType.mount_id)}
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
          disabled={isSaving || selectedMountTypes.length === 0}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Mount Types'}
        </button>
      </div>
    </div>
  );
};

export default MountTypeSelector;
