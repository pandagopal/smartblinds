import React, { useState, useEffect } from 'react';
import { Product } from '../../models/Product';

interface RoomVisualizationProps {
  product: Product;
  selectedOptions: Record<string, string>;
  width: number;
  height: number;
}

const RoomVisualization: React.FC<RoomVisualizationProps> = ({
  product,
  selectedOptions,
  width,
  height
}) => {
  const [selectedRoom, setSelectedRoom] = useState<string>('living-room');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Room images with windows
  const roomImages = {
    'living-room': 'https://ext.same-assets.com/2035588304/living-room-window.jpg',
    'bedroom': 'https://ext.same-assets.com/2035588304/bedroom-window.jpg',
    'kitchen': 'https://ext.same-assets.com/2035588304/kitchen-window.jpg',
    'office': 'https://ext.same-assets.com/2035588304/office-window.jpg',
    'bathroom': 'https://ext.same-assets.com/2035588304/bathroom-window.jpg'
  };

  // Adjust selected room based on Room Type option if present
  useEffect(() => {
    if (selectedOptions['Room Type']) {
      const roomType = selectedOptions['Room Type'].toLowerCase();
      if (roomType.includes('living')) {
        setSelectedRoom('living-room');
      } else if (roomType.includes('bed')) {
        setSelectedRoom('bedroom');
      } else if (roomType.includes('kitchen')) {
        setSelectedRoom('kitchen');
      } else if (roomType.includes('office')) {
        setSelectedRoom('office');
      } else if (roomType.includes('bath')) {
        setSelectedRoom('bathroom');
      }
    }
  }, [selectedOptions['Room Type']]);

  // Get filter style based on color selection
  const getFilterStyle = () => {
    if (!selectedOptions['Color']) return '';

    const colorName = selectedOptions['Color'].toLowerCase();
    if (colorName.includes('white')) {
      return 'brightness(1.1) saturate(0.8)';
    } else if (colorName.includes('cream')) {
      return 'sepia(0.3) brightness(1.05)';
    } else if (colorName.includes('tan')) {
      return 'sepia(0.5) brightness(0.95)';
    } else if (colorName.includes('brown')) {
      return 'sepia(0.7) brightness(0.8)';
    } else if (colorName.includes('gray')) {
      return 'grayscale(1) brightness(0.9)';
    } else if (colorName.includes('black')) {
      return 'brightness(0.7) contrast(1.2)';
    } else if (colorName.includes('navy')) {
      return 'hue-rotate(240deg) brightness(0.8)';
    } else if (colorName.includes('red')) {
      return 'hue-rotate(330deg) saturate(1.5) brightness(0.9)';
    } else if (colorName.includes('golden') || colorName.includes('oak')) {
      return 'sepia(0.6) saturate(1.2) brightness(0.9)';
    } else if (colorName.includes('walnut')) {
      return 'sepia(0.8) saturate(0.9) brightness(0.7)';
    }

    return '';
  };

  return (
    <div className="room-visualization mt-6">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-medium">Room Visualization</h3>
        <button
          className="text-blue-600 text-sm flex items-center"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Hide Rooms' : 'Show All Rooms'}
          <svg
            className={`ml-1 w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Main visualization */}
      <div className="rounded-lg overflow-hidden border border-gray-200 relative">
        <div
          className="h-64 bg-cover bg-center transition-all"
          style={{ backgroundImage: `url(${roomImages[selectedRoom as keyof typeof roomImages]})` }}
        >
          {/* Blind overlay */}
          <div
            className="absolute window-overlay"
            style={{
              top: '15%',
              left: '25%',
              width: '50%',
              height: '70%',
              background: selectedOptions['Color']?.toLowerCase().includes('white') ? 'rgba(255, 255, 255, 0.85)' :
                         selectedOptions['Color']?.toLowerCase().includes('cream') ? 'rgba(255, 250, 240, 0.85)' :
                         selectedOptions['Color']?.toLowerCase().includes('tan') ? 'rgba(210, 180, 140, 0.85)' :
                         selectedOptions['Color']?.toLowerCase().includes('brown') ? 'rgba(150, 75, 0, 0.85)' :
                         selectedOptions['Color']?.toLowerCase().includes('gray') ? 'rgba(128, 128, 128, 0.85)' :
                         selectedOptions['Color']?.toLowerCase().includes('black') ? 'rgba(0, 0, 0, 0.85)' :
                         selectedOptions['Color']?.toLowerCase().includes('navy') ? 'rgba(0, 0, 128, 0.85)' :
                         selectedOptions['Color']?.toLowerCase().includes('red') ? 'rgba(255, 0, 0, 0.85)' :
                         'rgba(255, 255, 255, 0.85)',
              filter: getFilterStyle(),
              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.1)',
              borderRadius: '2px',
            }}
          >
            {/* Slats visualization */}
            {Array.from({ length: 15 }).map((_, index) => (
              <div
                key={index}
                className="slat"
                style={{
                  position: 'absolute',
                  left: '0',
                  right: '0',
                  height: '4px',
                  top: `${(index + 1) * 6}%`,
                  backgroundColor: 'rgba(0,0,0,0.1)',
                  borderBottom: '1px solid rgba(255,255,255,0.3)'
                }}
              />
            ))}

            {/* Control visualization */}
            {selectedOptions['Control Type'] !== 'Cordless' && (
              <div
                className="control-cord"
                style={{
                  position: 'absolute',
                  bottom: '-10%',
                  [selectedOptions['Control Side'] === 'Left' ? 'left' : 'right']: '10%',
                  width: '2px',
                  height: '30%',
                  backgroundColor: '#999',
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Room selector - expanded view */}
      <div
        className={`grid grid-cols-5 gap-2 mt-3 transition-all ${
          isExpanded ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        {Object.entries(roomImages).map(([roomKey, imageUrl]) => (
          <div
            key={roomKey}
            className={`cursor-pointer rounded-md overflow-hidden border-2 transition-all ${
              selectedRoom === roomKey ? 'border-blue-500 shadow-md' : 'border-transparent'
            }`}
            onClick={() => setSelectedRoom(roomKey)}
          >
            <div
              className="h-20 bg-cover bg-center"
              style={{ backgroundImage: `url(${imageUrl})` }}
            />
            <div className="bg-white text-center py-1 text-xs">
              {roomKey.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 text-xs text-gray-500">
        This visualization is an approximation. Appearance may vary based on lighting and room conditions.
      </div>
    </div>
  );
};

export default RoomVisualization;
