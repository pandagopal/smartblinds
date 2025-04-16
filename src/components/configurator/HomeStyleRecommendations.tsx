import React, { useState, useEffect } from 'react';
import { Product } from '../../models/Product';
import { SAMPLE_PRODUCTS } from '../../models/Product';
import {
  HomeElement,
  Recommendation,
  getSavedHomeElements,
  saveHomeElement,
  removeHomeElement,
  getUserRecommendations
} from '../../services/homeStyleRecommendationService';

interface HomeStyleRecommendationsProps {
  product?: Product;
  onApplyRecommendation?: (productId: string, color?: string, opacity?: string) => void;
}

const HomeStyleRecommendations: React.FC<HomeStyleRecommendationsProps> = ({
  product,
  onApplyRecommendation
}) => {
  const [homeElements, setHomeElements] = useState<HomeElement[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [showAddElementForm, setShowAddElementForm] = useState(false);
  const [elementType, setElementType] = useState<'wall' | 'couch' | 'flooring'>('wall');
  const [elementColor, setElementColor] = useState('');
  const [elementStyle, setElementStyle] = useState('');
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [expandedRecommendation, setExpandedRecommendation] = useState<string | null>(null);

  // Common colors for selection
  const commonColors = [
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Cream', hex: '#FFFDD0' },
    { name: 'Beige', hex: '#F5F5DC' },
    { name: 'Light Gray', hex: '#D3D3D3' },
    { name: 'Gray', hex: '#808080' },
    { name: 'Charcoal', hex: '#36454F' },
    { name: 'Black', hex: '#000000' },
    { name: 'Navy Blue', hex: '#000080' },
    { name: 'Blue', hex: '#0000FF' },
    { name: 'Light Blue', hex: '#ADD8E6' },
    { name: 'Teal', hex: '#008080' },
    { name: 'Green', hex: '#008000' },
    { name: 'Sage', hex: '#BCB88A' },
    { name: 'Yellow', hex: '#FFFF00' },
    { name: 'Gold', hex: '#FFD700' },
    { name: 'Orange', hex: '#FFA500' },
    { name: 'Red', hex: '#FF0000' },
    { name: 'Burgundy', hex: '#800020' },
    { name: 'Pink', hex: '#FFC0CB' },
    { name: 'Purple', hex: '#800080' },
    { name: 'Brown', hex: '#A52A2A' },
    { name: 'Tan', hex: '#D2B48C' },
    { name: 'Wood', hex: '#DEB887' }
  ];

  // Common style options
  const styleOptions = [
    'Modern',
    'Contemporary',
    'Minimalist',
    'Traditional',
    'Classic',
    'Rustic',
    'Farmhouse',
    'Industrial',
    'Scandinavian',
    'Coastal',
    'Bohemian',
    'Mid-century Modern',
    'Transitional',
    'Art Deco',
    'Eclectic'
  ];

  // Load saved home elements and recommendations on mount
  useEffect(() => {
    const elements = getSavedHomeElements();
    setHomeElements(elements);

    if (elements.length > 0) {
      const { recommendations } = getUserRecommendations(SAMPLE_PRODUCTS);
      setRecommendations(recommendations);
    }
  }, []);

  // Handle element addition
  const handleAddElement = () => {
    if (!elementColor) {
      alert('Please select a color for your home element');
      return;
    }

    const newElement: HomeElement = {
      type: elementType,
      color: elementColor,
      style: elementStyle || undefined
    };

    const updatedElements = saveHomeElement(newElement);
    setHomeElements(updatedElements);

    // Reset form
    setElementColor('');
    setElementStyle('');
    setShowAddElementForm(false);

    // Generate recommendations
    const { recommendations } = getUserRecommendations(SAMPLE_PRODUCTS);
    setRecommendations(recommendations);

    // Show recommendations if we have elements
    if (updatedElements.length > 0) {
      setShowRecommendations(true);
    }
  };

  // Handle element removal
  const handleRemoveElement = (type: 'wall' | 'couch' | 'flooring') => {
    const updatedElements = removeHomeElement(type);
    setHomeElements(updatedElements);

    // Update recommendations
    if (updatedElements.length > 0) {
      const { recommendations } = getUserRecommendations(SAMPLE_PRODUCTS);
      setRecommendations(recommendations);
    } else {
      setRecommendations([]);
      setShowRecommendations(false);
    }
  };

  // Handle applying a recommendation
  const handleApplyRecommendation = (recommendation: Recommendation) => {
    if (onApplyRecommendation) {
      onApplyRecommendation(
        recommendation.productId,
        recommendation.color,
        recommendation.opacity
      );
    }
  };

  // Get product details by ID
  const getProductById = (productId: string): Product | undefined => {
    return SAMPLE_PRODUCTS.find(p => p.id === productId);
  };

  return (
    <div className="home-style-recommendations bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="bg-blue-50 p-4 border-b border-blue-100">
        <h3 className="text-lg font-semibold text-blue-800">Match Blinds to Your Home</h3>
        <p className="text-sm text-blue-600">
          Get personalized blind recommendations based on your home's colors and style
        </p>
      </div>

      <div className="p-4">
        {/* Home elements list */}
        {homeElements.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Your Home Elements</h4>
            <div className="space-y-2">
              {homeElements.map((element) => (
                <div
                  key={element.type}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200"
                >
                  <div className="flex items-center">
                    <div
                      className="w-6 h-6 rounded-full mr-2"
                      style={{ backgroundColor: element.color || '#cccccc' }}
                    ></div>
                    <div>
                      <span className="text-sm font-medium capitalize">{element.type}</span>
                      {element.style && (
                        <span className="text-xs text-gray-500 ml-1">({element.style})</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveElement(element.type)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add new element form */}
        {!showAddElementForm ? (
          <button
            onClick={() => setShowAddElementForm(true)}
            className="w-full py-2 px-3 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 mb-4"
          >
            {homeElements.length === 0 ? 'Add Your First Home Element' : 'Add Another Element'}
          </button>
        ) : (
          <div className="bg-gray-50 p-3 rounded-md mb-4 border border-gray-200">
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">Element Type</label>
              <select
                value={elementType}
                onChange={(e) => setElementType(e.target.value as 'wall' | 'couch' | 'flooring')}
                className="w-full p-2 text-sm border border-gray-300 rounded-md"
              >
                <option value="wall">Wall</option>
                <option value="couch">Couch/Furniture</option>
                <option value="flooring">Flooring</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">Color</label>
              <div className="grid grid-cols-6 gap-1 mb-1">
                {commonColors.slice(0, 12).map((color) => (
                  <div
                    key={color.name}
                    className={`w-full aspect-square rounded cursor-pointer border ${
                      elementColor === color.name ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    onClick={() => setElementColor(color.name)}
                    title={color.name}
                  ></div>
                ))}
              </div>
              <select
                value={elementColor}
                onChange={(e) => setElementColor(e.target.value)}
                className="w-full p-2 text-sm border border-gray-300 rounded-md"
              >
                <option value="">Choose a color...</option>
                {commonColors.map((color) => (
                  <option key={color.name} value={color.name}>{color.name}</option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">Style (Optional)</label>
              <select
                value={elementStyle}
                onChange={(e) => setElementStyle(e.target.value)}
                className="w-full p-2 text-sm border border-gray-300 rounded-md"
              >
                <option value="">Choose a style...</option>
                {styleOptions.map((style) => (
                  <option key={style} value={style}>{style}</option>
                ))}
              </select>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={handleAddElement}
                className="flex-1 py-2 px-3 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Add Element
              </button>
              <button
                onClick={() => setShowAddElementForm(false)}
                className="py-2 px-3 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Toggle recommendations */}
        {homeElements.length > 0 && (
          <button
            onClick={() => setShowRecommendations(!showRecommendations)}
            className="w-full py-2 px-3 bg-indigo-100 text-indigo-700 rounded-md text-sm font-medium hover:bg-indigo-200 mb-4 flex justify-center items-center"
          >
            <span>{showRecommendations ? 'Hide Recommendations' : 'Show Recommendations'}</span>
            <svg
              className={`w-4 h-4 ml-1 transform transition-transform ${showRecommendations ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}

        {/* Recommendations list */}
        {showRecommendations && recommendations.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Recommended for Your Home</h4>

            {recommendations.map((recommendation) => {
              const product = getProductById(recommendation.productId);
              if (!product) return null;

              return (
                <div
                  key={recommendation.productId}
                  className="border border-gray-200 rounded-md overflow-hidden"
                >
                  <div className="flex items-center p-2 cursor-pointer" onClick={() => setExpandedRecommendation(
                    expandedRecommendation === recommendation.productId ? null : recommendation.productId
                  )}>
                    <div className="w-16 h-16 bg-gray-100 mr-3 flex-shrink-0 overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-sm font-medium truncate">{product.title}</h5>
                      <p className="text-xs text-gray-600 truncate">{recommendation.reason}</p>

                      {/* Match score visualization */}
                      <div className="flex items-center mt-1">
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500"
                            style={{ width: `${recommendation.score * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500 ml-2">
                          {Math.round(recommendation.score * 100)}% match
                        </span>
                      </div>
                    </div>
                    <svg
                      className={`w-5 h-5 text-gray-400 ml-2 transform transition-transform ${
                        expandedRecommendation === recommendation.productId ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>

                  {/* Expanded details */}
                  {expandedRecommendation === recommendation.productId && (
                    <div className="p-3 bg-gray-50 border-t border-gray-200">
                      <p className="text-xs text-gray-600 mb-2">{product.description}</p>

                      {recommendation.color && (
                        <div className="flex items-center mb-2">
                          <span className="text-xs font-medium mr-2">Recommended Color:</span>
                          <div className="flex items-center">
                            <div
                              className="w-4 h-4 rounded-full mr-1"
                              style={{ backgroundColor: commonColors.find(c => c.name === recommendation.color)?.hex || '#ccc' }}
                            ></div>
                            <span className="text-xs">{recommendation.color}</span>
                          </div>
                        </div>
                      )}

                      {recommendation.opacity && (
                        <div className="flex items-center mb-2">
                          <span className="text-xs font-medium mr-2">Opacity:</span>
                          <span className="text-xs">{recommendation.opacity}</span>
                        </div>
                      )}

                      {onApplyRecommendation && (
                        <button
                          onClick={() => handleApplyRecommendation(recommendation)}
                          className="w-full mt-2 py-1.5 px-3 bg-green-600 text-white rounded-md text-xs font-medium hover:bg-green-700"
                        >
                          Apply this Recommendation
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* No recommendations message */}
        {showRecommendations && recommendations.length === 0 && homeElements.length > 0 && (
          <div className="text-center py-4 bg-gray-50 rounded-md">
            <p className="text-gray-600 text-sm">No matching recommendations found.</p>
            <p className="text-gray-500 text-xs mt-1">Try adding different home elements or styles.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeStyleRecommendations;
