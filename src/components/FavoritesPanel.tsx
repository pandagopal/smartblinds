import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FavoriteItem, getFavorites, removeFromFavorites, updateFavoriteNotes } from '../services/favoritesService';

interface FavoritesPanelProps {
  currentProductId?: string;
  onSelectFavorite?: (favorite: FavoriteItem) => void;
}

const FavoritesPanel: React.FC<FavoritesPanelProps> = ({
  currentProductId,
  onSelectFavorite
}) => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [noteText, setNoteText] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'dimensions'>('recent');

  // Load favorites on component mount
  useEffect(() => {
    loadFavorites();
  }, [currentProductId]);

  // Load favorites from service
  const loadFavorites = () => {
    const allFavorites = getFavorites();

    // Filter out current product if specified
    const filteredFavorites = currentProductId
      ? allFavorites.filter(item => item.productId !== currentProductId)
      : allFavorites;

    setFavorites(filteredFavorites);
  };

  // Handle removing a favorite
  const handleRemoveFavorite = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (window.confirm('Are you sure you want to remove this favorite?')) {
      removeFromFavorites(id);
      loadFavorites();
    }
  };

  // Handle editing notes
  const handleEditNotes = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const favorite = favorites.find(f => f.id === id);
    if (favorite) {
      setNoteText(favorite.notes || '');
      setEditingNotes(id);
    }
  };

  // Save notes
  const handleSaveNotes = (id: string) => {
    updateFavoriteNotes(id, noteText);
    setEditingNotes(null);
    loadFavorites();
  };

  // Handle selecting a favorite
  const handleSelect = (favorite: FavoriteItem) => {
    if (onSelectFavorite) {
      onSelectFavorite(favorite);
    }
  };

  // Filter and sort favorites
  const filteredAndSortedFavorites = favorites.filter(favorite => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      favorite.productTitle.toLowerCase().includes(searchLower) ||
      favorite.colorName.toLowerCase().includes(searchLower) ||
      (favorite.notes && favorite.notes.toLowerCase().includes(searchLower))
    );
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.productTitle.localeCompare(b.productTitle);
      case 'dimensions':
        return (a.width * a.height) - (b.width * b.height);
      case 'recent':
      default:
        return b.timestamp - a.timestamp;
    }
  });

  // Format date from timestamp
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  if (favorites.length === 0) {
    return (
      <div className="favorites-panel bg-white rounded shadow-md p-6 mb-8 text-center">
        <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-600 mt-4">No Favorites Yet</h3>
        <p className="text-gray-500 mt-2">
          Your favorite configurations will appear here.
          <br />
          Use the heart icon to save configurations you like!
        </p>
      </div>
    );
  }

  return (
    <div className="favorites-panel bg-white rounded shadow-md p-4 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">
          My Favorites
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({filteredAndSortedFavorites.length})
          </span>
        </h2>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search favorites..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-8 pl-3 py-1 text-sm border border-gray-300 rounded"
            />
            {searchTerm && (
              <button
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setSearchTerm('')}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'recent' | 'name' | 'dimensions')}
            className="text-sm border border-gray-300 rounded py-1 px-2"
          >
            <option value="recent">Most Recent</option>
            <option value="name">Product Name</option>
            <option value="dimensions">Dimensions</option>
          </select>
        </div>
      </div>

      {filteredAndSortedFavorites.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center text-gray-500">
          No favorites match your search. Try a different search term.
        </div>
      ) : (
        <div className="overflow-auto max-h-96">
          <div className="space-y-4">
            {filteredAndSortedFavorites.map((favorite) => (
              <div
                key={favorite.id}
                className="favorite-item border border-gray-200 rounded-lg overflow-hidden transition-shadow hover:shadow-md bg-white"
              >
                <div
                  className="flex cursor-pointer p-3"
                  onClick={() => setExpandedItem(expandedItem === favorite.id ? null : favorite.id)}
                >
                  <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded overflow-hidden">
                    {favorite.thumbnail ? (
                      <img
                        src={favorite.thumbnail}
                        alt={`${favorite.productTitle} configuration`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div
                          className="w-3/4 h-3/4 rounded"
                          style={{
                            backgroundColor: favorite.colorName.toLowerCase() === 'white' ? '#f5f5f5' :
                                           favorite.colorName.toLowerCase() === 'tan' ? '#d2b48c' :
                                           favorite.colorName.toLowerCase() === 'brown' ? '#8b4513' :
                                           favorite.colorName.toLowerCase() === 'gray' ? '#808080' : '#ffffff',
                            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
                          }}
                        ></div>
                      </div>
                    )}
                  </div>

                  <div className="ml-4 flex-1">
                    <div className="flex justify-between">
                      <h3 className="font-medium text-sm">{favorite.productTitle}</h3>
                      <span className="text-xs text-gray-500">{formatDate(favorite.timestamp)}</span>
                    </div>

                    <div className="mt-1 text-sm">
                      <div className="flex flex-wrap gap-x-4 text-xs text-gray-600">
                        <span>{favorite.width}″ × {favorite.height}″</span>
                        <span>{favorite.colorName}</span>
                        {favorite.slatSize && <span>{favorite.slatSize.replace('inch', ' inch')}</span>}
                      </div>

                      {favorite.notes && (
                        <div className="mt-2 text-xs text-gray-600 line-clamp-1">
                          <span className="font-medium">Notes:</span> {favorite.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="ml-2 flex-shrink-0 flex flex-col justify-between">
                    <button
                      onClick={(e) => handleRemoveFavorite(favorite.id, e)}
                      className="text-gray-400 hover:text-red-500 p-1"
                      title="Remove favorite"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>

                    <button
                      onClick={(e) => handleEditNotes(favorite.id, e)}
                      className="text-gray-400 hover:text-blue-500 p-1"
                      title="Edit notes"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Expanded view */}
                {expandedItem === favorite.id && (
                  <div className="border-t border-gray-200 p-3 bg-gray-50">
                    {/* Notes editing */}
                    {editingNotes === favorite.id ? (
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                        <textarea
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          className="w-full border border-gray-300 rounded p-2 text-sm"
                          rows={3}
                          placeholder="Add notes about this configuration..."
                        ></textarea>
                        <div className="flex justify-end mt-2 space-x-2">
                          <button
                            onClick={() => setEditingNotes(null)}
                            className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveNotes(favorite.id)}
                            className="px-3 py-1 text-xs bg-primary-red text-white hover:bg-secondary-red rounded"
                          >
                            Save Notes
                          </button>
                        </div>
                      </div>
                    ) : (
                      favorite.notes && (
                        <div className="mb-3">
                          <h4 className="text-xs font-medium text-gray-700 mb-1">Notes:</h4>
                          <p className="text-sm text-gray-600 whitespace-pre-line">{favorite.notes}</p>
                        </div>
                      )
                    )}

                    {/* Configuration details */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-3">
                      <div>
                        <span className="text-xs font-medium text-gray-700">Product:</span>
                        <span className="block text-gray-600">{favorite.productTitle}</span>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-700">Color:</span>
                        <span className="block text-gray-600">{favorite.colorName}</span>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-700">Dimensions:</span>
                        <span className="block text-gray-600">{favorite.width}″ × {favorite.height}″</span>
                      </div>
                      {favorite.slatSize && (
                        <div>
                          <span className="text-xs font-medium text-gray-700">Slat Size:</span>
                          <span className="block text-gray-600">{favorite.slatSize.replace('inch', ' inch')}</span>
                        </div>
                      )}
                      {favorite.mountType && (
                        <div>
                          <span className="text-xs font-medium text-gray-700">Mount Type:</span>
                          <span className="block text-gray-600">
                            {favorite.mountType === 'inside' ? 'Inside Mount' : 'Outside Mount'}
                          </span>
                        </div>
                      )}
                      {favorite.controlType && (
                        <div>
                          <span className="text-xs font-medium text-gray-700">Control Type:</span>
                          <span className="block text-gray-600">
                            {favorite.controlType === 'standard' ? 'Standard' :
                            favorite.controlType === 'cordless' ? 'Cordless' : 'Motorized'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-between items-center">
                      <button
                        onClick={() => handleSelect(favorite)}
                        className="text-xs bg-primary-red text-white py-1 px-3 rounded hover:bg-secondary-red transition-colors"
                      >
                        Use This Configuration
                      </button>

                      <Link
                        to={`/product/configure/${favorite.productId}/shared?w=${favorite.width}&h=${favorite.height}&c=${favorite.colorName.toLowerCase().replace(' ', '_')}&slat=${favorite.slatSize || '2inch'}&mount=${favorite.mountType || 'inside'}&control=${favorite.controlType || 'standard'}`}
                        className="text-xs text-primary-red hover:underline"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FavoritesPanel;
