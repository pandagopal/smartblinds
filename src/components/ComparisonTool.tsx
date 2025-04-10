import { useState } from 'react';

interface ComparisonProduct {
  id: string;
  name: string;
  image: string;
  rating: number;
  price: number;
  type: string;
  features: string[];
  pros: string[];
  cons: string[];
  bestFor: string[];
  specifications: Record<string, string | number>;
}

interface ComparisonToolProps {
  defaultProducts?: ComparisonProduct[];
  maxComparisons?: number;
  onSelectProduct?: (product: ComparisonProduct) => void;
}

const ComparisonTool: React.FC<ComparisonToolProps> = ({
  defaultProducts,
  maxComparisons = 3,
  onSelectProduct
}) => {
  // All available products for comparison
  const availableProducts: ComparisonProduct[] = [
    {
      id: 'fw-standard',
      name: 'Standard Faux Wood Blinds',
      image: 'https://ext.same-assets.com/2035588304/3759481620.jpeg',
      rating: 4.5,
      price: 79.99,
      type: 'faux wood',
      features: [
        '2" PVC composite slats',
        'Standard cord control',
        'Moisture resistant',
        'Easy to clean',
        'Child-safe wand tilt',
        '15+ color options'
      ],
      pros: [
        'Affordable',
        'Durable in humid environments',
        'Low maintenance',
        'Classic look'
      ],
      cons: [
        'Heavier than real wood',
        'Standard cords not ideal for homes with children',
        'Limited premium finishes'
      ],
      bestFor: [
        'Bathrooms',
        'Kitchens',
        'Budget-conscious shoppers',
        'Rental properties'
      ],
      specifications: {
        'Material': 'PVC Composite',
        'Slat Size': '2 inch',
        'Light Blockage': '90-95%',
        'Insulation Rating': 'Medium',
        'Durability': 'High',
        'Warranty': '3 Year Limited'
      }
    },
    {
      id: 'fw-premium',
      name: 'Premium Faux Wood Blinds',
      image: 'https://ext.same-assets.com/2035588304/2578146390.jpeg',
      rating: 4.8,
      price: 124.99,
      type: 'faux wood',
      features: [
        '2.5" PVC composite slats',
        'Cordless lift mechanism',
        'Enhanced moisture resistance',
        'Premium valance included',
        'No-hole privacy design',
        '20+ designer colors'
      ],
      pros: [
        'Child and pet safe cordless design',
        'Superior light control',
        'Enhanced durability',
        'More realistic wood appearance'
      ],
      cons: [
        'Higher price point',
        'Heavier than real wood',
        'May require professional installation'
      ],
      bestFor: [
        'Homes with children or pets',
        'High humidity environments',
        'Living rooms & bedrooms',
        'Design-conscious homeowners'
      ],
      specifications: {
        'Material': 'Enhanced PVC Composite',
        'Slat Size': '2.5 inch',
        'Light Blockage': '95-98%',
        'Insulation Rating': 'High',
        'Durability': 'Very High',
        'Warranty': 'Lifetime Limited'
      }
    },
    {
      id: 'rw-premium',
      name: 'Premium Real Wood Blinds',
      image: 'https://ext.same-assets.com/2035588304/1572943680.jpeg',
      rating: 4.7,
      price: 149.99,
      type: 'real wood',
      features: [
        '2" basswood slats',
        'Cordless or motorized options',
        'Premium wood grain finishes',
        'Cloth tape option available',
        'Custom stain matching',
        'Decorative valance options'
      ],
      pros: [
        'Lightweight',
        'Authentic wood appearance',
        'Superior aesthetics',
        'Available in custom stains'
      ],
      cons: [
        'Not ideal for humid environments',
        'Higher maintenance required',
        'Premium price point',
        'More susceptible to warping'
      ],
      bestFor: [
        'Living rooms',
        'Dining rooms',
        'Home offices',
        'Upscale homes',
        'Matching wood furniture'
      ],
      specifications: {
        'Material': 'Basswood',
        'Slat Size': '2 inch',
        'Light Blockage': '90-95%',
        'Insulation Rating': 'Medium',
        'Durability': 'Medium-High (in dry environments)',
        'Warranty': '5 Year Limited'
      }
    },
    {
      id: 'smart-motorized',
      name: 'Smart Motorized Blinds',
      image: 'https://ext.same-assets.com/2035588304/4738592160.jpeg',
      rating: 4.9,
      price: 249.99,
      type: 'motorized',
      features: [
        'Smartphone app control',
        'Voice assistant compatibility',
        'Programmable schedules',
        'Battery or hardwired operation',
        'Remote control included',
        'Integrates with smart home systems'
      ],
      pros: [
        'Ultimate convenience',
        'Perfect for hard-to-reach windows',
        'Excellent for energy management',
        'Child and pet safe',
        'Premium appearance'
      ],
      cons: [
        'Highest price point',
        'Requires battery replacement or power connection',
        'More complex installation',
        'Technology learning curve'
      ],
      bestFor: [
        'Smart homes',
        'Large windows',
        'High windows',
        'Tech enthusiasts',
        'Luxury homes'
      ],
      specifications: {
        'Material': 'PVC Composite or Basswood',
        'Slat Size': '2 or 2.5 inch',
        'Light Blockage': '95-99%',
        'Insulation Rating': 'High',
        'Durability': 'Very High',
        'Warranty': '5 Year (Motor), Lifetime (Blinds)'
      }
    },
    {
      id: 'cellular-blackout',
      name: 'Cellular Blackout Shades',
      image: 'https://ext.same-assets.com/2035588304/3517294680.jpeg',
      rating: 4.8,
      price: 129.99,
      type: 'cellular',
      features: [
        'Honeycomb design',
        'Blackout fabric option',
        'Superior insulation',
        'Energy efficient',
        'Cordless lift available',
        'Top-down/bottom-up option'
      ],
      pros: [
        'Best energy efficiency',
        'Excellent for light blocking',
        'Soft, fabric appearance',
        'Quieter operation',
        'Space-saving design'
      ],
      cons: [
        'Different aesthetic than traditional blinds',
        'More difficult to clean thoroughly',
        'Less precise light control than slat blinds',
        'Fabric can show wear over time'
      ],
      bestFor: [
        'Bedrooms',
        'Media rooms',
        'Energy-conscious homeowners',
        'Modern design aesthetics',
        'Light sleepers'
      ],
      specifications: {
        'Material': 'Polyester Fabric',
        'Cell Size': '3/4 inch (double cell)',
        'Light Blockage': '99-100%',
        'Insulation Rating': 'Very High',
        'Durability': 'Medium-High',
        'Warranty': '7 Year Limited'
      }
    }
  ];

  // State for selected products to compare
  const [selectedProducts, setSelectedProducts] = useState<ComparisonProduct[]>(
    defaultProducts || [availableProducts[0], availableProducts[1]]
  );

  // State for the product dropdown
  const [showProductSelector, setShowProductSelector] = useState<boolean>(false);
  const [selectedColumn, setSelectedColumn] = useState<number | null>(null);

  // Handle adding a new product to comparison
  const handleAddProduct = () => {
    if (selectedProducts.length < maxComparisons) {
      setSelectedProducts([...selectedProducts, availableProducts[0]]);
    }
  };

  // Handle removing a product from comparison
  const handleRemoveProduct = (index: number) => {
    const newSelectedProducts = [...selectedProducts];
    newSelectedProducts.splice(index, 1);
    setSelectedProducts(newSelectedProducts);
  };

  // Handle selecting a product for a specific column
  const handleSelectProduct = (product: ComparisonProduct) => {
    if (selectedColumn !== null) {
      const newSelectedProducts = [...selectedProducts];
      newSelectedProducts[selectedColumn] = product;
      setSelectedProducts(newSelectedProducts);
      setShowProductSelector(false);
      setSelectedColumn(null);

      if (onSelectProduct) {
        onSelectProduct(product);
      }
    }
  };

  // Get available products that aren't already selected
  const getAvailableOptionsForSelection = () => {
    const selectedIds = selectedProducts.map(p => p.id);
    return availableProducts.filter(p => !selectedIds.includes(p.id));
  };

  // Render stars for ratings
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(rating)) {
        stars.push(<span key={i} className="text-yellow-500">★</span>);
      } else if (i - rating > 0 && i - rating < 1) {
        stars.push(<span key={i} className="text-yellow-500">★</span>);
      } else {
        stars.push(<span key={i} className="text-gray-300">★</span>);
      }
    }
    return stars;
  };

  // Get all unique specification keys across all products
  const getAllSpecificationKeys = () => {
    const keysSet = new Set<string>();
    selectedProducts.forEach(product => {
      Object.keys(product.specifications).forEach(key => keysSet.add(key));
    });
    return Array.from(keysSet);
  };

  return (
    <div className="comparison-tool bg-white rounded shadow-md p-4 mb-8">
      <h2 className="text-lg font-medium mb-4">Compare Blind Options</h2>
      <p className="text-gray-600 mb-6">
        Compare different types of blinds side-by-side to find the perfect option for your needs.
      </p>

      {/* Comparison Table */}
      <div className="comparison-table overflow-x-auto">
        <table className="w-full min-w-max border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="py-3 px-4 border-b border-gray-200 text-left text-sm font-medium text-gray-700 w-1/4">
                Features
              </th>
              {selectedProducts.map((selectedProduct, index) => (
                <th key={index} className="py-3 px-4 border-b border-gray-200 text-center">
                  <div className="flex flex-col items-center mb-2 relative">
                    <div
                      className="absolute -top-2 -right-2 cursor-pointer bg-gray-200 hover:bg-gray-300 rounded-full p-1"
                      onClick={() => handleRemoveProduct(index)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div
                      className="h-24 w-24 mb-2 rounded-lg border border-gray-200 overflow-hidden cursor-pointer"
                      onClick={() => {
                        setSelectedColumn(index);
                        setShowProductSelector(true);
                      }}
                    >
                      <img
                        src={selectedProduct.image}
                        alt={selectedProduct.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="text-sm font-medium">{selectedProduct.name}</h3>
                    <div className="flex mt-1">
                      {renderStars(selectedProduct.rating)}
                    </div>
                    <div className="text-primary-red font-medium mt-1">
                      ${selectedProduct.price.toFixed(2)}
                    </div>
                    <button
                      className="mt-2 text-xs bg-gray-100 hover:bg-gray-200 py-1 px-2 rounded-full transition-colors"
                      onClick={() => {
                        setSelectedColumn(index);
                        setShowProductSelector(true);
                      }}
                    >
                      Change
                    </button>
                  </div>
                </th>
              ))}
              {selectedProducts.length < maxComparisons && (
                <th className="py-3 px-4 border-b border-gray-200 w-48">
                  <button
                    className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors"
                    onClick={handleAddProduct}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {/* Type */}
            <tr>
              <td className="py-3 px-4 border-b border-gray-200 text-sm font-medium">
                Type
              </td>
              {selectedProducts.map((selectedProduct, index) => (
                <td key={index} className="py-3 px-4 border-b border-gray-200 text-center text-sm capitalize">
                  {selectedProduct.type}
                </td>
              ))}
              {selectedProducts.length < maxComparisons && (
                <td className="py-3 px-4 border-b border-gray-200"></td>
              )}
            </tr>

            {/* Features */}
            <tr>
              <td className="py-3 px-4 border-b border-gray-200 text-sm font-medium">
                Features
              </td>
              {selectedProducts.map((selectedProduct, index) => (
                <td key={index} className="py-3 px-4 border-b border-gray-200 text-sm">
                  <ul className="list-disc pl-5 space-y-1">
                    {selectedProduct.features.map((feature, i) => (
                      <li key={i}>{feature}</li>
                    ))}
                  </ul>
                </td>
              ))}
              {selectedProducts.length < maxComparisons && (
                <td className="py-3 px-4 border-b border-gray-200"></td>
              )}
            </tr>

            {/* Pros */}
            <tr>
              <td className="py-3 px-4 border-b border-gray-200 text-sm font-medium">
                Pros
              </td>
              {selectedProducts.map((selectedProduct, index) => (
                <td key={index} className="py-3 px-4 border-b border-gray-200 text-sm">
                  <ul className="list-disc pl-5 space-y-1 text-green-700">
                    {selectedProduct.pros.map((pro, i) => (
                      <li key={i}>{pro}</li>
                    ))}
                  </ul>
                </td>
              ))}
              {selectedProducts.length < maxComparisons && (
                <td className="py-3 px-4 border-b border-gray-200"></td>
              )}
            </tr>

            {/* Cons */}
            <tr>
              <td className="py-3 px-4 border-b border-gray-200 text-sm font-medium">
                Cons
              </td>
              {selectedProducts.map((selectedProduct, index) => (
                <td key={index} className="py-3 px-4 border-b border-gray-200 text-sm">
                  <ul className="list-disc pl-5 space-y-1 text-red-700">
                    {selectedProduct.cons.map((con, i) => (
                      <li key={i}>{con}</li>
                    ))}
                  </ul>
                </td>
              ))}
              {selectedProducts.length < maxComparisons && (
                <td className="py-3 px-4 border-b border-gray-200"></td>
              )}
            </tr>

            {/* Best For */}
            <tr>
              <td className="py-3 px-4 border-b border-gray-200 text-sm font-medium">
                Best For
              </td>
              {selectedProducts.map((selectedProduct, index) => (
                <td key={index} className="py-3 px-4 border-b border-gray-200 text-sm">
                  <div className="flex flex-wrap gap-1">
                    {selectedProduct.bestFor.map((item, i) => (
                      <span key={i} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                        {item}
                      </span>
                    ))}
                  </div>
                </td>
              ))}
              {selectedProducts.length < maxComparisons && (
                <td className="py-3 px-4 border-b border-gray-200"></td>
              )}
            </tr>

            {/* Specifications */}
            <tr className="bg-gray-50">
              <td colSpan={selectedProducts.length + (selectedProducts.length < maxComparisons ? 2 : 1)} className="py-3 px-4 border-b border-gray-200 text-sm font-medium">
                Specifications
              </td>
            </tr>

            {getAllSpecificationKeys().map((key, i) => (
              <tr key={i}>
                <td className="py-3 px-4 border-b border-gray-200 text-sm font-medium">
                  {key}
                </td>
                {selectedProducts.map((selectedProduct, index) => (
                  <td key={index} className="py-3 px-4 border-b border-gray-200 text-center text-sm">
                    {selectedProduct.specifications[key] || '—'}
                  </td>
                ))}
                {selectedProducts.length < maxComparisons && (
                  <td className="py-3 px-4 border-b border-gray-200"></td>
                )}
              </tr>
            ))}

            {/* Action Row */}
            <tr>
              <td className="py-3 px-4 text-sm font-medium">

              </td>
              {selectedProducts.map((_, index) => (
                <td key={index} className="py-3 px-4 text-center">
                  <button className="bg-primary-red text-white py-2 px-4 rounded text-sm hover:bg-secondary-red transition-colors">
                    Select This Option
                  </button>
                </td>
              ))}
              {selectedProducts.length < maxComparisons && (
                <td className="py-3 px-4"></td>
              )}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Product Selector Modal */}
      {showProductSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium">Select Product to Compare</h3>
              <button
                className="text-gray-500 hover:text-gray-800"
                onClick={() => {
                  setShowProductSelector(false);
                  setSelectedColumn(null);
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 overflow-y-auto" style={{ maxHeight: '60vh' }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {getAvailableOptionsForSelection().map((product) => (
                  <div
                    key={product.id}
                    className="border border-gray-200 rounded-lg p-3 hover:border-primary-red hover:bg-red-50 cursor-pointer transition-colors"
                    onClick={() => handleSelectProduct(product)}
                  >
                    <div className="flex items-center mb-2">
                      <div className="h-16 w-16 rounded overflow-hidden mr-3 border border-gray-200">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{product.name}</h4>
                        <div className="flex mt-1 text-xs">
                          {renderStars(product.rating)}
                          <span className="ml-1 text-gray-600">({product.rating})</span>
                        </div>
                        <div className="text-primary-red font-medium mt-1 text-sm">
                          ${product.price.toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 mt-2">
                      <span className="font-medium">Type:</span> {product.type}
                    </div>
                    <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                      <span className="font-medium">Best for:</span> {product.bestFor.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <button
                className="w-full bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300 transition-colors"
                onClick={() => {
                  setShowProductSelector(false);
                  setSelectedColumn(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComparisonTool;
