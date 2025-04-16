import React from 'react';

type MountType = 'inside' | 'outside';

interface MountTypeSelectorProps {
  selectedMount: MountType;
  onChange: (mountType: MountType) => void;
}

const MountTypeSelector: React.FC<MountTypeSelectorProps> = ({
  selectedMount,
  onChange
}) => {
  return (
    <div className="mb-6">
      <h3 className="text-md font-medium mb-3">Choose Inside or Outside Mount</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Inside Mount */}
        <div
          className={`border rounded p-4 cursor-pointer transition-colors ${
            selectedMount === 'inside'
              ? 'bg-primary-red text-white border-primary-red'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
          onClick={() => onChange('inside')}
        >
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium">Inside Mount</h4>
            <div className="w-5 h-5 rounded-full border border-current flex items-center justify-center">
              {selectedMount === 'inside' && <div className="w-3 h-3 rounded-full bg-white"></div>}
            </div>
          </div>

          <div className="relative h-32 border-8 border-gray-300 bg-blue-50 rounded mb-3">
            <div className={`absolute inset-x-0 top-0 bottom-0 left-4 right-4 border-t-8 border-l-4 border-r-4 ${selectedMount === 'inside' ? 'border-white' : 'border-gray-400'}`}>
              <div className="absolute top-8 left-0 right-0 h-px bg-current"></div>
              <div className="absolute top-16 left-0 right-0 h-px bg-current"></div>
              <div className="absolute top-24 left-0 right-0 h-px bg-current"></div>
            </div>
          </div>

          <p className={`text-sm ${selectedMount === 'inside' ? 'text-gray-100' : 'text-gray-600'}`}>
            Blinds are installed within your window frame. Requires adequate depth in the window frame.
          </p>
        </div>

        {/* Outside Mount */}
        <div
          className={`border rounded p-4 cursor-pointer transition-colors ${
            selectedMount === 'outside'
              ? 'bg-primary-red text-white border-primary-red'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
          onClick={() => onChange('outside')}
        >
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium">Outside Mount</h4>
            <div className="w-5 h-5 rounded-full border border-current flex items-center justify-center">
              {selectedMount === 'outside' && <div className="w-3 h-3 rounded-full bg-white"></div>}
            </div>
          </div>

          <div className="relative h-32 mb-3">
            <div className="absolute inset-x-8 inset-y-4 border-8 border-gray-300 bg-blue-50 rounded"></div>
            <div className={`absolute inset-x-0 top-0 bottom-0 border-t-8 border-l-4 border-r-4 ${selectedMount === 'outside' ? 'border-white' : 'border-gray-400'}`}>
              <div className="absolute top-8 left-0 right-0 h-px bg-current"></div>
              <div className="absolute top-16 left-0 right-0 h-px bg-current"></div>
              <div className="absolute top-24 left-0 right-0 h-px bg-current"></div>
            </div>
          </div>

          <p className={`text-sm ${selectedMount === 'outside' ? 'text-gray-100' : 'text-gray-600'}`}>
            Blinds are installed outside your window frame. Provides better light blocking and makes your windows appear larger.
          </p>
        </div>
      </div>

      <div className="mt-3 text-sm text-gray-500">
        <p className="flex items-start">
          <svg className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>
            For inside mounts, measure the exact window opening width and height. <br />
            For outside mounts, measure where you want the blinds to extend.
          </span>
        </p>
      </div>
    </div>
  );
};

export default MountTypeSelector;
