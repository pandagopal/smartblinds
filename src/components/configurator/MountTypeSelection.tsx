import React from 'react';

interface MountTypeSelectionProps {
  selectedMount: string;
  onMountSelect: (mount: string) => void;
}

const MountTypeSelection: React.FC<MountTypeSelectionProps> = ({ selectedMount, onMountSelect }) => {
  const mountOptions = [
    {
      id: 'inside',
      name: 'Inside Mount',
      description: 'Blind sits inside the window frame for a clean, recessed look.',
      image: 'https://ext.same-assets.com/2035588304/1868376395.jpeg',
      benefits: [
        'Creates a clean, built-in look',
        'Highlights attractive window trim',
        'Takes up less space than outside mounts'
      ]
    },
    {
      id: 'outside',
      name: 'Outside Mount',
      description: 'Blind mounts on the wall above the window, covering the entire window frame.',
      image: 'https://ext.same-assets.com/2035588304/2746291953.jpeg',
      benefits: [
        'Makes windows appear larger',
        'Hides imperfect window frames',
        'Provides better light blockage',
        'Accommodates windows with shallow depth'
      ]
    }
  ];

  return (
    <div className="mb-8">
      <h3 className="text-xl font-medium mb-4">Choose Inside or Outside Mount</h3>
      <p className="text-gray-600 mb-6">Select how your window covering will be installed</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mountOptions.map((mount) => (
          <div
            key={mount.id}
            className={`border rounded-lg overflow-hidden cursor-pointer transition-all ${
              selectedMount === mount.id
                ? 'border-primary-red ring-2 ring-red-100'
                : 'border-gray-200 hover:border-gray-400'
            }`}
            onClick={() => onMountSelect(mount.id)}
            role="button"
            aria-pressed={selectedMount === mount.id}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onMountSelect(mount.id);
              }
            }}
          >
            <div className="aspect-video overflow-hidden">
              <img
                src={mount.image}
                alt={mount.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <h4 className="font-medium text-lg mb-2">{mount.name}</h4>
              <p className="text-gray-600 text-sm mb-3">{mount.description}</p>

              <h5 className="font-medium text-sm mb-1">Benefits:</h5>
              <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
                {mount.benefits.map((benefit, index) => (
                  <li key={index}>{benefit}</li>
                ))}
              </ul>
            </div>
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
          <div>
            <p className="text-sm text-blue-800 mb-2">
              <strong>Not sure which to choose?</strong> Measuring for an inside mount is different than an outside mount.
            </p>
            <a href="/measure-install" className="text-sm text-primary-red font-medium underline">
              View our measuring guide for help
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MountTypeSelection;
