import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../models/Product';
import { SAMPLE_PRODUCTS } from '../models/Product';

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

  // Mock data for inspiration gallery
  const mockInspirationData: InspirationItem[] = [
    {
      id: 'insp-1',
      title: 'Modern Living Room Blinds',
      image: 'https://ext.same-assets.com/3711297165/1234567890.jpg',
      roomType: 'living-room',
      description: 'Sleek cordless blinds that complement a modern minimalist living room with floor-to-ceiling windows.',
      productId: SAMPLE_PRODUCTS[0].id,
      configuration: {
        color: 'White',
        mountType: 'Inside Mount',
        dimensions: { width: 48, height: 72 },
        options: { 'Control Type': 'Cordless', 'Light Blocker': 'None' }
      },
      tags: [
        { id: 'modern', name: 'Modern' },
        { id: 'minimalist', name: 'Minimalist' },
        { id: 'bright', name: 'Bright' }
      ],
      likes: 145
    },
    {
      id: 'insp-2',
      title: 'Cozy Bedroom Blackout Shades',
      image: 'https://ext.same-assets.com/3711297165/2345678901.jpg',
      roomType: 'bedroom',
      description: 'Full blackout roller shades that create a perfect sleeping environment in this master bedroom.',
      productId: SAMPLE_PRODUCTS[1].id,
      configuration: {
        color: 'Gray',
        mountType: 'Outside Mount',
        dimensions: { width: 36, height: 60 },
        options: { 'Opacity': 'Blackout', 'Control Type': 'Motorized' }
      },
      tags: [
        { id: 'cozy', name: 'Cozy' },
        { id: 'dark', name: 'Dark' },
        { id: 'sleep', name: 'Sleep' }
      ],
      likes: 89
    },
    {
      id: 'insp-3',
      title: 'Bright Kitchen Light Filtering',
      image: 'https://ext.same-assets.com/3711297165/3456789012.jpg',
      roomType: 'kitchen',
      description: 'Light filtering honeycomb shades that allow plenty of natural light into this kitchen while maintaining privacy.',
      productId: SAMPLE_PRODUCTS[2].id,
      configuration: {
        color: 'Cream',
        mountType: 'Inside Mount',
        dimensions: { width: 24, height: 36 },
        options: { 'Opacity': 'Light Filtering', 'Cell Type': 'Double Cell' }
      },
      tags: [
        { id: 'bright', name: 'Bright' },
        { id: 'airy', name: 'Airy' },
        { id: 'practical', name: 'Practical' }
      ],
      likes: 122
    },
    {
      id: 'insp-4',
      title: 'Home Office Productivity',
      image: 'https://ext.same-assets.com/3711297165/4567890123.jpg',
      roomType: 'office',
      description: 'Adjustable blinds that reduce glare on computer screens while still providing natural light in this home office.',
      productId: SAMPLE_PRODUCTS[3].id,
      configuration: {
        color: 'White',
        mountType: 'Inside Mount',
        dimensions: { width: 30, height: 48 },
        options: { 'Control Type': 'Cordless', 'Opacity': 'Room Darkening' }
      },
      tags: [
        { id: 'productivity', name: 'Productivity' },
        { id: 'modern', name: 'Modern' },
        { id: 'functional', name: 'Functional' }
      ],
      likes: 78
    },
    {
      id: 'insp-5',
      title: 'Elegant Dining Room',
      image: 'https://ext.same-assets.com/3711297165/5678901234.jpg',
      roomType: 'dining',
      description: 'Roman shades that add an elegant touch to this formal dining area, complementing the warm wood furniture.',
      productId: SAMPLE_PRODUCTS[4].id,
      configuration: {
        color: 'Tan',
        mountType: 'Outside Mount',
        dimensions: { width: 42, height: 54 },
        options: { 'Style': 'Flat', 'Control Type': 'Standard' }
      },
      tags: [
        { id: 'elegant', name: 'Elegant' },
        { id: 'formal', name: 'Formal' },
        { id: 'warm', name: 'Warm' }
      ],
      likes: 103
    },
    {
      id: 'insp-6',
      title: 'Bathroom Privacy',
      image: 'https://ext.same-assets.com/3711297165/6789012345.jpg',
      roomType: 'bathroom',
      description: 'Top-down bottom-up shades that maintain privacy while letting in natural light in this spa-like bathroom.',
      productId: SAMPLE_PRODUCTS[0].id,
      configuration: {
        color: 'White',
        mountType: 'Inside Mount',
        dimensions: { width: 24, height: 40 },
        options: { 'Control Type': 'Top-Down/Bottom-Up', 'Opacity': 'Light Filtering' }
      },
      tags: [
        { id: 'privacy', name: 'Privacy' },
        { id: 'bright', name: 'Bright' },
        { id: 'spa', name: 'Spa' }
      ],
      likes: 67
    }
  ];

  // Load and filter inspiration items
  useEffect(() => {
    // Simulate API fetch delay
    const timer = setTimeout(() => {
      setInspirationItems(mockInspirationData);
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

    // Close the modal (would navigate to the URL in a real implementation)
    setShowDetailModal(false);

    // In a real implementation, we would use navigation here
    // navigate(configUrl);

    // For demo purposes, we'll just alert the URL
    alert(`In a real implementation, you would be navigated to:\n${configUrl}`);
  };

  // Handle like functionality
  const handleLikeItem = (id: string) => {
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

      {/* Detail modal */}
      {showDetailModal && selectedItem && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black bg-opacity-60" onClick={() => setShowDetailModal(false)}></div>

          <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 overflow-hidden">
            <div className="absolute top-0 right-0 pt-4 pr-4">
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/2">
                <div
                  className="h-64 md:h-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${selectedItem.image})` }}
                ></div>
              </div>

              <div className="md:w-1/2 p-6 overflow-y-auto max-h-[80vh] md:max-h-[600px]">
                <h2 className="text-xl font-semibold mb-2">{selectedItem.title}</h2>
                <p className="text-gray-600 mb-4">{selectedItem.description}</p>

                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Room Type</h3>
                  <p className="text-gray-700">
                    {selectedItem.roomType.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </p>
                </div>

                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Product Details</h3>
                  {SAMPLE_PRODUCTS.find(p => p.id === selectedItem.productId) ? (
                    <div className="flex items-center">
                      <img
                        src={SAMPLE_PRODUCTS.find(p => p.id === selectedItem.productId)?.image}
                        alt={SAMPLE_PRODUCTS.find(p => p.id === selectedItem.productId)?.title}
                        className="w-12 h-12 object-cover rounded-md mr-3"
                      />
                      <div>
                        <p className="font-medium text-gray-900">
                          {SAMPLE_PRODUCTS.find(p => p.id === selectedItem.productId)?.title}
                        </p>
                        <p className="text-sm text-gray-600">
                          {SAMPLE_PRODUCTS.find(p => p.id === selectedItem.productId)?.basePrice?.toFixed(2)} per unit
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-600">Product information not available</p>
                  )}
                </div>

                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Configuration</h3>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Color:</span>
                      <span className="text-sm font-medium">{selectedItem.configuration.color}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Mount Type:</span>
                      <span className="text-sm font-medium">{selectedItem.configuration.mountType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Dimensions:</span>
                      <span className="text-sm font-medium">
                        {selectedItem.configuration.dimensions.width}" × {selectedItem.configuration.dimensions.height}"
                      </span>
                    </div>

                    {Object.entries(selectedItem.configuration.options).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-sm text-gray-600">{key}:</span>
                        <span className="text-sm font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-6">
                  {selectedItem.tags.map(tag => (
                    <span key={tag.id} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs">
                      {tag.name}
                    </span>
                  ))}
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => handleApplyConfiguration(selectedItem)}
                    className="w-full py-2 px-4 bg-primary-red text-white font-medium rounded-md hover:bg-red-700 transition-colors"
                  >
                    Apply this Configuration
                  </button>

                  <Link
                    to={`/product/${selectedItem.productId}`}
                    className="block w-full py-2 px-4 border border-gray-300 text-gray-700 font-medium rounded-md text-center hover:bg-gray-50 transition-colors"
                    onClick={() => setShowDetailModal(false)}
                  >
                    View Product Details
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InspirationGallery;
