import React, { useEffect, useState } from 'react';
import { Product } from '../../models/Product';

interface DynamicProductPreviewProps {
  product: Product;
  selectedOptions: Record<string, string>;
  width: number;
  height: number;
}

const DynamicProductPreview: React.FC<DynamicProductPreviewProps> = ({
  product,
  selectedOptions,
  width,
  height
}) => {
  const [previewImage, setPreviewImage] = useState<string>(product.image);
  const [windowStyle, setWindowStyle] = useState<'modern' | 'traditional' | 'farmhouse'>('modern');
  const [opacity, setOpacity] = useState<number>(1);
  const [lightLevel, setLightLevel] = useState<'day' | 'evening' | 'night'>('day');

  // Map colors to styles for visualization
  useEffect(() => {
    // Update window style based on selected color
    if (selectedOptions['Color']) {
      const colorName = selectedOptions['Color'].toLowerCase();
      if (colorName.includes('white') || colorName.includes('gray')) {
        setWindowStyle('modern');
      } else if (colorName.includes('tan') || colorName.includes('brown')) {
        setWindowStyle('traditional');
      } else if (colorName.includes('golden') || colorName.includes('oak') || colorName.includes('walnut')) {
        setWindowStyle('farmhouse');
      }
    }

    // Set opacity based on opacity selection
    if (selectedOptions['Opacity']) {
      const opacityType = selectedOptions['Opacity'].toLowerCase();
      if (opacityType.includes('blackout')) {
        setOpacity(0.05); // Almost no light passes through
      } else if (opacityType.includes('room darkening') || opacityType.includes('dark')) {
        setOpacity(0.3); // Some light passes through
      } else if (opacityType.includes('light filtering')) {
        setOpacity(0.7); // Most light passes through
      } else if (opacityType.includes('sheer')) {
        setOpacity(0.9); // Nearly all light passes through
      } else {
        setOpacity(0.5); // Default, medium opacity
      }
    }

    // Create a canvas to manipulate the image
    const canvas = document.createElement('canvas');
    const img = new Image();

    img.crossOrigin = 'anonymous';
    img.src = product.image;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw the base image
      ctx.drawImage(img, 0, 0);

      // Apply any styling or overlays based on options
      if (selectedOptions['Mount Type'] === 'Inside Mount') {
        // Draw a frame to indicate inside mount
        ctx.strokeStyle = '#aaaaaa';
        ctx.lineWidth = 16;
        ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);
      }

      // Apply valance if selected
      if (selectedOptions['Valance Type'] === 'Deluxe' || selectedOptions['Valance Type'] === 'Standard') {
        ctx.fillStyle = selectedOptions['Valance Type'] === 'Deluxe' ? '#dedede' : '#f5f5f5';
        ctx.fillRect(5, 5, canvas.width - 10, 25);
      }

      // Convert canvas to image and apply filters
      const imageWithOverlays = canvas.toDataURL('image/jpeg');

      // Apply filter effects using CSS filter in the component's style
      // We'll store the filter in state to apply it in the render
      setPreviewImage(imageWithOverlays);
    };
  }, [product.image, selectedOptions, width, height]);

  // Toggle light level
  const toggleLightLevel = () => {
    const levels: ('day' | 'evening' | 'night')[] = ['day', 'evening', 'night'];
    const currentIndex = levels.indexOf(lightLevel);
    const nextIndex = (currentIndex + 1) % levels.length;
    setLightLevel(levels[nextIndex]);
  };

  // Get background color based on light level
  const getLightLevelBackground = () => {
    switch (lightLevel) {
      case 'day':
        return 'rgba(173, 216, 230, 0.3)'; // Light blue sky
      case 'evening':
        return 'rgba(255, 153, 51, 0.4)'; // Orange sunset
      case 'night':
        return 'rgba(0, 0, 51, 0.8)'; // Dark blue night
    }
  };

  // Get brightness multiplier based on light level
  const getLightLevelBrightness = () => {
    switch (lightLevel) {
      case 'day':
        return 1;
      case 'evening':
        return 0.7;
      case 'night':
        return 0.3;
    }
  };

  return (
    <div className="product-visualization relative">
      {/* Light level toggle */}
      <div className="light-toggle absolute top-2 right-2 z-10">
        <button
          onClick={toggleLightLevel}
          className="bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors"
          title={`Current: ${lightLevel}. Click to change light level`}
        >
          {lightLevel === 'day' && (
            <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
            </svg>
          )}
          {lightLevel === 'evening' && (
            <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          )}
          {lightLevel === 'night' && (
            <svg className="w-5 h-5 text-indigo-900" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          )}
        </button>
      </div>

      <div className="relative border rounded-lg overflow-hidden">
        {/* Background light effect */}
        <div
          className="absolute inset-0 transition-colors duration-500"
          style={{ backgroundColor: getLightLevelBackground() }}
        ></div>

        <div className={`window-frame ${windowStyle} relative`}>
          {/* Main image */}
          <img
            src={previewImage}
            alt={product.title}
            className="w-full h-64 object-cover transition-all duration-300 relative z-10"
            style={{
              filter: `brightness(${getLightLevelBrightness()}) ${
                selectedOptions['Color']?.toLowerCase().includes('white') ? 'brightness(1.1) saturate(0.8)' :
                selectedOptions['Color']?.toLowerCase().includes('cream') ? 'sepia(0.3) brightness(1.05)' :
                selectedOptions['Color']?.toLowerCase().includes('tan') ? 'sepia(0.5) brightness(0.95)' :
                selectedOptions['Color']?.toLowerCase().includes('brown') ? 'sepia(0.7) brightness(0.8)' :
                selectedOptions['Color']?.toLowerCase().includes('gray') ? 'grayscale(1) brightness(0.9)' :
                selectedOptions['Color']?.toLowerCase().includes('black') ? 'brightness(0.7) contrast(1.2)' :
                selectedOptions['Color']?.toLowerCase().includes('navy') ? 'hue-rotate(240deg) brightness(0.8)' :
                selectedOptions['Color']?.toLowerCase().includes('red') ? 'hue-rotate(330deg) saturate(1.5) brightness(0.9)' :
                selectedOptions['Color']?.toLowerCase().includes('golden') || selectedOptions['Color']?.toLowerCase().includes('oak') ? 'sepia(0.6) saturate(1.2) brightness(0.9)' :
                selectedOptions['Color']?.toLowerCase().includes('walnut') ? 'sepia(0.8) saturate(0.9) brightness(0.7)' : 'none'
              }`
            }}
          />

          {/* Light passing through overlay - simulates the opacity */}
          <div
            className="absolute inset-0 bg-white z-20 pointer-events-none transition-opacity duration-300"
            style={{
              opacity: 1 - opacity,
              mixBlendMode: 'multiply'
            }}
          ></div>
        </div>

        {/* Overlay to represent mount type */}
        {selectedOptions['Mount Type'] === 'Inside Mount' && (
          <div className="absolute inset-4 border-8 border-gray-300 rounded pointer-events-none z-30"></div>
        )}

        {/* Overlay for valance */}
        {selectedOptions['Valance Type'] === 'Deluxe' && (
          <div className="absolute top-0 left-0 right-0 h-6 bg-gray-200 pointer-events-none z-30"></div>
        )}
        {selectedOptions['Valance Type'] === 'Standard' && (
          <div className="absolute top-0 left-0 right-0 h-4 bg-gray-100 pointer-events-none z-30"></div>
        )}

        {/* Control side indicator */}
        {selectedOptions['Control Type'] !== 'Cordless' && (
          <div
            className={`absolute bottom-4 h-12 w-4 bg-gray-400 pointer-events-none z-30
                      ${selectedOptions['Control Side'] === 'Left' ? 'left-4' :
                        selectedOptions['Control Side'] === 'Right' ? 'right-4' : 'left-1/2 -ml-2'}`}
          ></div>
        )}
      </div>

      {/* Dimension indicators */}
      <div className="flex justify-between mt-2 text-xs text-gray-600">
        <div>Width: {width}" </div>
        <div>Height: {height}"</div>
      </div>

      {/* Light simulator info */}
      <div className="mt-2 text-xs text-gray-500 flex items-center">
        <svg className="w-4 h-4 mr-1 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
        </svg>
        Tip: Click the light icon to see how your blinds look at different times of day
      </div>

      <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-md text-sm">
        <p><strong>Note:</strong> This visualization is a representation. Actual product may vary slightly in appearance.</p>
      </div>
    </div>
  );
};

export default DynamicProductPreview;
