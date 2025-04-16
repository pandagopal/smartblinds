import React, { useState } from 'react';
import { saveCurrentCart } from '../../services/cartService';

interface SaveCartFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const SaveCartForm: React.FC<SaveCartFormProps> = ({ onSuccess, onCancel }) => {
  const [cartName, setCartName] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    if (!cartName.trim()) {
      setError('Please enter a name for your cart');
      return;
    }

    setLoading(true);
    setError('');

    try {
      saveCurrentCart(cartName, notes.trim() || undefined);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to save cart');
      }
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="font-medium text-lg mb-4">Save Your Cart</h3>

      <form onSubmit={handleSubmit}>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="cartName" className="block text-sm font-medium text-gray-700 mb-1">
            Cart Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="cartName"
            value={cartName}
            onChange={(e) => setCartName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Living Room Blinds"
            disabled={loading}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Notes (Optional)
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            placeholder="Add any notes about this cart..."
            disabled={loading}
          />
        </div>

        <div className="flex justify-end space-x-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            className="px-4 py-2 bg-primary-red text-white rounded hover:bg-red-700 transition-colors"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Cart'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SaveCartForm;
