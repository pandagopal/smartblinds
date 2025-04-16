import React, { useState, useEffect } from 'react';
import { Quote, QuoteItem } from '../../../models/Customer';
import { SAMPLE_PRODUCTS } from '../../../models/Product';

interface ProductSelectionProps {
  quote: Quote;
  onProductsUpdate: (items: QuoteItem[]) => void;
}

const ProductSelection: React.FC<ProductSelectionProps> = ({ quote, onProductsUpdate }) => {
  const [items, setItems] = useState<QuoteItem[]>(quote.items || []);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [mountType, setMountType] = useState<'inside' | 'outside'>('inside');
  const [colorName, setColorName] = useState<string>('');
  const [roomName, setRoomName] = useState<string>('');
  const [controlType, setControlType] = useState<string>('');
  const [controlPosition, setControlPosition] = useState<'left' | 'right' | 'center'>('left');
  const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: boolean }>({});
  const [productNote, setProductNote] = useState<string>('');

  // Reset form when product selection changes
  useEffect(() => {
    if (selectedProductId) {
      const product = SAMPLE_PRODUCTS.find(p => p.id === selectedProductId);
      if (product) {
        setSelectedProduct(product);
        // Initialize with default values
        setColorName(product.colors && product.colors.length > 0 ? product.colors[0].name : '');
        setControlType(product.controlTypes && product.controlTypes.length > 0 ? product.controlTypes[0] : '');

        // Reset other fields
        setQuantity(1);
        setWidth(0);
        setHeight(0);
        setRoomName('');
        setProductNote('');
        setSelectedOptions({});
      }
    } else {
      setSelectedProduct(null);
    }
  }, [selectedProductId]);

  // Calculate the price of the current configuration
  const calculatePrice = (): number => {
    if (!selectedProduct) return 0;

    let basePrice = selectedProduct.basePrice || 0;

    // Calculate price based on dimensions
    if (width && height) {
      const sqFt = (width * height) / 144; // Convert to square feet
      basePrice = sqFt * selectedProduct.pricePerSqFt;
    }

    // Add option prices
    let optionsTotal = 0;
    for (const [optionId, isSelected] of Object.entries(selectedOptions)) {
      if (isSelected && selectedProduct.options) {
        const option = selectedProduct.options.find((o: any) => o.id === optionId);
        if (option) {
          optionsTotal += option.price;
        }
      }
    }

    // Multiply by quantity
    return (basePrice + optionsTotal) * quantity;
  };

  const handleAddProduct = () => {
    if (!selectedProduct || !width || !height) {
      alert('Please select a product and enter dimensions');
      return;
    }

    // Calculate price
    const totalPrice = calculatePrice();

    // Create new product options array
    const options = Object.entries(selectedOptions)
      .filter(([_, isSelected]) => isSelected)
      .map(([optionId]) => {
        const option = selectedProduct.options.find((o: any) => o.id === optionId);
        return {
          name: option.name,
          value: 'Yes',
          price: option.price
        };
      });

    // Create new quote item
    const newItem: QuoteItem = {
      id: `item_${Date.now()}`,
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      productType: selectedProduct.type,
      quantity,
      width,
      height,
      mountType,
      color: colorName,
      controlType,
      controlPosition,
      roomName,
      unitPrice: totalPrice / quantity,
      totalPrice,
      options,
      notes: productNote
    };

    // Add to items and reset form
    const updatedItems = [...items, newItem];
    setItems(updatedItems);
    onProductsUpdate(updatedItems);

    // Reset product selection
    setSelectedProductId('');
  };

  const handleRemoveItem = (itemId: string) => {
    const updatedItems = items.filter(item => item.id !== itemId);
    setItems(updatedItems);
    onProductsUpdate(updatedItems);
  };

  const handleOptionChange = (optionId: string, isChecked: boolean) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionId]: isChecked
    }));
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Product Selection Form */}
        <div className="md:col-span-2 border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Add Products</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-primary-red focus:border-primary-red"
              >
                <option value="">Select a product</option>
                {SAMPLE_PRODUCTS.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Room
              </label>
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="e.g. Living Room"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-primary-red focus:border-primary-red"
              />
            </div>
          </div>

          {selectedProduct && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Width (inches)
                  </label>
                  <input
                    type="number"
                    value={width || ''}
                    onChange={(e) => setWidth(parseInt(e.target.value) || 0)}
                    min="1"
                    step="0.125"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-primary-red focus:border-primary-red"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Height (inches)
                  </label>
                  <input
                    type="number"
                    value={height || ''}
                    onChange={(e) => setHeight(parseInt(e.target.value) || 0)}
                    min="1"
                    step="0.125"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-primary-red focus:border-primary-red"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-primary-red focus:border-primary-red"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mount Type
                  </label>
                  <div className="flex space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        checked={mountType === 'inside'}
                        onChange={() => setMountType('inside')}
                        className="text-primary-red focus:ring-primary-red h-4 w-4"
                      />
                      <span className="ml-2 text-sm text-gray-700">Inside Mount</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        checked={mountType === 'outside'}
                        onChange={() => setMountType('outside')}
                        className="text-primary-red focus:ring-primary-red h-4 w-4"
                      />
                      <span className="ml-2 text-sm text-gray-700">Outside Mount</span>
                    </label>
                  </div>
                </div>

                {selectedProduct.colors && selectedProduct.colors.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Color
                    </label>
                    <select
                      value={colorName}
                      onChange={(e) => setColorName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-primary-red focus:border-primary-red"
                    >
                      {selectedProduct.colors.map((color: any) => (
                        <option key={color.id} value={color.name}>
                          {color.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {selectedProduct.controlTypes && selectedProduct.controlTypes.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Control Type
                    </label>
                    <select
                      value={controlType}
                      onChange={(e) => setControlType(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-primary-red focus:border-primary-red"
                    >
                      {selectedProduct.controlTypes.map((type: string) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {selectedProduct.options && selectedProduct.options.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Options
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedProduct.options.map((option: any) => (
                      <div key={option.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`option-${option.id}`}
                          checked={!!selectedOptions[option.id]}
                          onChange={(e) => handleOptionChange(option.id, e.target.checked)}
                          className="text-primary-red focus:ring-primary-red h-4 w-4"
                        />
                        <label htmlFor={`option-${option.id}`} className="ml-2 text-sm text-gray-700">
                          {option.name} (+${option.price.toFixed(2)})
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={productNote}
                  onChange={(e) => setProductNote(e.target.value)}
                  placeholder="Add any special instructions for this product"
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-primary-red focus:border-primary-red"
                  rows={2}
                />
              </div>
            </>
          )}

          <div className="mt-6 flex justify-between items-center">
            <div className="text-lg font-medium">
              {selectedProduct ? `Price: $${calculatePrice().toFixed(2)}` : ''}
            </div>
            <button
              onClick={handleAddProduct}
              disabled={!selectedProduct || !width || !height}
              className="px-4 py-2 bg-primary-red text-white rounded hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Add to Quote
            </button>
          </div>
        </div>

        {/* Selected Products Summary */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Selected Products</h3>

          {items.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No products selected yet. Add products from the form.
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="border border-gray-200 p-3 rounded">
                  <div className="flex justify-between">
                    <h4 className="font-medium">{item.productName}</h4>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  <p className="text-sm text-gray-600">
                    {item.width}" × {item.height}" - {item.mountType} mount
                  </p>
                  <p className="text-sm text-gray-600">
                    {item.roomName && `${item.roomName} - `}
                    {item.color && `${item.color} - `}
                    {item.quantity > 1 ? `${item.quantity} units` : '1 unit'}
                  </p>
                  {item.options.length > 0 && (
                    <div className="mt-1">
                      <p className="text-xs text-gray-500">Options:</p>
                      <ul className="text-xs text-gray-500 pl-4">
                        {item.options.map((option, idx) => (
                          <li key={idx}>• {option.name}: +${option.price.toFixed(2)}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="mt-1 text-right font-medium">
                    ${item.totalPrice.toFixed(2)}
                  </div>
                </div>
              ))}

              <div className="border-t border-gray-200 pt-3 mt-4">
                <div className="flex justify-between text-lg font-medium">
                  <span>Total:</span>
                  <span>${items.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductSelection;
