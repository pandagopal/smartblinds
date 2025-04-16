import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { RecentlyViewedItem, getRecentlyViewed } from '../services/recentlyViewedService';

interface RecentlyViewedProps {
  currentProductId?: string;
  onSelectConfiguration?: (configId: string) => void;
  maxItems?: number;
}

const RecentlyViewed: React.FC<RecentlyViewedProps> = ({
  currentProductId,
  onSelectConfiguration,
  maxItems = 6
}) => {
  const [recentItems, setRecentItems] = useState<RecentlyViewedItem[]>([]);
  const [allItems, setAllItems] = useState<RecentlyViewedItem[]>([]);

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [colorFilter, setColorFilter] = useState<string>('');
  const [minWidth, setMinWidth] = useState<number | ''>('');
  const [maxWidth, setMaxWidth] = useState<number | ''>('');
  const [minHeight, setMinHeight] = useState<number | ''>('');
  const [maxHeight, setMaxHeight] = useState<number | ''>('');
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  // Load recently viewed items on component mount
  useEffect(() => {
    const loadRecentItems = () => {
      try {
        // Get items from the service
        const items = getRecentlyViewed();

        // Filter out the current product if provided
        const filteredItems = currentProductId
          ? items.filter(item => item.productId !== currentProductId)
          : items;

        // Store all items for filtering
        setAllItems(filteredItems);

        // Apply initial sort and limit
        applyFiltersAndSort(filteredItems);
      } catch (error) {
        console.error('Error loading recently viewed items:', error);
        setRecentItems([]);
        setAllItems([]);
      }
    };

    loadRecentItems();
  }, [currentProductId]);

  // Get unique colors from all items
  const uniqueColors = useMemo(() => {
    const colors = allItems.map(item => item.colorName);
    return [...new Set(colors)].sort();
  }, [allItems]);

  // Apply filters and sorting
  const applyFiltersAndSort = (items: RecentlyViewedItem[] = allItems) => {
    let filtered = [...items];

    // Apply color filter
    if (colorFilter) {
      filtered = filtered.filter(item =>
        item.colorName.toLowerCase() === colorFilter.toLowerCase()
      );
    }

    // Apply dimension filters
    if (minWidth !== '') {
      filtered = filtered.filter(item => item.width >= Number(minWidth));
    }
    if (maxWidth !== '') {
      filtered = filtered.filter(item => item.width <= Number(maxWidth));
    }
    if (minHeight !== '') {
      filtered = filtered.filter(item => item.height >= Number(minHeight));
    }
    if (maxHeight !== '') {
      filtered = filtered.filter(item => item.height <= Number(maxHeight));
    }

    // Apply time filter
    if (timeFilter !== 'all') {
      const now = Date.now();
      const oneDayMs = 24 * 60 * 60 * 1000;

      if (timeFilter === 'today') {
        filtered = filtered.filter(item => (now - item.timestamp) < oneDayMs);
      } else if (timeFilter === 'week') {
        filtered = filtered.filter(item => (now - item.timestamp) < 7 * oneDayMs);
      } else if (timeFilter === 'month') {
        filtered = filtered.filter(item => (now - item.timestamp) < 30 * oneDayMs);
      }
    }

    // Sort by most recent first and limit
    const sortedItems = filtered
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, maxItems);

    setRecentItems(sortedItems);
  };

  // Reset all filters
  const resetFilters = () => {
    setColorFilter('');
    setMinWidth('');
    setMaxWidth('');
    setMinHeight('');
    setMaxHeight('');
    setTimeFilter('all');
    applyFiltersAndSort(allItems);
  };

  // Helper to format timestamp
  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  if (allItems.length === 0) {
    return null;
  }

  return (
    <div className="recently-viewed mt-8 mb-12">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-medium">Recently Viewed</h2>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="text-primary-red hover:underline text-sm font-medium flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          {showFilters ? 'Hide Filters' : 'Filter'}
        </button>
      </div>

      {showFilters && (
        <div className="filter-panel bg-white border border-gray-200 rounded-lg p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="color-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Color
              </label>
              <select
                id="color-filter"
                value={colorFilter}
                onChange={(e) => setColorFilter(e.target.value)}
                className="w-full rounded border-gray-300"
              >
                <option value="">All Colors</option>
                {uniqueColors.map(color => (
                  <option key={color} value={color}>{color}</option>
                ))}
              </select>
            </div>

            <div className="dimension-filters">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Width (inches)
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minWidth}
                  onChange={(e) => setMinWidth(e.target.value ? Number(e.target.value) : '')}
                  className="w-full rounded border-gray-300"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxWidth}
                  onChange={(e) => setMaxWidth(e.target.value ? Number(e.target.value) : '')}
                  className="w-full rounded border-gray-300"
                />
              </div>
            </div>

            <div className="dimension-filters">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Height (inches)
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minHeight}
                  onChange={(e) => setMinHeight(e.target.value ? Number(e.target.value) : '')}
                  className="w-full rounded border-gray-300"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxHeight}
                  onChange={(e) => setMaxHeight(e.target.value ? Number(e.target.value) : '')}
                  className="w-full rounded border-gray-300"
                />
              </div>
            </div>
          </div>

          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time Period
            </label>
            <div className="flex space-x-2">
              <button
                className={`px-3 py-1 text-sm rounded ${timeFilter === 'all' ? 'bg-primary-red text-white' : 'bg-gray-100 text-gray-800'}`}
                onClick={() => setTimeFilter('all')}
              >
                All Time
              </button>
              <button
                className={`px-3 py-1 text-sm rounded ${timeFilter === 'today' ? 'bg-primary-red text-white' : 'bg-gray-100 text-gray-800'}`}
                onClick={() => setTimeFilter('today')}
              >
                Today
              </button>
              <button
                className={`px-3 py-1 text-sm rounded ${timeFilter === 'week' ? 'bg-primary-red text-white' : 'bg-gray-100 text-gray-800'}`}
                onClick={() => setTimeFilter('week')}
              >
                This Week
              </button>
              <button
                className={`px-3 py-1 text-sm rounded ${timeFilter === 'month' ? 'bg-primary-red text-white' : 'bg-gray-100 text-gray-800'}`}
                onClick={() => setTimeFilter('month')}
              >
                This Month
              </button>
            </div>
          </div>

          <div className="flex justify-between mt-4 pt-3 border-t border-gray-200">
            <button
              onClick={resetFilters}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
            >
              Reset Filters
            </button>
            <button
              onClick={() => applyFiltersAndSort()}
              className="px-3 py-1 text-sm bg-primary-red text-white rounded hover:bg-secondary-red"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {recentItems.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center text-gray-500">
          No results match your filters. Try adjusting your criteria or
          <button
            onClick={resetFilters}
            className="text-primary-red hover:underline ml-1"
          >
            reset filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {recentItems.map((item) => (
            <div
              key={item.id}
              className="recent-item bg-white border border-gray-200 rounded-lg overflow-hidden transition-shadow hover:shadow-md"
            >
              <Link
                to={`/product/configure/${item.productId}/shared?w=${item.width}&h=${item.height}&c=${item.colorName.toLowerCase().replace(' ', '_')}`}
                className="block"
                onClick={() => onSelectConfiguration && onSelectConfiguration(item.id)}
              >
                <div className="relative h-32 bg-gray-100">
                  {item.thumbnail ? (
                    <img
                      src={item.thumbnail}
                      alt={`${item.productTitle} configuration`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div
                        className="w-2/3 h-2/3 rounded"
                        style={{
                          backgroundColor: item.colorName.toLowerCase() === 'white' ? '#f5f5f5' :
                                           item.colorName.toLowerCase() === 'tan' ? '#d2b48c' :
                                           item.colorName.toLowerCase() === 'brown' ? '#8b4513' :
                                           item.colorName.toLowerCase() === 'gray' ? '#808080' : '#ffffff',
                          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
                        }}
                      ></div>
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0 text-xs bg-gray-800 text-white px-2 py-1 rounded-tl-md">
                    {formatTimeAgo(item.timestamp)}
                  </div>
                </div>

                <div className="p-3">
                  <h3 className="font-medium text-sm truncate" title={item.productTitle}>
                    {item.productTitle}
                  </h3>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-600">
                      {item.width}″ × {item.height}″
                    </span>
                    <span className="text-xs text-gray-600">
                      {item.colorName}
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentlyViewed;
