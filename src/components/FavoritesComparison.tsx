import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FavoriteItem, getFavorites, removeFromFavorites } from '../services/favoritesService';

interface FavoritesComparisonProps {
  onClose: () => void;
  currentProductId?: string;
}

const FavoritesComparison: React.FC<FavoritesComparisonProps> = ({ onClose, currentProductId }) => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [selectedFavorites, setSelectedFavorites] = useState<FavoriteItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const maxCompareItems = 3;

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

  // Handle item selection for comparison
  const toggleSelectFavorite = (favorite: FavoriteItem) => {
    if (selectedFavorites.some(item => item.id === favorite.id)) {
      // If already selected, remove it
      setSelectedFavorites(selectedFavorites.filter(item => item.id !== favorite.id));
    } else if (selectedFavorites.length < maxCompareItems) {
      // If not selected and we haven't reached the max, add it
      setSelectedFavorites([...selectedFavorites, favorite]);
    }
  };

  // Handle removing a favorite
  const handleRemoveFavorite = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (window.confirm('Are you sure you want to remove this favorite?')) {
      removeFromFavorites(id);
      loadFavorites();
      // Also remove from selected if it was selected
      setSelectedFavorites(selectedFavorites.filter(item => item.id !== id));
    }
  };

  // Filter favorites based on search term
  const filteredFavorites = favorites.filter(favorite => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      favorite.productTitle.toLowerCase().includes(searchLower) ||
      favorite.colorName.toLowerCase().includes(searchLower)
    );
  });

  // Get all specification keys to display in comparison
  const getAllSpecificationKeys = () => {
    const keysSet = new Set<string>();

    // Add common specifications
    keysSet.add('Dimensions');
    keysSet.add('Color');
    keysSet.add('Slat Size');
    keysSet.add('Mount Type');
    keysSet.add('Control Type');

    return Array.from(keysSet);
  };

  // Get specification value based on key
  const getSpecValue = (favorite: FavoriteItem, key: string): string => {
    switch (key) {
      case 'Dimensions':
        return `${favorite.width}″ × ${favorite.height}″`;
      case 'Color':
        return favorite.colorName;
      case 'Slat Size':
        return favorite.slatSize
          ? favorite.slatSize.replace('inch', ' inch')
          : 'Standard (2 inch)';
      case 'Mount Type':
        return favorite.mountType
          ? favorite.mountType === 'inside' ? 'Inside Mount' : 'Outside Mount'
          : 'Inside Mount';
      case 'Control Type':
        return favorite.controlType
          ? favorite.controlType === 'standard' ? 'Standard'
            : favorite.controlType === 'cordless' ? 'Cordless'
            : 'Motorized'
          : 'Standard';
      default:
        return '';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-auto"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-medium">Compare Favorites</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 p-1"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4 flex flex-col h-full">
          {selectedFavorites.length === 0 ? (
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-gray-500">Select up to {maxCompareItems} configurations to compare</p>
            </div>
          ) : (
            <div className="mb-6 overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-3 px-4 border-b border-gray-200 text-left text-sm font-medium text-gray-700 w-1/4">
                      Specifications
                    </th>
                    {selectedFavorites.map((favorite) => (
                      <th key={favorite.id} className="py-3 px-4 border-b border-gray-200 text-center">
                        <div className="flex flex-col items-center">
                          <div className="h-16 w-16 mb-2 bg-gray-100 rounded-lg overflow-hidden">
                            {favorite.thumbnail ? (
                              <img
                                src={favorite.thumbnail}
                                alt={favorite.productTitle}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div
                                className="w-full h-full"
                                style={{
                                  backgroundColor: favorite.colorName.toLowerCase() === 'white' ? '#f5f5f5' :
                                                  favorite.colorName.toLowerCase() === 'tan' ? '#d2b48c' :
                                                  favorite.colorName.toLowerCase() === 'brown' ? '#8b4513' :
                                                  favorite.colorName.toLowerCase() === 'gray' ? '#808080' : '#ffffff'
                                }}
                              ></div>
                            )}
                          </div>
                          <h3 className="text-sm font-medium">{favorite.productTitle}</h3>
                          <button
                            className="mt-2 text-xs text-gray-500 hover:text-red-500"
                            onClick={() => setSelectedFavorites(selectedFavorites.filter(item => item.id !== favorite.id))}
                          >
                            Remove
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {getAllSpecificationKeys().map((key) => (
                    <tr key={key}>
                      <td className="py-3 px-4 border-b border-gray-200 text-sm font-medium">
                        {key}
                      </td>
                      {selectedFavorites.map((favorite) => (
                        <td key={favorite.id} className="py-3 px-4 border-b border-gray-200 text-center text-sm">
                          {getSpecValue(favorite, key)}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {/* Notes row */}
                  <tr>
                    <td className="py-3 px-4 border-b border-gray-200 text-sm font-medium">
                      Notes
                    </td>
                    {selectedFavorites.map((favorite) => (
                      <td key={favorite.id} className="py-3 px-4 border-b border-gray-200 text-sm">
                        <div className="max-h-24 overflow-y-auto text-left">
                          {favorite.notes || <span className="text-gray-400 italic">No notes</span>}
                        </div>
                      </td>
                    ))}
                  </tr>
                  {/* Actions row */}
                  <tr>
                    <td className="py-3 px-4 text-sm font-medium"></td>
                    {selectedFavorites.map((favorite) => (
                      <td key={favorite.id} className="py-3 px-4 text-center">
                        <Link
                          to={`/product/configure/${favorite.productId}/shared?w=${favorite.width}&h=${favorite.height}&c=${favorite.colorName.toLowerCase().replace(' ', '_')}&slat=${favorite.slatSize || '2inch'}&mount=${favorite.mountType || 'inside'}&control=${favorite.controlType || 'standard'}`}
                          className="bg-primary-red text-white py-2 px-4 rounded text-sm hover:bg-secondary-red transition-colors inline-block"
                          onClick={onClose}
                        >
                          Select This Option
                        </Link>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Select Configurations to Compare</h3>
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
            </div>

            {favorites.length === 0 ? (
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No saved favorites yet</p>
              </div>
            ) : filteredFavorites.length === 0 ? (
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No favorites match your search</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-64 overflow-y-auto p-2">
                {filteredFavorites.map((favorite) => (
                  <motion.div
                    key={favorite.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`favorite-item border rounded-lg overflow-hidden cursor-pointer transition-colors ${
                      selectedFavorites.some(item => item.id === favorite.id)
                        ? 'border-primary-red bg-red-50'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                    onClick={() => toggleSelectFavorite(favorite)}
                  >
                    <div className="flex p-3">
                      <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded overflow-hidden">
                        {favorite.thumbnail ? (
                          <img
                            src={favorite.thumbnail}
                            alt={`${favorite.productTitle} configuration`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <div
                              className="w-full h-full"
                              style={{
                                backgroundColor: favorite.colorName.toLowerCase() === 'white' ? '#f5f5f5' :
                                               favorite.colorName.toLowerCase() === 'tan' ? '#d2b48c' :
                                               favorite.colorName.toLowerCase() === 'brown' ? '#8b4513' :
                                               favorite.colorName.toLowerCase() === 'gray' ? '#808080' : '#ffffff'
                              }}
                            ></div>
                          </div>
                        )}
                      </div>

                      <div className="ml-3 flex-1">
                        <div className="flex justify-between">
                          <h4 className="font-medium text-sm truncate" title={favorite.productTitle}>
                            {favorite.productTitle}
                          </h4>
                          <div className="flex items-center">
                            {selectedFavorites.some(item => item.id === favorite.id) && (
                              <span className="mr-2 text-xs bg-primary-red text-white px-1 py-0.5 rounded">
                                Selected
                              </span>
                            )}
                            <button
                              onClick={(e) => handleRemoveFavorite(favorite.id, e)}
                              className="text-gray-400 hover:text-red-500 p-1"
                              title="Remove favorite"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <div className="mt-1 text-xs text-gray-600">
                          <div>{favorite.width}″ × {favorite.height}″</div>
                          <div>{favorite.colorName}</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
          {selectedFavorites.length > 0 && (
            <div className="text-sm text-gray-600">
              {selectedFavorites.length} of {maxCompareItems} selected
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FavoritesComparison;
