import React, { useState, useEffect } from 'react';

interface WindowSimulatorProps {
  opacity: string;
  color: string;
  colorHex?: string;
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
}

const WindowSimulator: React.FC<WindowSimulatorProps> = ({
  opacity,
  color,
  colorHex = '#ffffff',
  timeOfDay = 'afternoon'
}) => {
  const [lightIntensity, setLightIntensity] = useState<number>(80);
  const [sceneImage, setSceneImage] = useState<string>('');

  // Determine light intensity based on opacity selection
  useEffect(() => {
    switch (opacity.toLowerCase()) {
      case 'blackout':
        setLightIntensity(5);
        break;
      case 'room darkening':
        setLightIntensity(15);
        break;
      case 'light filtering':
        setLightIntensity(50);
        break;
      case 'sheer':
        setLightIntensity(75);
        break;
      default:
        setLightIntensity(80);
    }
  }, [opacity]);

  // Set background scene based on time of day
  useEffect(() => {
    switch (timeOfDay) {
      case 'morning':
        setSceneImage('https://ext.same-assets.com/3711297165/2384756092.jpg');
        break;
      case 'afternoon':
        setSceneImage('https://ext.same-assets.com/3711297165/8273645109.jpg');
        break;
      case 'evening':
        setSceneImage('https://ext.same-assets.com/3711297165/7362518903.jpg');
        break;
      case 'night':
        setSceneImage('https://ext.same-assets.com/3711297165/6253419876.jpg');
        break;
      default:
        setSceneImage('https://ext.same-assets.com/3711297165/8273645109.jpg');
    }
  }, [timeOfDay]);

  // Calculate color with transparency for light filtering effect
  const getFilteredLightColor = () => {
    // Convert hex to rgba with alpha based on light intensity
    if (colorHex.startsWith('#')) {
      const r = parseInt(colorHex.slice(1, 3), 16);
      const g = parseInt(colorHex.slice(3, 5), 16);
      const b = parseInt(colorHex.slice(5, 7), 16);
      const alpha = Math.max(0.1, 1 - (lightIntensity / 100));
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    return colorHex;
  };

  // Calculate ambient light color
  const getAmbientLightColor = () => {
    switch (timeOfDay) {
      case 'morning':
        return 'rgba(255, 236, 179, 0.8)'; // Warm yellow morning light
      case 'afternoon':
        return 'rgba(255, 255, 255, 0.8)'; // Bright white afternoon light
      case 'evening':
        return 'rgba(255, 196, 140, 0.8)'; // Orange sunset light
      case 'night':
        return 'rgba(100, 149, 237, 0.3)'; // Dark blue moonlight
      default:
        return 'rgba(255, 255, 255, 0.8)';
    }
  };

  return (
    <div className="window-simulator rounded-lg overflow-hidden border border-gray-300">
      <div className="flex justify-between items-center bg-gray-100 px-4 py-2 border-b border-gray-300">
        <h3 className="text-base font-semibold">Window Light Simulator</h3>
        <div className="flex space-x-2">
          <button
            className={`px-2 py-1 text-xs rounded ${timeOfDay === 'morning' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setSceneImage('https://ext.same-assets.com/3711297165/2384756092.jpg')}
          >
            Morning
          </button>
          <button
            className={`px-2 py-1 text-xs rounded ${timeOfDay === 'afternoon' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setSceneImage('https://ext.same-assets.com/3711297165/8273645109.jpg')}
          >
            Afternoon
          </button>
          <button
            className={`px-2 py-1 text-xs rounded ${timeOfDay === 'evening' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setSceneImage('https://ext.same-assets.com/3711297165/7362518903.jpg')}
          >
            Evening
          </button>
          <button
            className={`px-2 py-1 text-xs rounded ${timeOfDay === 'night' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setSceneImage('https://ext.same-assets.com/3711297165/6253419876.jpg')}
          >
            Night
          </button>
        </div>
      </div>

      <div className="relative h-64 bg-gray-200">
        {/* Room scene */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${sceneImage || 'https://ext.same-assets.com/3711297165/8273645109.jpg'})` }}
        ></div>

        {/* Window frame */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-56 h-44 border-8 border-gray-100 bg-transparent shadow-lg">
            {/* Window glass */}
            <div className="absolute inset-0 bg-white opacity-10"></div>

            {/* Light filtering through blinds */}
            <div
              className="absolute inset-0"
              style={{
                background: getFilteredLightColor(),
                boxShadow: `inset 0 0 30px ${getAmbientLightColor()}`
              }}
            ></div>

            {/* Blind slats effect */}
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="absolute left-0 right-0 h-1.5 bg-gradient-to-b from-transparent via-white to-transparent"
                style={{
                  top: `${index * 12.5}%`,
                  opacity: lightIntensity < 10 ? 0 : 0.2,
                  backgroundColor: colorHex
                }}
              ></div>
            ))}

            {/* Light beams through blinds */}
            {lightIntensity > 20 && (
              <div className="absolute inset-0">
                {Array.from({ length: 10 }).map((_, index) => (
                  <div
                    key={`beam-${index}`}
                    className="absolute h-0.5 bg-white"
                    style={{
                      top: `${5 + (index * 10)}%`,
                      left: 0,
                      right: 0,
                      opacity: lightIntensity / 100,
                      boxShadow: `0 0 10px 5px ${getAmbientLightColor()}`
                    }}
                  ></div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 py-3 bg-white">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-sm font-medium">Current Opacity: </span>
            <span className="text-sm">{opacity}</span>
          </div>
          <div>
            <span className="text-sm font-medium">Light Transmission: </span>
            <span className="text-sm">{lightIntensity}%</span>
          </div>
        </div>
        <div className="mt-2">
          <p className="text-xs text-gray-600">
            This simulation shows how {color.toLowerCase()} blinds with {opacity.toLowerCase()} opacity will filter light
            through your window at different times of day.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WindowSimulator;
