import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface InventoryItem {
  id: string | number;
  name: string;
  type: string;
  totalStock: number;
  availableStock: number;
  minStockLevel: number;
  lastUpdated: string;
}

interface InventoryManagerProps {
  productId: number;
  selectedMountTypes: any[];
  selectedControlTypes: any[];
  selectedFabrics: any[];
  selectedHeadrails?: any[];
  selectedBottomRails?: any[];
  selectedSpecialtyOptions?: any[];
}

const InventoryManager: React.FC<InventoryManagerProps> = ({
  productId,
  selectedMountTypes,
  selectedControlTypes,
  selectedFabrics,
  selectedHeadrails = [],
  selectedBottomRails = [],
  selectedSpecialtyOptions = []
}) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | number | null>(null);
  const [editStockValue, setEditStockValue] = useState<number>(0);
  const [editMinStockValue, setEditMinStockValue] = useState<number>(0);
  const [filterText, setFilterText] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Load inventory data when component mounts
  useEffect(() => {
    generateInventoryFromOptions();
  }, [productId, selectedMountTypes, selectedControlTypes, selectedFabrics, selectedHeadrails, selectedBottomRails, selectedSpecialtyOptions]);

  // Generate inventory items from selected options
  const generateInventoryFromOptions = () => {
    setLoading(true);

    try {
      const inventoryItems: InventoryItem[] = [];
      const currentDate = new Date().toISOString();

      // Add mount types to inventory
      selectedMountTypes.forEach(mount => {
        const mountName = mount.mount?.name || 'Unknown Mount Type';
        inventoryItems.push({
          id: `mount_${mount.mount_id}`,
          name: mountName,
          type: 'Mount Type',
          totalStock: Math.floor(Math.random() * 50) + 10, // Random stock between 10-60
          availableStock: Math.floor(Math.random() * 40) + 5, // Random available stock between 5-45
          minStockLevel: 5,
          lastUpdated: currentDate
        });
      });

      // Add control types to inventory
      selectedControlTypes.forEach(control => {
        const controlName = control.control?.name || 'Unknown Control Type';
        inventoryItems.push({
          id: `control_${control.control_id}`,
          name: controlName,
          type: 'Control Type',
          totalStock: Math.floor(Math.random() * 50) + 10,
          availableStock: Math.floor(Math.random() * 40) + 5,
          minStockLevel: 5,
          lastUpdated: currentDate
        });
      });

      // Add fabrics to inventory
      selectedFabrics.forEach(fabric => {
        const fabricName = `${fabric.color_name} (${fabric.fabric?.name || 'Fabric'})`;
        inventoryItems.push({
          id: `fabric_${fabric.fabric_id}_${fabric.color_code.replace('#', '')}`,
          name: fabricName,
          type: 'Fabric',
          totalStock: Math.floor(Math.random() * 100) + 20, // Fabrics usually have more stock
          availableStock: Math.floor(Math.random() * 80) + 10,
          minStockLevel: 10,
          lastUpdated: currentDate
        });
      });

      // Add headrails to inventory
      selectedHeadrails.forEach(headrail => {
        const headrailName = headrail.headrail?.name || 'Unknown Headrail';
        inventoryItems.push({
          id: `headrail_${headrail.headrail_id}`,
          name: headrailName,
          type: 'Headrail',
          totalStock: Math.floor(Math.random() * 40) + 15,
          availableStock: Math.floor(Math.random() * 30) + 10,
          minStockLevel: 8,
          lastUpdated: currentDate
        });
      });

      // Add bottom rails to inventory
      selectedBottomRails.forEach(rail => {
        const railName = rail.rail?.name || 'Unknown Bottom Rail';
        inventoryItems.push({
          id: `rail_${rail.rail_id}`,
          name: railName,
          type: 'Bottom Rail',
          totalStock: Math.floor(Math.random() * 40) + 15,
          availableStock: Math.floor(Math.random() * 30) + 10,
          minStockLevel: 8,
          lastUpdated: currentDate
        });
      });

      // Add specialty options to inventory
      selectedSpecialtyOptions.forEach(option => {
        const optionName = option.specialty?.name || 'Unknown Specialty Option';
        inventoryItems.push({
          id: `specialty_${option.specialty_id}`,
          name: optionName,
          type: 'Specialty Option',
          totalStock: Math.floor(Math.random() * 30) + 5,
          availableStock: Math.floor(Math.random() * 20) + 5,
          minStockLevel: 3,
          lastUpdated: currentDate
        });
      });

      setInventory(inventoryItems);
      setError(null);
    } catch (err) {
      console.error('Error generating inventory:', err);
      setError('Failed to generate inventory data');
    } finally {
      setLoading(false);
    }
  };

  // Update inventory item
  const updateInventoryItem = (id: string | number, newAvailableStock: number, newMinStockLevel: number) => {
    setInventory(prevInventory =>
      prevInventory.map(item => {
        if (item.id === id) {
          return {
            ...item,
            availableStock: newAvailableStock,
            minStockLevel: newMinStockLevel,
            lastUpdated: new Date().toISOString()
          };
        }
        return item;
      })
    );

    setEditingItemId(null);
  };

  // Start editing item
  const startEditing = (item: InventoryItem) => {
    setEditingItemId(item.id);
    setEditStockValue(item.availableStock);
    setEditMinStockValue(item.minStockLevel);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingItemId(null);
  };

  // Save changes to editing item
  const saveEditing = () => {
    if (editingItemId !== null) {
      updateInventoryItem(editingItemId, editStockValue, editMinStockValue);
    }
  };

  // Handle sorting
  const handleSort = (column: string) => {
    if (sortBy === column) {
      // Toggle direction if clicking the same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column and default to ascending
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  // Format date string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Apply filters and sorting to inventory items
  const filteredAndSortedInventory = inventory
    // Apply text filter
    .filter(item =>
      item.name.toLowerCase().includes(filterText.toLowerCase()) ||
      item.type.toLowerCase().includes(filterText.toLowerCase())
    )
    // Apply type filter
    .filter(item =>
      filterType === 'all' || item.type === filterType ||
      (filterType === 'low-stock' && item.availableStock <= item.minStockLevel)
    )
    // Apply sorting
    .sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        case 'totalStock':
          comparison = a.totalStock - b.totalStock;
          break;
        case 'availableStock':
          comparison = a.availableStock - b.availableStock;
          break;
        case 'lastUpdated':
          comparison = new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime();
          break;
        default:
          comparison = 0;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

  // Generate a CSV export of inventory data
  const exportInventoryCSV = () => {
    // Header row
    const headers = ['Name', 'Type', 'Total Stock', 'Available Stock', 'Min Stock Level', 'Last Updated'];

    // Format inventory data as CSV rows
    const rows = filteredAndSortedInventory.map(item => [
      item.name,
      item.type,
      item.totalStock.toString(),
      item.availableStock.toString(),
      item.minStockLevel.toString(),
      formatDate(item.lastUpdated)
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create downloadable link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `product_inventory_${productId}_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Loading inventory data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">Inventory Management</h3>
        <button
          onClick={exportInventoryCSV}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md bg-white text-gray-700 hover:bg-gray-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export Inventory
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label htmlFor="searchFilter" className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            id="searchFilter"
            placeholder="Search by name..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="typeFilter" className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Type
          </label>
          <select
            id="typeFilter"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="all">All Types</option>
            <option value="Mount Type">Mount Types</option>
            <option value="Control Type">Control Types</option>
            <option value="Fabric">Fabrics</option>
            <option value="Headrail">Headrails</option>
            <option value="Bottom Rail">Bottom Rails</option>
            <option value="Specialty Option">Specialty Options</option>
            <option value="low-stock">Low Stock Items</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={() => {
              setFilterText('');
              setFilterType('all');
            }}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md bg-white text-gray-700 hover:bg-gray-50"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Inventory table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center">
                  <span>Name</span>
                  {sortBy === 'name' && (
                    <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={
                        sortDirection === 'asc'
                          ? "M5 15l7-7 7 7"
                          : "M19 9l-7 7-7-7"
                      } />
                    </svg>
                  )}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('type')}
              >
                <div className="flex items-center">
                  <span>Type</span>
                  {sortBy === 'type' && (
                    <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={
                        sortDirection === 'asc'
                          ? "M5 15l7-7 7 7"
                          : "M19 9l-7 7-7-7"
                      } />
                    </svg>
                  )}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('totalStock')}
              >
                <div className="flex items-center">
                  <span>Total</span>
                  {sortBy === 'totalStock' && (
                    <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={
                        sortDirection === 'asc'
                          ? "M5 15l7-7 7 7"
                          : "M19 9l-7 7-7-7"
                      } />
                    </svg>
                  )}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('availableStock')}
              >
                <div className="flex items-center">
                  <span>Available</span>
                  {sortBy === 'availableStock' && (
                    <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={
                        sortDirection === 'asc'
                          ? "M5 15l7-7 7 7"
                          : "M19 9l-7 7-7-7"
                      } />
                    </svg>
                  )}
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Min Level
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('lastUpdated')}
              >
                <div className="flex items-center">
                  <span>Last Updated</span>
                  {sortBy === 'lastUpdated' && (
                    <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={
                        sortDirection === 'asc'
                          ? "M5 15l7-7 7 7"
                          : "M19 9l-7 7-7-7"
                      } />
                    </svg>
                  )}
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAndSortedInventory.length > 0 ? (
              filteredAndSortedInventory.map((item) => (
                <tr key={item.id} className={item.availableStock <= item.minStockLevel ? 'bg-red-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.totalStock}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingItemId === item.id ? (
                      <input
                        type="number"
                        min="0"
                        max={item.totalStock}
                        value={editStockValue}
                        onChange={(e) => setEditStockValue(Math.min(parseInt(e.target.value) || 0, item.totalStock))}
                        className="w-20 px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    ) : (
                      <span className={`text-sm ${
                        item.availableStock <= item.minStockLevel
                          ? 'text-red-600 font-medium'
                          : 'text-gray-500'
                      }`}>
                        {item.availableStock}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingItemId === item.id ? (
                      <input
                        type="number"
                        min="0"
                        value={editMinStockValue}
                        onChange={(e) => setEditMinStockValue(parseInt(e.target.value) || 0)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    ) : (
                      <span className="text-sm text-gray-500">{item.minStockLevel}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(item.lastUpdated)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {editingItemId === item.id ? (
                      <div className="flex space-x-2 justify-end">
                        <button
                          onClick={cancelEditing}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={saveEditing}
                          className="text-blue-600 hover:text-blue-800 ml-2"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEditing(item)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500">
                  No inventory items found for the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {filteredAndSortedInventory.length > 0 && (
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{filteredAndSortedInventory.length}</span> out of{' '}
            <span className="font-medium">{inventory.length}</span> items
          </div>
          <div className="text-sm text-gray-500">
            {inventory.filter(item => item.availableStock <= item.minStockLevel).length} items below minimum stock level
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManager;
