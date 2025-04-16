import React, { useState } from 'react';

interface FeaturesListProps {
  title: string;
  items: string[];
  onChange: (items: string[]) => void;
  suggestions?: string[];
  maxItems?: number;
  className?: string;
}

const FeaturesList: React.FC<FeaturesListProps> = ({
  title,
  items,
  onChange,
  suggestions = [],
  maxItems = 10,
  className = ''
}) => {
  const [newItem, setNewItem] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleAddItem = () => {
    if (!newItem.trim()) return;
    if (items.length >= maxItems) {
      alert(`You can add up to ${maxItems} ${title.toLowerCase()}`);
      return;
    }

    // Add new item and clear input
    onChange([...items, newItem.trim()]);
    setNewItem('');
  };

  const handleRemoveItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const handleAddSuggestion = (suggestion: string) => {
    if (items.includes(suggestion) || items.length >= maxItems) return;
    onChange([...items, suggestion]);
  };

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-2">
        <label className="block text-sm font-medium text-gray-700">
          {title}
        </label>
        {suggestions.length > 0 && (
          <button
            type="button"
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {showSuggestions ? 'Hide Suggestions' : 'Show Suggestions'}
          </button>
        )}
      </div>

      {/* Input for new items */}
      <div className="mb-4">
        <div className="flex">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder={`Add a ${title.toLowerCase().slice(0, -1)}...`}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddItem();
              }
            }}
          />
          <button
            type="button"
            onClick={handleAddItem}
            className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700"
            disabled={items.length >= maxItems}
          >
            Add
          </button>
        </div>
        {items.length >= maxItems && (
          <p className="mt-1 text-xs text-amber-600">
            Maximum of {maxItems} {title.toLowerCase()} reached.
          </p>
        )}
      </div>

      {/* Current items */}
      {items.length > 0 ? (
        <ul className="bg-gray-50 p-4 rounded-md mb-4">
          {items.map((item, index) => (
            <li key={index} className="flex justify-between items-center mb-2 last:mb-0 border-b border-gray-200 pb-2 last:border-0">
              <span>{item}</span>
              <button
                type="button"
                onClick={() => handleRemoveItem(index)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 text-sm mb-4">No {title.toLowerCase()} added yet.</p>
      )}

      {/* Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Suggested {title}:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleAddSuggestion(suggestion)}
                disabled={items.includes(suggestion) || items.length >= maxItems}
                className={`text-xs px-3 py-1 rounded-full ${
                  items.includes(suggestion)
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                }`}
              >
                {suggestion}
                {!items.includes(suggestion) && items.length < maxItems && ' +'}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FeaturesList;
