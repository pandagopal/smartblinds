import React from 'react';

type OpacityOption = 'light_filtering' | 'room_darkening' | 'blackout';

interface OpacitySelectorProps {
  selectedOpacity: OpacityOption;
  onChange: (opacity: OpacityOption) => void;
}

const OpacitySelector: React.FC<OpacitySelectorProps> = ({
  selectedOpacity,
  onChange
}) => {
  return (
    <div className="mb-6">
      <h3 className="text-md font-medium mb-3">Opacity</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          className={`border rounded py-2 px-4 text-center flex flex-col items-center ${
            selectedOpacity === 'light_filtering'
              ? 'bg-primary-red text-white border-primary-red'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
          onClick={() => onChange('light_filtering')}
        >
          <svg className="w-6 h-6 mb-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 4V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 4C14.7614 4 17 8.02944 17 13C17 17.9706 14.7614 22 12 22C9.23858 22 7 17.9706 7 13C7 8.02944 9.23858 4 12 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Light Filtering</span>
        </button>

        <button
          className={`border rounded py-2 px-4 text-center flex flex-col items-center ${
            selectedOpacity === 'room_darkening'
              ? 'bg-primary-red text-white border-primary-red'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
          onClick={() => onChange('room_darkening')}
        >
          <svg className="w-6 h-6 mb-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 5C19.6569 5 21 6.34315 21 8V16C21 17.6569 19.6569 19 18 19H6C4.34315 19 3 17.6569 3 16V8C3 6.34315 4.34315 5 6 5H18Z" stroke="currentColor" strokeWidth="2"/>
            <path d="M3 10H21" stroke="currentColor" strokeWidth="2"/>
            <path d="M3 14H21" stroke="currentColor" strokeWidth="2"/>
          </svg>
          <span>Room Darkening</span>
        </button>

        <button
          className={`border rounded py-2 px-4 text-center flex flex-col items-center ${
            selectedOpacity === 'blackout'
              ? 'bg-primary-red text-white border-primary-red'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
          onClick={() => onChange('blackout')}
        >
          <svg className="w-6 h-6 mb-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
            <path d="M8 5V19" stroke="currentColor" strokeWidth="2"/>
            <path d="M16 5V19" stroke="currentColor" strokeWidth="2"/>
            <path d="M3 12H21" stroke="currentColor" strokeWidth="2"/>
          </svg>
          <span>Blackout</span>
        </button>
      </div>
      {selectedOpacity === 'light_filtering' && (
        <p className="mt-2 text-sm text-gray-500">Allows soft, diffused light to enter the room while providing privacy.</p>
      )}
      {selectedOpacity === 'room_darkening' && (
        <p className="mt-2 text-sm text-gray-500">Blocks most light but not all. Perfect for bedrooms and TV rooms.</p>
      )}
      {selectedOpacity === 'blackout' && (
        <p className="mt-2 text-sm text-gray-500">Blocks virtually all light. Ideal for complete darkness in bedrooms, nurseries, and home theaters.</p>
      )}
    </div>
  );
};

export default OpacitySelector;
