import React from 'react';

interface RoomSelectionProps {
  selectedRoom: string;
  onRoomSelect: (room: string) => void;
}

const RoomSelection: React.FC<RoomSelectionProps> = ({ selectedRoom, onRoomSelect }) => {
  // Room options with icons
  const roomOptions = [
    { id: 'livingRoom', name: 'Living Room', icon: '🛋️' },
    { id: 'bedroom', name: 'Bedroom', icon: '🛏️' },
    { id: 'kitchen', name: 'Kitchen', icon: '🍳' },
    { id: 'bathroom', name: 'Bathroom', icon: '🚿' },
    { id: 'office', name: 'Home Office', icon: '💻' },
    { id: 'diningRoom', name: 'Dining Room', icon: '🍽️' },
  ];

  return (
    <div className="mb-8">
      <h3 className="text-xl font-medium mb-4">Choose Your Room</h3>
      <p className="text-gray-600 mb-6">Select the room where you'll install your window treatment</p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {roomOptions.map((room) => (
          <div
            key={room.id}
            className={`border rounded-lg p-4 text-center cursor-pointer transition-all ${
              selectedRoom === room.id
                ? 'border-primary-red bg-red-50'
                : 'border-gray-200 hover:border-gray-400'
            }`}
            onClick={() => onRoomSelect(room.id)}
            role="button"
            aria-pressed={selectedRoom === room.id}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onRoomSelect(room.id);
              }
            }}
          >
            <div className="text-4xl mb-2">{room.icon}</div>
            <div className="font-medium">{room.name}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <div className="flex items-start">
          <div className="text-blue-500 mr-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-sm text-blue-800">
            Selecting your room helps us recommend the best options for your specific needs.
            Different rooms have different light, privacy, and moisture requirements.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoomSelection;
