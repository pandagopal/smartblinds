import React from 'react';

interface RoomScene {
  id: string;
  name: string;
  image: string;
  description: string;
  style: 'modern' | 'traditional' | 'farmhouse' | 'coastal' | 'industrial';
}

interface RoomSceneSelectorProps {
  selectedScene: string;
  onSelectScene: (sceneId: string) => void;
}

const RoomSceneSelector: React.FC<RoomSceneSelectorProps> = ({
  selectedScene,
  onSelectScene
}) => {
  // Room scene data
  const roomScenes: RoomScene[] = [
    {
      id: 'living-modern',
      name: 'Modern Living Room',
      image: 'https://ext.same-assets.com/2035588304/3781569420.jpeg',
      description: 'A sleek, contemporary living room with clean lines and neutral colors.',
      style: 'modern'
    },
    {
      id: 'living-traditional',
      name: 'Traditional Living Room',
      image: 'https://ext.same-assets.com/2035588304/2648913570.jpeg',
      description: 'A classic living room with elegant furnishings and warm tones.',
      style: 'traditional'
    },
    {
      id: 'bedroom-modern',
      name: 'Modern Bedroom',
      image: 'https://ext.same-assets.com/2035588304/1597348620.jpeg',
      description: 'A minimalist bedroom with a calming color palette and simple design.',
      style: 'modern'
    },
    {
      id: 'bedroom-traditional',
      name: 'Traditional Bedroom',
      image: 'https://ext.same-assets.com/2035588304/3697841250.jpeg',
      description: 'A cozy bedroom with classic furniture and rich textiles.',
      style: 'traditional'
    },
    {
      id: 'kitchen-modern',
      name: 'Modern Kitchen',
      image: 'https://ext.same-assets.com/2035588304/2947613850.jpeg',
      description: 'A bright kitchen with sleek cabinetry and contemporary fixtures.',
      style: 'modern'
    },
    {
      id: 'kitchen-farmhouse',
      name: 'Farmhouse Kitchen',
      image: 'https://ext.same-assets.com/2035588304/1986437520.jpeg',
      description: 'A rustic kitchen with farmhouse elements and natural materials.',
      style: 'farmhouse'
    },
    {
      id: 'bathroom-modern',
      name: 'Modern Bathroom',
      image: 'https://ext.same-assets.com/2035588304/3876541290.jpeg',
      description: 'A spa-like bathroom with clean lines and a serene atmosphere.',
      style: 'modern'
    },
    {
      id: 'office-modern',
      name: 'Modern Home Office',
      image: 'https://ext.same-assets.com/2035588304/2658913740.jpeg',
      description: 'A productive workspace with contemporary furnishings and good lighting.',
      style: 'modern'
    },
    {
      id: 'dining-coastal',
      name: 'Coastal Dining Room',
      image: 'https://ext.same-assets.com/2035588304/1759346820.jpeg',
      description: 'A breezy dining room with coastal-inspired colors and natural light.',
      style: 'coastal'
    }
  ];

  // Find the currently selected scene
  const currentScene = roomScenes.find(scene => scene.id === selectedScene) || roomScenes[0];

  // Group scenes by room type for the dropdown
  const roomTypes = roomScenes.reduce<Record<string, RoomScene[]>>((acc, scene) => {
    const roomType = scene.id.split('-')[0]; // Extract room type from ID (e.g., "living" from "living-modern")
    if (!acc[roomType]) {
      acc[roomType] = [];
    }
    acc[roomType].push(scene);
    return acc;
  }, {});

  return (
    <div className="room-scene-selector mb-6">
      <h3 className="text-lg font-medium mb-3">Preview in Different Rooms</h3>
      <p className="text-gray-600 text-sm mb-4">
        See how your blinds will look in different room settings to help visualize the final result.
      </p>

      {/* Scene selector carousel */}
      <div className="scene-selector-carousel mb-4 overflow-x-auto pb-2">
        <div className="flex space-x-3 min-w-max">
          {roomScenes.map(scene => (
            <div
              key={scene.id}
              className={`scene-thumbnail cursor-pointer flex-shrink-0 transition-transform hover:scale-105 ${selectedScene === scene.id ? 'ring-2 ring-primary-red' : 'ring-1 ring-gray-200'}`}
              onClick={() => onSelectScene(scene.id)}
            >
              <div className="relative w-28 h-20 overflow-hidden rounded">
                <img
                  src={scene.image}
                  alt={scene.name}
                  className="w-full h-full object-cover"
                />
                {selectedScene === scene.id && (
                  <div className="absolute inset-0 bg-primary-red bg-opacity-10 flex items-center justify-center">
                    <div className="bg-primary-red rounded-full p-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-1 text-xs text-center font-medium truncate">
                {scene.name}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Room type quick filter */}
      <div className="room-type-filter mb-4 flex flex-wrap gap-2">
        {Object.keys(roomTypes).map(roomType => (
          <button
            key={roomType}
            className={`px-3 py-1 text-xs rounded-full capitalize ${
              selectedScene.startsWith(roomType)
                ? 'bg-primary-red text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => {
              // If this room type is already selected, keep the current scene
              // Otherwise, select the first scene of this room type
              if (!selectedScene.startsWith(roomType)) {
                onSelectScene(roomTypes[roomType][0].id);
              }
            }}
          >
            {roomType} rooms
          </button>
        ))}
      </div>

      {/* Current scene info */}
      <div className="current-scene bg-gray-50 p-3 rounded-lg">
        <div className="flex items-center mb-2">
          <span className="text-sm font-medium mr-2">{currentScene.name}</span>
          <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full capitalize">
            {currentScene.style} style
          </span>
        </div>
        <p className="text-xs text-gray-600">{currentScene.description}</p>
      </div>

      {/* Scene select dropdown (alternative for mobile) */}
      <div className="scene-select-dropdown mt-3 md:hidden">
        <select
          className="input w-full"
          value={selectedScene}
          onChange={(e) => onSelectScene(e.target.value)}
        >
          {Object.entries(roomTypes).map(([roomType, scenes]) => (
            <optgroup key={roomType} label={`${roomType.charAt(0).toUpperCase() + roomType.slice(1)} Rooms`}>
              {scenes.map(scene => (
                <option key={scene.id} value={scene.id}>
                  {scene.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
    </div>
  );
};

export default RoomSceneSelector;
