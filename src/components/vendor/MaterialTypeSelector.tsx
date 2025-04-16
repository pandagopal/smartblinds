import React from 'react';

interface MaterialType {
  id: string;
  name: string;
  description?: string;
}

interface MaterialTypeSelectorProps {
  selectedMaterial: string;
  onChange: (materialId: string) => void;
  className?: string;
}

const materialTypes: MaterialType[] = [
  {
    id: 'fabric',
    name: 'Fabric',
    description: 'Soft and versatile material available in various textures and opacities'
  },
  {
    id: 'wood',
    name: 'Wood',
    description: 'Natural wood slats providing a warm, classic appearance'
  },
  {
    id: 'faux-wood',
    name: 'Faux Wood',
    description: 'Composite material that mimics the look of real wood but is more moisture-resistant'
  },
  {
    id: 'aluminum',
    name: 'Aluminum',
    description: 'Lightweight, durable metal slats for a sleek, modern look'
  },
  {
    id: 'vinyl',
    name: 'Vinyl',
    description: 'Affordable, durable plastic material resistant to moisture and fading'
  },
  {
    id: 'bamboo',
    name: 'Bamboo',
    description: 'Sustainable natural material for an organic, textured appearance'
  },
  {
    id: 'composite',
    name: 'Composite',
    description: 'Mixed materials offering a balance of appearance and performance'
  },
  {
    id: 'pvc',
    name: 'PVC',
    description: 'Durable synthetic material ideal for high-humidity areas'
  },
  {
    id: 'solar',
    name: 'Solar',
    description: 'Specialized screen material that filters light while maintaining visibility'
  }
];

const MaterialTypeSelector: React.FC<MaterialTypeSelectorProps> = ({
  selectedMaterial,
  onChange,
  className = ''
}) => {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Material Type
      </label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {materialTypes.map((material) => (
          <div
            key={material.id}
            className={`border rounded-lg p-3 cursor-pointer transition ${
              selectedMaterial === material.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onChange(material.id)}
          >
            <div className="flex items-center">
              <div className={`w-4 h-4 rounded-full mr-2 ${
                selectedMaterial === material.id ? 'bg-blue-500' : 'bg-gray-200'
              }`} />
              <h3 className="font-medium text-gray-900">{material.name}</h3>
            </div>
            {material.description && (
              <p className="mt-1 text-xs text-gray-500">{material.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MaterialTypeSelector;
