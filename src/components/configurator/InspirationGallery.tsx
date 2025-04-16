import React, { useState, useEffect } from 'react';
import { Product } from '../../models/Product';

interface InspirationItem {
  id: string;
  title: string;
  description: string;
  image: string;
  room: string;
  productType: string;
  color: string;
  style: string;
  opacity: string;
  tags: string[];
  featured?: boolean;
}

interface InspirationGalleryProps {
  product?: Product;
  onApplyInspiration?: (configuration: Record<string, string>, imageSrc: string) => void;
}

const InspirationGallery: React.FC<InspirationGalleryProps> = ({
  product,
  onApplyInspiration
}) => {
  const [inspirations, setInspirations] = useState<InspirationItem[]>([]);
  const [filteredInspirations, setFilteredInspirations] = useState<InspirationItem[]>([]);
  const [selectedInspiration, setSelectedInspiration] = useState<InspirationItem | null>(null);
  const [showFullGallery, setShowFullGallery] = useState(false);
  const [filters, setFilters] = useState({
    room: '',
    productType: product?.type || '',
    color: '',
    style: '',
    opacity: ''
  });

  // Sample inspiration gallery data
  useEffect(() => {
    // In a real app, this would be fetched from an API
    const sampleInspirations: InspirationItem[] = [
      {
        id: '1',
        title: 'Modern Living Room with White Blinds',
        description: 'Sleek white roller blinds that complement the clean, modern aesthetic of this bright living room.',
        image: 'https://ext.same-assets.com/2035588304/inspiration-1.jpg',
        room: 'Living Room',
        productType: 'Roller Shades',
        color: 'White',
        style: 'Modern',
        opacity: 'Light Filtering',
        tags: ['modern', 'white', 'clean', 'bright'],
        featured: true
      },
      {
        id: '2',
        title: 'Cozy Bedroom with Blackout Cellular Shades',
        description: 'Create a perfect sleeping environment with these room-darkening cellular shades in a warm cream color.',
        image: 'https://ext.same-assets.com/2035588304/inspiration-2.jpg',
        room: 'Bedroom',
        productType: 'Cellular Shades',
        color: 'Cream',
        style: 'Transitional',
        opacity: 'Blackout',
        tags: ['cozy', 'sleep', 'cream', 'blackout']
      },
      {
        id: '3',
        title: 'Kitchen Bay Window with Faux Wood Blinds',
        description: 'Practical and attractive faux wood blinds that can withstand humidity in this bright kitchen.',
        image: 'https://ext.same-assets.com/2035588304/inspiration-3.jpg',
        room: 'Kitchen',
        productType: 'Faux Wood Blinds',
        color: 'Tan',
        style: 'Traditional',
        opacity: 'Light Filtering',
        tags: ['kitchen', 'bay window', 'wood', 'traditional']
      },
      {
        id: '4',
        title: 'Home Office with Light Filtering Roller Shades',
        description: 'The perfect balance of light control and privacy for a productive home office.',
        image: 'https://ext.same-assets.com/2035588304/inspiration-4.jpg',
        room: 'Office',
        productType: 'Roller Shades',
        color: 'Gray',
        style: 'Contemporary',
        opacity: 'Light Filtering',
        tags: ['office', 'productivity', 'modern', 'gray']
      },
      {
        id: '5',
        title: 'Bathroom with Moisture-Resistant Cellular Shades',
        description: 'These moisture-resistant cellular shades provide privacy while letting in natural light.',
        image: 'https://ext.same-assets.com/2035588304/inspiration-5.jpg',
        room: 'Bathroom',
        productType: 'Cellular Shades',
        color: 'White',
        style: 'Modern',
        opacity: 'Light Filtering',
        tags: ['bathroom', 'moisture', 'privacy', 'light']
      },
      {
        id: '6',
        title: 'Dining Room with Woven Wood Shades',
        description: 'Add texture and warmth to your dining space with these natural woven wood shades.',
        image: 'https://ext.same-assets.com/2035588304/inspiration-6.jpg',
        room: 'Dining Room',
        productType: 'Woven Wood Shades',
        color: 'Brown',
        style: 'Rustic',
        opacity: 'Light Filtering',
        tags: ['dining', 'texture', 'natural', 'rustic']
      },
      {
        id: '7',
        title: 'Kids Room with Colorful Roller Blinds',
        description: 'Fun and functional roller blinds that can darken the room for nap time.',
        image: 'https://ext.same-assets.com/2035588304/inspiration-7.jpg',
        room: 'Kids Room',
        productType: 'Roller Shades',
        color: 'Blue',
        style: 'Playful',
        opacity: 'Room Darkening',
        tags: ['kids', 'colorful', 'fun', 'nap time']
      },
      {
        id: '8',
        title: 'Living Room with Layered Window Treatments',
        description: 'Combining sheer shades with drapes creates a luxurious and versatile window treatment.',
        image: 'https://ext.same-assets.com/2035588304/inspiration-8.jpg',
        room: 'Living Room',
        productType: 'Sheer Shades',
        color: 'Beige',
        style: 'Elegant',
        opacity: 'Sheer',
        tags: ['layered', 'luxury', 'versatile', 'elegant']
      }
    ];

    setInspirations(sampleInspirations);
    setFilteredInspirations(sampleInspirations);

    // Filter by product type if specified
    if (product?.type) {
      const filtered = sampleInspirations.filter(item =>
        item.productType.toLowerCase().includes(product.type.toLowerCase())
      );
      setFilteredInspirations(filtered);
    }
  }, [product]);

  // Apply filters
  const applyFilters = () => {
    let result = [...inspirations];

    if (filters.room) {
      result = result.filter(item => item.room === filters.room);
    }

    if (filters.productType) {
      result = result.filter(item => item.productType === filters.productType);
    }

    if (filters.color) {
      result = result.filter(item => item.color === filters.color);
    }

    if (filters.style) {
      result = result.filter(item => item.style === filters.style);
    }

    if (filters.opacity) {
      result = result.filter(item => item.opacity === filters.opacity);
    }

    setFilteredInspirations(result);
  };

  // Update filters
  const handleFilterChange = (filterName: keyof typeof filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      room: '',
      productType: product?.type || '',
      color: '',
      style: '',
      opacity: ''
    });

    // Reset to original list or filter by product type if specified
    if (product?.type) {
      const filtered = inspirations.filter(item =>
        item.productType.toLowerCase().includes(product.type.toLowerCase())
      );
      setFilteredInspirations(filtered);
    } else {
      setFilteredInspirations(inspirations);
    }
  };

  // Effect to apply filters when they change
  useEffect(() => {
    applyFilters();
  }, [filters]);

  // Get unique options for each filter
  const getUniqueFilterOptions = (key: keyof typeof filters) => {
    const options = new Set(inspirations.map(item => item[key]));
    return Array.from(options).sort();
  };

  // Handle applying an inspiration to the configurator
  const handleApplyInspiration = (inspiration: InspirationItem) => {
    if (onApplyInspiration) {
      // Convert inspiration to configuration options
      const configuration: Record<string, string> = {
        'Color': inspiration.color,
        'Opacity': inspiration.opacity,
        // Add other relevant configuration options...
      };

      onApplyInspiration(configuration, inspiration.image);
      setSelectedInspiration(null); // Close modal
    }
  };

  return (
    <div className="inspiration-gallery">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Inspiration Gallery</h3>

        {!showFullGallery && (
          <button
            onClick={() => setShowFullGallery(true)}
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
          >
            View All Inspirations
          </button>
        )}
      </div>

      {/* Condensed Gallery (default view) */}
      {!showFullGallery && (
        <div className="grid grid-cols-2 gap-4">
          {filteredInspirations.slice(0, 4).map((inspiration) => (
            <div
              key={inspiration.id}
              className="group relative overflow-hidden rounded-lg cursor-pointer"
              onClick={() => setSelectedInspiration(inspiration)}
            >
              <img
                src={inspiration.image}
                alt={inspiration.title}
                className="w-full h-40 object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-40 transition-opacity"></div>
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-black bg-opacity-50 text-white">
                <h4 className="text-sm font-medium">{inspiration.title}</h4>
              </div>
              {inspiration.featured && (
                <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                  Featured
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Full Gallery with Filters */}
      {showFullGallery && (
        <div>
          {/* Filters */}
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Room</label>
                <select
                  value={filters.room}
                  onChange={(e) => handleFilterChange('room', e.target.value)}
                  className="w-full p-2 text-sm border border-gray-300 rounded-md"
                >
                  <option value="">All Rooms</option>
                  {getUniqueFilterOptions('room').map(option => (
                    <option key={`room-${option}`} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Product Type</label>
                <select
                  value={filters.productType}
                  onChange={(e) => handleFilterChange('productType', e.target.value)}
                  className="w-full p-2 text-sm border border-gray-300 rounded-md"
                >
                  <option value="">All Types</option>
                  {getUniqueFilterOptions('productType').map(option => (
                    <option key={`type-${option}`} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Color</label>
                <select
                  value={filters.color}
                  onChange={(e) => handleFilterChange('color', e.target.value)}
                  className="w-full p-2 text-sm border border-gray-300 rounded-md"
                >
                  <option value="">All Colors</option>
                  {getUniqueFilterOptions('color').map(option => (
                    <option key={`color-${option}`} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Style</label>
                <select
                  value={filters.style}
                  onChange={(e) => handleFilterChange('style', e.target.value)}
                  className="w-full p-2 text-sm border border-gray-300 rounded-md"
                >
                  <option value="">All Styles</option>
                  {getUniqueFilterOptions('style').map(option => (
                    <option key={`style-${option}`} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Opacity</label>
                <select
                  value={filters.opacity}
                  onChange={(e) => handleFilterChange('opacity', e.target.value)}
                  className="w-full p-2 text-sm border border-gray-300 rounded-md"
                >
                  <option value="">All Opacity</option>
                  {getUniqueFilterOptions('opacity').map(option => (
                    <option key={`opacity-${option}`} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end mt-3">
              <button
                onClick={resetFilters}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* Gallery Grid */}
          {filteredInspirations.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filteredInspirations.map((inspiration) => (
                <div
                  key={inspiration.id}
                  className="group relative overflow-hidden rounded-lg cursor-pointer"
                  onClick={() => setSelectedInspiration(inspiration)}
                >
                  <img
                    src={inspiration.image}
                    alt={inspiration.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-40 transition-opacity"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-black bg-opacity-50 text-white">
                    <h4 className="text-sm font-medium">{inspiration.title}</h4>
                    <p className="text-xs opacity-80 hidden group-hover:block">{inspiration.room} • {inspiration.productType}</p>
                  </div>
                  {inspiration.featured && (
                    <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                      Featured
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-600">No inspirations match your filter criteria.</p>
              <button
                onClick={resetFilters}
                className="mt-2 text-blue-600 hover:underline"
              >
                Reset filters
              </button>
            </div>
          )}

          <div className="mt-4 text-center">
            <button
              onClick={() => setShowFullGallery(false)}
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
            >
              Show Less
            </button>
          </div>
        </div>
      )}

      {/* Inspiration Detail Modal */}
      {selectedInspiration && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black bg-opacity-40" onClick={() => setSelectedInspiration(null)}></div>

          <div className="relative bg-white rounded-lg shadow-lg max-w-4xl w-full mx-4 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Image */}
              <div className="relative h-64 md:h-auto">
                <img
                  src={selectedInspiration.image}
                  alt={selectedInspiration.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="p-6 flex flex-col">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-semibold">{selectedInspiration.title}</h3>
                  <button onClick={() => setSelectedInspiration(null)} className="text-gray-500 hover:text-gray-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <p className="text-gray-600 mt-2">{selectedInspiration.description}</p>

                <div className="mt-4 space-y-2 flex-grow">
                  <div className="flex">
                    <span className="text-sm font-medium w-24">Room:</span>
                    <span className="text-sm text-gray-700">{selectedInspiration.room}</span>
                  </div>
                  <div className="flex">
                    <span className="text-sm font-medium w-24">Product Type:</span>
                    <span className="text-sm text-gray-700">{selectedInspiration.productType}</span>
                  </div>
                  <div className="flex">
                    <span className="text-sm font-medium w-24">Color:</span>
                    <span className="text-sm text-gray-700">{selectedInspiration.color}</span>
                  </div>
                  <div className="flex">
                    <span className="text-sm font-medium w-24">Style:</span>
                    <span className="text-sm text-gray-700">{selectedInspiration.style}</span>
                  </div>
                  <div className="flex">
                    <span className="text-sm font-medium w-24">Opacity:</span>
                    <span className="text-sm text-gray-700">{selectedInspiration.opacity}</span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-1">
                  {selectedInspiration.tags.map(tag => (
                    <span
                      key={tag}
                      className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-6">
                  {product && onApplyInspiration && (
                    <button
                      onClick={() => handleApplyInspiration(selectedInspiration)}
                      className="w-full py-2 px-3 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                    >
                      Apply This Look
                    </button>
                  )}
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
