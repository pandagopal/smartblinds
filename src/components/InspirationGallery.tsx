import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../models/Product';

// Define types for inspiration gallery items
interface RoomStyleTag {
  id: string;
  name: string;
}

interface InspirationItem {
  id: string;
  title: string;
  image: string;
  roomType: string;
  description: string;
  productId: string;
  configuration: {
    color: string;
    mountType: string;
    dimensions: { width: number; height: number };
    options: Record<string, string>;
  };
  tags: RoomStyleTag[];
  likes: number;
}

const InspirationGallery: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [inspirationItems, setInspirationItems] = useState<InspirationItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<InspirationItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<InspirationItem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Available room filters
  const roomFilters = [
    { id: 'all', name: 'All Rooms' },
    { id: 'living-room', name: 'Living Room' },
    { id: 'bedroom', name: 'Bedroom' },
    { id: 'kitchen', name: 'Kitchen' },
    { id: 'bathroom', name: 'Bathroom' },
    { id: 'office', name: 'Home Office' },
    { id: 'dining', name: 'Dining Room' }
  ];

  // Load and filter inspiration items
  useEffect(() => {
    // Simulate API fetch delay - in a real app this would fetch from an API endpoint
    const timer = setTimeout(() => {
      // Would normally fetch from API: setInspirationItems(data);
      setInspirationItems([]);
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  // Filter items when active filter changes
  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredItems(inspirationItems);
    } else {
      setFilteredItems(inspirationItems.filter(item => item.roomType === activeFilter));
    }
  }, [activeFilter, inspirationItems]);

  // Handle item click
  const handleItemClick = (item: InspirationItem) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  // Handle apply configuration
  const handleApplyConfiguration = (item: InspirationItem) => {
    // Construct the URL with configuration parameters
    const baseUrl = `/product/configure/${item.productId}`;

    // Encode configuration parameters
    const params = new URLSearchParams();
    Object.entries(item.configuration.options).forEach(([key, value]) => {
      params.append(key.toLowerCase().replace(/\s+/g, '_'), encodeURIComponent(value));
    });

    // Add color and mount type
    params.append('color', encodeURIComponent(item.configuration.color));
    params.append('mount_type', encodeURIComponent(item.configuration.mountType));

    // Add dimensions
    params.append('width', item.configuration.dimensions.width.toString());
    params.append('height', item.configuration.dimensions.height.toString());

    const configUrl = `${baseUrl}?${params.toString()}`;

    // Close the modal
    setShowDetailModal(false);
  };

  // Handle like functionality
  const handleLikeItem = (id: string) => {
    // In a real implementation, this would call an API endpoint
    setInspirationItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, likes: item.likes + 1 } : item
      )
    );
  };

  return (
    <div className="inspiration-gallery">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-semibold mb-2">Inspiration Gallery</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Browse our curated collection of real blinds and shades in beautiful homes.
          Get inspired and easily shop the look.
        </p>
      </div>

      {/* Room type filters */}
      <div className="mb-6 flex flex-wrap justify-center gap-2">
        {roomFilters.map(filter => (
          <button
            key={filter.id}
            className={`px-4 py-2 text-sm font-medium rounded-full ${
              activeFilter === filter.id
                ? 'bg-primary-red text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
            onClick={() => setActiveFilter(filter.id)}
          >
            {filter.name}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-300 h-64 rounded-lg mb-3"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        // Gallery grid
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => (
            <div
              key={item.id}
              className="bg-white rounded-lg overflow-hidden shadow-md border border-gray-200 transition-transform hover:shadow-lg hover:-translate-y-1"
            >
              <div
                className="h-64 bg-cover bg-center cursor-pointer relative"
                style={{ backgroundImage: `url(${item.image})` }}
                onClick={() => handleItemClick(item)}
              >
                <div className="absolute inset-0 bg-black bg-opacity-20 transition-opacity hover:bg-opacity-30 flex items-center justify-center">
                  <span className="text-white bg-black bg-opacity-50 px-3 py-1 rounded-full text-xs font-medium">
                    Click to view details
                  </span>
                </div>
                <div className="absolute top-2 right-2 bg-white rounded-full px-2 py-1 text-xs font-medium text-gray-700">
                  {item.roomType.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-medium text-gray-900 mb-1">{item.title}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>

                <div className="flex flex-wrap gap-1 mb-3">
                  {item.tags.map(tag => (
                    <span key={tag.id} className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                      {tag.name}
                    </span>
                  ))}
                </div>

                <div className="flex justify-between items-center">
                  <button
                    className="text-primary-red text-sm font-medium hover:underline"
                    onClick={() => handleItemClick(item)}
                  >
                    Shop this look
                  </button>

                  <button
                    className="flex items-center text-gray-600 text-sm hover:text-primary-red"
                    onClick={() => handleLikeItem(item.id)}
                  >
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 18.571L1.429 10C0.5 9.071 0 7.857 0 6.571S0.5 4.071 1.429 3.143C2.357 2.214 3.571 1.714 4.857 1.714S7.357 2.214 8.286 3.143L10 4.857L11.714 3.143C12.643 2.214 13.857 1.714 15.143 1.714S17.643 2.214 18.571 3.143C19.5 4.071 20 5.286 20 6.571S19.5 9.071 18.571 10L10 18.571Z"/>
                    </svg>
                    <span>{item.likes}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && filteredItems.length === 0 && (
        <div className="text-center py-10">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No inspiration found</h3>
          <p className="text-gray-600 mb-4">
            We don't have any {activeFilter !== 'all' ? roomFilters.find(f => f.id === activeFilter)?.name.toLowerCase() : ''} inspiration images yet.
          </p>
          <button
            className="text-primary-red font-medium hover:underline"
            onClick={() => setActiveFilter('all')}
          >
            View all rooms instead
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-xl font-semibold">{selectedItem.title}</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <img
                  src={selectedItem.image}
                  alt={selectedItem.title}
                  className="w-full h-auto rounded-lg"
                />

                <div className="mt-4 flex flex-wrap gap-1">
                  {selectedItem.tags.map(tag => (
                    <span key={tag.id} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-lg mb-2">Description</h4>
                <p className="text-gray-600 mb-4">{selectedItem.description}</p>

                <h4 className="font-medium text-lg mb-2">Configuration</h4>
                <ul className="space-y-2 mb-6">
                  <li className="flex justify-between">
                    <span className="text-gray-600">Color:</span>
                    <span className="font-medium">{selectedItem.configuration.color}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Mount Type:</span>
                    <span className="font-medium">{selectedItem.configuration.mountType}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Dimensions:</span>
                    <span className="font-medium">{selectedItem.configuration.dimensions.width}" × {selectedItem.configuration.dimensions.height}"</span>
                  </li>
                  {Object.entries(selectedItem.configuration.options).map(([key, value]) => (
                    <li key={key} className="flex justify-between">
                      <span className="text-gray-600">{key}:</span>
                      <span className="font-medium">{value}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleApplyConfiguration(selectedItem)}
                  className="w-full bg-primary-red text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Apply This Configuration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InspirationGallery;
