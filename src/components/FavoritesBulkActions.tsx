import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FavoriteItem, getFavorites, removeFromFavorites } from '../services/favoritesService';
import html2canvas from 'html2canvas';

interface FavoritesBulkActionsProps {
  onClose: () => void;
  onRefresh: () => void;
}

const FavoritesBulkActions: React.FC<FavoritesBulkActionsProps> = ({ onClose, onRefresh }) => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'pdf'>('json');
  const exportContainerRef = useRef<HTMLDivElement>(null);

  // Load favorites on component mount
  useEffect(() => {
    const allFavorites = getFavorites();
    setFavorites(allFavorites);
  }, []);

  // Handle select all
  useEffect(() => {
    if (selectAll) {
      setSelectedIds(filteredFavorites.map(fav => fav.id));
    } else if (selectedIds.length === filteredFavorites.length) {
      // If we previously had all items selected and unchecked "select all"
      setSelectedIds([]);
    }
  }, [selectAll]);

  // Filter favorites based on search term
  const filteredFavorites = favorites.filter(favorite => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      favorite.productTitle.toLowerCase().includes(searchLower) ||
      favorite.colorName.toLowerCase().includes(searchLower) ||
      (favorite.notes && favorite.notes.toLowerCase().includes(searchLower))
    );
  });

  // Toggle selection of a favorite
  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Bulk delete selected favorites
  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;

    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} favorite${selectedIds.length > 1 ? 's' : ''}?`)) {
      setIsProcessing(true);

      // Delete each selected favorite
      selectedIds.forEach(id => {
        removeFromFavorites(id);
      });

      // Refresh favorites list
      const remainingFavorites = getFavorites();
      setFavorites(remainingFavorites);

      // Clear selections
      setSelectedIds([]);
      setSelectAll(false);

      // Notify parent of changes
      onRefresh();

      setIsProcessing(false);
    }
  };

  // Export selected favorites as JSON
  const handleExportJSON = () => {
    if (selectedIds.length === 0) return;

    setIsProcessing(true);

    const selectedFavorites = favorites.filter(fav => selectedIds.includes(fav.id));
    const dataStr = JSON.stringify(selectedFavorites, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;

    // Create download link
    const downloadLink = document.createElement('a');
    downloadLink.setAttribute('href', dataUri);
    downloadLink.setAttribute('download', `smartblinds-favorites-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    setIsProcessing(false);
  };

  // Export selected favorites as CSV
  const handleExportCSV = () => {
    if (selectedIds.length === 0) return;

    setIsProcessing(true);

    const selectedFavorites = favorites.filter(fav => selectedIds.includes(fav.id));

    // Create CSV headers
    const headers = [
      'Product',
      'Color',
      'Width',
      'Height',
      'Slat Size',
      'Mount Type',
      'Control Type',
      'Notes',
      'Date Added'
    ].join(',');

    // Create CSV rows
    const rows = selectedFavorites.map(fav => {
      return [
        `"${fav.productTitle.replace(/"/g, '""')}"`,
        `"${fav.colorName.replace(/"/g, '""')}"`,
        fav.width,
        fav.height,
        fav.slatSize ? `"${fav.slatSize.replace(/"/g, '""')}"` : '""',
        fav.mountType ? `"${fav.mountType.replace(/"/g, '""')}"` : '""',
        fav.controlType ? `"${fav.controlType.replace(/"/g, '""')}"` : '""',
        fav.notes ? `"${fav.notes.replace(/"/g, '""')}"` : '""',
        new Date(fav.timestamp).toLocaleDateString()
      ].join(',');
    });

    // Combine headers and rows
    const csvContent = `${headers}\n${rows.join('\n')}`;
    const dataUri = `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`;

    // Create download link
    const downloadLink = document.createElement('a');
    downloadLink.setAttribute('href', dataUri);
    downloadLink.setAttribute('download', `smartblinds-favorites-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    setIsProcessing(false);
  };

  // Export selected favorites as PDF-like screenshot
  const handleExportPDF = async () => {
    if (selectedIds.length === 0 || !exportContainerRef.current) return;

    setIsProcessing(true);

    try {
      // Use html2canvas to capture the export container
      const canvas = await html2canvas(exportContainerRef.current, {
        scale: 2,
        logging: false,
        backgroundColor: '#ffffff'
      });

      // Convert canvas to data URL
      const dataUrl = canvas.toDataURL('image/png');

      // Create download link
      const downloadLink = document.createElement('a');
      downloadLink.setAttribute('href', dataUrl);
      downloadLink.setAttribute('download', `smartblinds-favorites-${new Date().toISOString().split('T')[0]}.png`);
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (error) {
      console.error('Error generating PDF export:', error);
      alert('Failed to export selections. Please try again or use another format.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Export based on selected format
  const handleExport = () => {
    if (selectedIds.length === 0) return;

    switch (exportFormat) {
      case 'json':
        handleExportJSON();
        break;
      case 'csv':
        handleExportCSV();
        break;
      case 'pdf':
        handleExportPDF();
        break;
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
        className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-medium">Bulk Manage Favorites</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 p-1"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="select-all"
                  checked={selectAll}
                  onChange={() => setSelectAll(!selectAll)}
                  className="rounded border-gray-300 text-primary-red focus:ring-primary-red"
                />
                <label htmlFor="select-all" className="text-sm font-medium text-gray-700">
                  Select All ({filteredFavorites.length})
                </label>
              </div>

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
              <div className="text-center p-8 bg-gray-50 rounded-lg">
                <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-600 mt-4">No Favorites Found</h3>
                <p className="text-gray-500 mt-2">You don't have any saved favorites yet.</p>
              </div>
            ) : filteredFavorites.length === 0 ? (
              <div className="text-center p-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No favorites match your search criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto p-2">
                {filteredFavorites.map((favorite) => (
                  <motion.div
                    key={favorite.id}
                    whileHover={{ scale: 1.02 }}
                    className={`border rounded-lg overflow-hidden transition-colors ${
                      selectedIds.includes(favorite.id)
                        ? 'border-primary-red bg-red-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex p-3">
                      <div className="flex-shrink-0 mr-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(favorite.id)}
                          onChange={() => toggleSelect(favorite.id)}
                          className="rounded border-gray-300 text-primary-red focus:ring-primary-red mt-1"
                        />
                      </div>

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
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium text-sm truncate" title={favorite.productTitle}>
                            {favorite.productTitle}
                          </h4>
                          <span className="text-xs text-gray-500 ml-1">
                            {new Date(favorite.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-gray-600">
                          <div>{favorite.width}″ × {favorite.height}″</div>
                          <div>{favorite.colorName}</div>
                          {favorite.notes && (
                            <div className="truncate mt-1 text-gray-500 max-w-[180px]" title={favorite.notes}>
                              {favorite.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Hidden export container for PDF generation */}
            <div className="hidden">
              <div ref={exportContainerRef} className="p-6 bg-white" style={{ width: '800px' }}>
                <div className="mb-4 border-b border-gray-200 pb-4">
                  <h1 className="text-2xl font-bold text-gray-800">SmartBlindsHub - Saved Favorites</h1>
                  <p className="text-gray-500">Exported on {new Date().toLocaleDateString()}</p>
                </div>

                {selectedIds.length > 0 && (
                  <div className="space-y-6">
                    {favorites.filter(fav => selectedIds.includes(fav.id)).map((favorite) => (
                      <div key={favorite.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center mb-3">
                          <div
                            className="w-12 h-12 rounded"
                            style={{
                              backgroundColor: favorite.colorName.toLowerCase() === 'white' ? '#f5f5f5' :
                                              favorite.colorName.toLowerCase() === 'tan' ? '#d2b48c' :
                                              favorite.colorName.toLowerCase() === 'brown' ? '#8b4513' :
                                              favorite.colorName.toLowerCase() === 'gray' ? '#808080' : '#ffffff'
                            }}
                          ></div>
                          <div className="ml-3">
                            <h3 className="font-bold text-gray-800">{favorite.productTitle}</h3>
                            <p className="text-gray-500 text-sm">Added on {new Date(favorite.timestamp).toLocaleDateString()}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                          <div>
                            <span className="font-medium text-gray-700">Dimensions:</span>
                            <span className="ml-2">{favorite.width}″ × {favorite.height}″</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Color:</span>
                            <span className="ml-2">{favorite.colorName}</span>
                          </div>
                          {favorite.slatSize && (
                            <div>
                              <span className="font-medium text-gray-700">Slat Size:</span>
                              <span className="ml-2">{favorite.slatSize.replace('inch', ' inch')}</span>
                            </div>
                          )}
                          {favorite.mountType && (
                            <div>
                              <span className="font-medium text-gray-700">Mount Type:</span>
                              <span className="ml-2">
                                {favorite.mountType === 'inside' ? 'Inside Mount' : 'Outside Mount'}
                              </span>
                            </div>
                          )}
                          {favorite.controlType && (
                            <div>
                              <span className="font-medium text-gray-700">Control Type:</span>
                              <span className="ml-2">
                                {favorite.controlType === 'standard' ? 'Standard' :
                                favorite.controlType === 'cordless' ? 'Cordless' : 'Motorized'}
                              </span>
                            </div>
                          )}
                        </div>

                        {favorite.notes && (
                          <div className="mt-3 border-t border-gray-100 pt-3">
                            <span className="font-medium text-gray-700">Notes:</span>
                            <p className="mt-1 text-gray-600 whitespace-pre-line">{favorite.notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={handleBulkDelete}
              disabled={selectedIds.length === 0 || isProcessing}
              className={`px-4 py-2 text-white rounded transition-colors flex items-center ${
                selectedIds.length === 0 || isProcessing
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-red-500 hover:bg-red-600'
              }`}
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete ({selectedIds.length})
                </>
              )}
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as any)}
              disabled={selectedIds.length === 0 || isProcessing}
              className={`text-sm border border-gray-300 rounded py-1 px-2 ${
                selectedIds.length === 0 || isProcessing
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white'
              }`}
            >
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
              <option value="pdf">PDF</option>
            </select>

            <button
              onClick={handleExport}
              disabled={selectedIds.length === 0 || isProcessing}
              className={`px-4 py-2 rounded transition-colors flex items-center ${
                selectedIds.length === 0 || isProcessing
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Exporting...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export ({selectedIds.length})
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FavoritesBulkActions;
