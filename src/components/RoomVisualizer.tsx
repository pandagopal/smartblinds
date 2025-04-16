import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Product, SAMPLE_PRODUCTS } from '../models/Product';

interface RoomSetting {
  id: string;
  name: string;
  image: string;
  windows: {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }[];
}

const ROOM_SETTINGS: RoomSetting[] = [
  {
    id: 'living-room',
    name: 'Living Room',
    image: 'https://ext.same-assets.com/2035588304/7252267349.jpeg',
    windows: [
      {
        id: 'window-1',
        x: 32,
        y: 25,
        width: 36,
        height: 45
      },
      {
        id: 'window-2',
        x: 70,
        y: 25,
        width: 36,
        height: 45
      }
    ]
  },
  {
    id: 'bedroom',
    name: 'Bedroom',
    image: 'https://ext.same-assets.com/2035588304/9797483810.jpeg',
    windows: [
      {
        id: 'window-1',
        x: 50,
        y: 20,
        width: 40,
        height: 50
      }
    ]
  },
  {
    id: 'kitchen',
    name: 'Kitchen',
    image: 'https://ext.same-assets.com/2035588304/4301068902.jpeg',
    windows: [
      {
        id: 'window-1',
        x: 45,
        y: 15,
        width: 45,
        height: 30
      }
    ]
  },
  {
    id: 'bathroom',
    name: 'Bathroom',
    image: 'https://ext.same-assets.com/2035588304/4747246071.jpeg',
    windows: [
      {
        id: 'window-1',
        x: 65,
        y: 20,
        width: 25,
        height: 25
      }
    ]
  },
  {
    id: 'office',
    name: 'Home Office',
    image: 'https://ext.same-assets.com/2035588304/3068037304.jpeg',
    windows: [
      {
        id: 'window-1',
        x: 15,
        y: 20,
        width: 25,
        height: 50
      },
      {
        id: 'window-2',
        x: 45,
        y: 20,
        width: 25,
        height: 50
      }
    ]
  }
];

const blindsTypes = [
  { id: '1', name: 'Cellular Shades', category: 'Cellular Shades' },
  { id: '2', name: 'Faux Wood Blinds', category: 'Faux Wood Blinds' },
  { id: '3', name: 'Roller Shades', category: 'Roller Shades' }
];

const colorOptions = [
  { name: 'White', value: '#FFFFFF' },
  { name: 'Off-White', value: '#F5F5F5' },
  { name: 'Gray', value: '#808080' },
  { name: 'Beige', value: '#F5F5DC' },
  { name: 'Black', value: '#000000' },
  { name: 'Brown', value: '#964B00' },
  { name: 'Wood', value: '#855E42' }
];

const controlTypes = [
  'Standard Cord',
  'Cordless',
  'Motorized'
];

const RoomVisualizer: React.FC = () => {
  const [selectedRoom, setSelectedRoom] = useState<RoomSetting>(ROOM_SETTINGS[0]);
  const [selectedBlindsType, setSelectedBlindsType] = useState<string>(blindsTypes[0].id);
  const [selectedColor, setSelectedColor] = useState<string>(colorOptions[0].name);
  const [selectedControl, setSelectedControl] = useState<string>(controlTypes[0]);
  const [selectedPosition, setSelectedPosition] = useState<'open' | 'half' | 'closed'>('closed');
  const [showBlinds, setShowBlinds] = useState<boolean>(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [windowOpacity, setWindowOpacity] = useState<Record<string, number>>({});
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);

  // Initialize window opacity values
  useEffect(() => {
    const opacityValues: Record<string, number> = {};
    selectedRoom.windows.forEach(window => {
      opacityValues[window.id] = selectedPosition === 'open' ? 0 :
                                selectedPosition === 'half' ? 0.5 : 0.9;
    });
    setWindowOpacity(opacityValues);
  }, [selectedRoom, selectedPosition]);

  // Draw the room visualization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Load and draw room image
    const roomImage = new Image();
    roomImage.src = selectedRoom.image;
    roomImage.onload = () => {
      // Draw room
      ctx.drawImage(roomImage, 0, 0, canvas.width, canvas.height);

      // Only draw blinds if showBlinds is true
      if (showBlinds) {
        // Draw blinds in each window
        selectedRoom.windows.forEach(window => {
          const windowX = (window.x / 100) * canvas.width;
          const windowY = (window.y / 100) * canvas.height;
          const windowWidth = (window.width / 100) * canvas.width;
          const windowHeight = (window.height / 100) * canvas.height;

          // Set color based on selection
          let blindColor = colorOptions.find(c => c.name === selectedColor)?.value || '#FFFFFF';

          // Draw blinds
          ctx.fillStyle = `${blindColor}${Math.round(windowOpacity[window.id] * 255).toString(16).padStart(2, '0')}`;
          ctx.fillRect(windowX, windowY, windowWidth, windowHeight);

          // For faux wood blinds, add horizontal lines to simulate slats
          if (selectedBlindsType === '2' && selectedPosition !== 'open') {
            const numSlats = 10;
            const slatHeight = windowHeight / numSlats;
            ctx.strokeStyle = '#00000040';
            ctx.lineWidth = 1;

            for (let i = 1; i < numSlats; i++) {
              ctx.beginPath();
              ctx.moveTo(windowX, windowY + i * slatHeight);
              ctx.lineTo(windowX + windowWidth, windowY + i * slatHeight);
              ctx.stroke();
            }
          }

          // Draw window frame
          ctx.strokeStyle = '#555555';
          ctx.lineWidth = 2;
          ctx.strokeRect(windowX, windowY, windowWidth, windowHeight);

          // For cordless/motorized options, don't draw cords
          if (selectedControl !== 'Standard Cord') return;

          // Draw cord for standard blinds
          ctx.strokeStyle = '#888888';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(windowX + windowWidth - 5, windowY);
          ctx.lineTo(windowX + windowWidth - 5, windowY + windowHeight + 20);
          ctx.stroke();
        });
      }
    };
  }, [selectedRoom, selectedColor, selectedBlindsType, windowOpacity, selectedControl, showBlinds]);

  // Find suggested products based on selections
  useEffect(() => {
    const categoryName = blindsTypes.find(b => b.id === selectedBlindsType)?.category || '';

    // Filter products based on selected criteria
    const filteredProducts = SAMPLE_PRODUCTS.filter(product => {
      // Match by category
      if (product.category !== categoryName) return false;

      // Match by color if possible
      const colorOption = product.options.find(opt => opt.name === 'Color');
      if (colorOption && !colorOption.values.some(v => v.includes(selectedColor))) {
        return false;
      }

      // Match by control type if possible
      const controlOption = product.options.find(opt => opt.name === 'Control Type');
      if (controlOption && !controlOption.values.some(v => v.includes(selectedControl))) {
        return false;
      }

      return true;
    });

    // Take top 3 matches or fewer if not available
    setSuggestedProducts(filteredProducts.slice(0, 3));
  }, [selectedBlindsType, selectedColor, selectedControl]);

  const handleRoomChange = (roomId: string) => {
    const room = ROOM_SETTINGS.find(r => r.id === roomId);
    if (room) {
      setSelectedRoom(room);
    }
  };

  const handleToggleBlinds = () => {
    setShowBlinds(!showBlinds);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Room Visualizer</h1>
      <p className="text-gray-600 mb-8">
        See how different window treatments will look in your home. Customize blinds and shades to match your decor.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Panel */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Customization Options</h2>

          {/* Room Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Room</label>
            <div className="grid grid-cols-3 gap-2">
              {ROOM_SETTINGS.map(room => (
                <button
                  key={room.id}
                  onClick={() => handleRoomChange(room.id)}
                  className={`p-1 rounded overflow-hidden ${selectedRoom.id === room.id ? 'ring-2 ring-primary-red' : 'border border-gray-200'}`}
                >
                  <img src={room.image} alt={room.name} className="w-full h-16 object-cover rounded" />
                  <p className="text-xs text-center mt-1">{room.name}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Blinds Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Blinds Type</label>
            <div className="grid grid-cols-1 gap-2">
              {blindsTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => setSelectedBlindsType(type.id)}
                  className={`p-2 rounded text-left ${selectedBlindsType === type.id ? 'bg-primary-red text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  {type.name}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
            <div className="grid grid-cols-4 gap-2">
              {colorOptions.map(color => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(color.name)}
                  className={`p-1 rounded-md border ${selectedColor === color.name ? 'border-primary-red' : 'border-gray-200'}`}
                >
                  <div
                    className="h-8 w-full rounded"
                    style={{ backgroundColor: color.value }}
                  ></div>
                  <p className="text-xs text-center mt-1">{color.name}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Control Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Control Type</label>
            <select
              value={selectedControl}
              onChange={(e) => setSelectedControl(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-primary-red focus:border-primary-red"
            >
              {controlTypes.map(control => (
                <option key={control} value={control}>{control}</option>
              ))}
            </select>
          </div>

          {/* Position Slider */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Blind Position</label>
            <div className="flex justify-between mb-2">
              <button
                onClick={() => setSelectedPosition('open')}
                className={`px-3 py-1 rounded text-sm ${selectedPosition === 'open' ? 'bg-primary-red text-white' : 'bg-gray-100'}`}
              >
                Open
              </button>
              <button
                onClick={() => setSelectedPosition('half')}
                className={`px-3 py-1 rounded text-sm ${selectedPosition === 'half' ? 'bg-primary-red text-white' : 'bg-gray-100'}`}
              >
                Half Open
              </button>
              <button
                onClick={() => setSelectedPosition('closed')}
                className={`px-3 py-1 rounded text-sm ${selectedPosition === 'closed' ? 'bg-primary-red text-white' : 'bg-gray-100'}`}
              >
                Closed
              </button>
            </div>
          </div>

          {/* Toggle Blinds Checkbox */}
          <div className="flex items-center mb-4">
            <input
              id="show-blinds"
              type="checkbox"
              checked={showBlinds}
              onChange={handleToggleBlinds}
              className="h-4 w-4 text-primary-red focus:ring-primary-red border-gray-300 rounded"
            />
            <label htmlFor="show-blinds" className="ml-2 block text-sm text-gray-700">
              Show window treatments
            </label>
          </div>
        </div>

        {/* Visualization Panel */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="relative">
              <canvas
                ref={canvasRef}
                width={800}
                height={500}
                className="w-full h-auto"
              />
              <div className="absolute bottom-4 right-4 bg-white/80 px-3 py-2 rounded-lg text-sm text-gray-700">
                {selectedRoom.name} with {selectedColor} {blindsTypes.find(b => b.id === selectedBlindsType)?.name || 'Blinds'}
              </div>
            </div>
          </div>

          {/* Suggested Products */}
          {suggestedProducts.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4">Recommended Products</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {suggestedProducts.map(product => (
                  <div key={product.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    <Link to={`/product/${product.id}`}>
                      <div className="h-36 overflow-hidden">
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium text-md mb-1">{product.title}</h3>
                        <div className="flex justify-between items-center">
                          <div className="font-bold text-primary-red">
                            ${(product.basePrice || 0).toFixed(2)}
                          </div>
                          <div className="flex">
                            {Array(5).fill(0).map((_, i) => (
                              <svg
                                key={i}
                                className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Link>
                    <div className="px-3 pb-3">
                      <Link
                        to={`/product/configure/${product.id}`}
                        className="block w-full text-center bg-primary-red hover:bg-red-700 text-white py-1 px-3 rounded text-sm transition"
                      >
                        Configure
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomVisualizer;
