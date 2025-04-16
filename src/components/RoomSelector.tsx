import React from 'react';

type RoomType = 'living' | 'bedroom' | 'kitchen' | 'bathroom' | 'office' | 'dining' | 'children' | 'other';

interface RoomSelectorProps {
  selectedRoom: RoomType;
  onChange: (room: RoomType) => void;
}

const RoomSelector: React.FC<RoomSelectorProps> = ({
  selectedRoom,
  onChange
}) => {
  return (
    <div className="mb-6">
      <h3 className="text-md font-medium mb-3">Choose Your Room</h3>
      <div className="grid grid-cols-4 gap-3">
        <button
          className={`flex flex-col items-center justify-center p-3 border rounded ${
            selectedRoom === 'living'
              ? 'bg-primary-red text-white border-primary-red'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
          onClick={() => onChange('living')}
        >
          <svg className="w-6 h-6 mb-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 10.5V18C3 18.5523 3.44772 19 4 19H20C20.5523 19 21 18.5523 21 18V10.5M3 10.5L12 3L21 10.5M3 10.5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-xs">Living Room</span>
        </button>

        <button
          className={`flex flex-col items-center justify-center p-3 border rounded ${
            selectedRoom === 'bedroom'
              ? 'bg-primary-red text-white border-primary-red'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
          onClick={() => onChange('bedroom')}
        >
          <svg className="w-6 h-6 mb-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="10" width="16" height="8" rx="1" stroke="currentColor" strokeWidth="2"/>
            <path d="M6 10V7C6 6.44772 6.44772 6 7 6H17C17.5523 6 18 6.44772 18 7V10" stroke="currentColor" strokeWidth="2"/>
            <path d="M6 18V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M18 18V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span className="text-xs">Bedroom</span>
        </button>

        <button
          className={`flex flex-col items-center justify-center p-3 border rounded ${
            selectedRoom === 'kitchen'
              ? 'bg-primary-red text-white border-primary-red'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
          onClick={() => onChange('kitchen')}
        >
          <svg className="w-6 h-6 mb-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 8H18V19C18 19.5523 17.5523 20 17 20H7C6.44772 20 6 19.5523 6 19V8Z" stroke="currentColor" strokeWidth="2"/>
            <path d="M5 5H19V8H5V5Z" stroke="currentColor" strokeWidth="2"/>
            <path d="M9 12V16" stroke="currentColor" strokeWidth="2"/>
            <path d="M15 12V16" stroke="currentColor" strokeWidth="2"/>
          </svg>
          <span className="text-xs">Kitchen</span>
        </button>

        <button
          className={`flex flex-col items-center justify-center p-3 border rounded ${
            selectedRoom === 'bathroom'
              ? 'bg-primary-red text-white border-primary-red'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
          onClick={() => onChange('bathroom')}
        >
          <svg className="w-6 h-6 mb-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 12H20V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V12Z" stroke="currentColor" strokeWidth="2"/>
            <path d="M4 12V8C4 7.44772 4.44772 7 5 7H7C7.55228 7 8 7.44772 8 8V12" stroke="currentColor" strokeWidth="2"/>
            <path d="M16 4L16 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M16 9L16 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M20 12H4" stroke="currentColor" strokeWidth="2"/>
          </svg>
          <span className="text-xs">Bathroom</span>
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3 mt-3">
        <button
          className={`flex flex-col items-center justify-center p-3 border rounded ${
            selectedRoom === 'office'
              ? 'bg-primary-red text-white border-primary-red'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
          onClick={() => onChange('office')}
        >
          <svg className="w-6 h-6 mb-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="5" width="16" height="14" rx="1" stroke="currentColor" strokeWidth="2"/>
            <path d="M8 19V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M16 19V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <rect x="8" y="9" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="2"/>
          </svg>
          <span className="text-xs">Office</span>
        </button>

        <button
          className={`flex flex-col items-center justify-center p-3 border rounded ${
            selectedRoom === 'dining'
              ? 'bg-primary-red text-white border-primary-red'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
          onClick={() => onChange('dining')}
        >
          <svg className="w-6 h-6 mb-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="2"/>
            <path d="M8 12H16" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 8L12 16" stroke="currentColor" strokeWidth="2"/>
            <path d="M7 7L4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M17 7L20 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M7 17L4 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M17 17L20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span className="text-xs">Dining Room</span>
        </button>

        <button
          className={`flex flex-col items-center justify-center p-3 border rounded ${
            selectedRoom === 'children'
              ? 'bg-primary-red text-white border-primary-red'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
          onClick={() => onChange('children')}
        >
          <svg className="w-6 h-6 mb-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="10" cy="9" r="4" stroke="currentColor" strokeWidth="2"/>
            <path d="M2 20C2 17.2386 4.23858 15 7 15H13C15.7614 15 18 17.2386 18 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M16 5L22 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M16 13L22 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span className="text-xs">Children's Room</span>
        </button>

        <button
          className={`flex flex-col items-center justify-center p-3 border rounded ${
            selectedRoom === 'other'
              ? 'bg-primary-red text-white border-primary-red'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
          onClick={() => onChange('other')}
        >
          <svg className="w-6 h-6 mb-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 8H14V18H10V8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4 12H8V18H4V12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 6H20V18H16V6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-xs">Other</span>
        </button>
      </div>
    </div>
  );
};

export default RoomSelector;
