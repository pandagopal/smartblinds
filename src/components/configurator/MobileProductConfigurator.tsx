import React from 'react';

const MobileProductConfigurator = () => {
  // Check if any custom features are selected
  const hasCustomFeatures = (): boolean => {
    return (
      selectedOptions['Control Type'] === 'Motorized' ||
      selectedOptions['Light Blocker'] === 'Full Blackout Kit' ||
      selectedOptions['Valance Type'] === 'Deluxe'
    );
  };

  return (
    <div className="mobile-product-configurator pb-20" ref={containerRef} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
      {/* Swipe indicator */}
      <div className="px-4 py-2 bg-blue-50 text-xs text-blue-700 text-center">
        <div className="flex items-center justify-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
          </svg>
          Swipe left/right to navigate options
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="flex items-center justify-between p-4 border-b">
          <h1 className="text-lg font-semibold truncate">{product.title}</h1>
          <div className="text-right">
            <div className="text-primary-red font-medium">${calculatedPrice.toFixed(2)}</div>
            <div className="text-xs text-gray-500">per blind</div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-between px-4 py-2 bg-gray-50 text-xs">
          <div
            className={`rounded-full px-2 py-1 ${activeSection === 'preview' ? 'bg-blue-100 text-blue-800' : 'text-gray-500'}`}
            onClick={() => setActiveSection('preview')}
          >Preview</div>
          <div
            className={`rounded-full px-2 py-1 ${activeSection === 'dimensions' ? 'bg-blue-100 text-blue-800' : 'text-gray-500'}`}
            onClick={() => setActiveSection('dimensions')}
          >Size</div>
          <div
            className={`rounded-full px-2 py-1 ${activeSection === 'colors' ? 'bg-blue-100 text-blue-800' : 'text-gray-500'}`}
            onClick={() => setActiveSection('colors')}
          >Color</div>
          <div
            className={`rounded-full px-2 py-1 ${activeSection === 'options' ? 'bg-blue-100 text-blue-800' : 'text-gray-500'}`}
            onClick={() => setActiveSection('options')}
          >Options</div>
          <div
            className={`rounded-full px-2 py-1 ${activeSection === 'features' ? 'bg-blue-100 text-blue-800' : 'text-gray-500'}`}
            onClick={() => setActiveSection('features')}
          >Features</div>
          <div
            className={`rounded-full px-2 py-1 ${activeSection === 'summary' ? 'bg-blue-100 text-blue-800' : 'text-gray-500'}`}
            onClick={() => setActiveSection('summary')}
          >Summary</div>
        </div>
      </header>

      {/* Main Content - Shows different sections based on activeSection */}
      <div className="p-4">
        {/* Preview Section */}
        {activeSection === 'preview' && (
          <div className="preview-section">
            <DynamicProductPreview
              product={product}
              selectedOptions={selectedOptions}
              width={width + (widthFraction === "0" ? 0 : parseFloat(widthFraction))}
              height={height + (heightFraction === "0" ? 0 : parseFloat(heightFraction))}
            />

            <div className="mt-6 p-4 border rounded-lg bg-gray-50">
              <h3 className="font-medium mb-2">Product Details</h3>
              <div className="space-y-1 text-sm">
                <p className="text-gray-700">{product.description}</p>
                <p className="text-gray-700 mt-2"><span className="font-medium">Material:</span> {product.material}</p>
                <p className="text-gray-700"><span className="font-medium">Warranty:</span> {product.warranty || "Limited Lifetime"}</p>
              </div>
            </div>

            <div className="text-center mt-6">
              <button
                onClick={goToNextSection}
                className="w-full py-3 bg-primary-red text-white rounded-md font-medium"
              >
                Start Customizing
              </button>
            </div>
          </div>
        )}

        {/* Dimensions Section */}
        {activeSection === 'dimensions' && (
          <div className="dimensions-section">
            <h2 className="text-xl font-semibold mb-4">Set Your Dimensions</h2>

            <div className="mb-6">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-base font-medium">Mount Type</h3>
                <div className="text-xs text-blue-600">Measuring Tips</div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div
                  className={`border rounded-md p-3 cursor-pointer ${selectedOptions['Mount Type'] === 'Inside Mount' ? 'border-blue-600 bg-blue-50' : ''}`}
                  onClick={() => handleOptionChange('Mount Type', 'Inside Mount')}
                >
                  <h4 className="text-sm font-medium text-center mb-1">Inside Mount</h4>
                  <p className="text-xs text-gray-600 text-center">Fits within window frame</p>
                </div>

                <div
                  className={`border rounded-md p-3 cursor-pointer ${selectedOptions['Mount Type'] === 'Outside Mount' ? 'border-blue-600 bg-blue-50' : ''}`}
                  onClick={() => handleOptionChange('Mount Type', 'Outside Mount')}
                >
                  <h4 className="text-sm font-medium text-center mb-1">Outside Mount</h4>
                  <p className="text-xs text-gray-600 text-center">Mounts above window frame</p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-base font-medium mb-2">Window Measurements</h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Width</label>
                <div className="flex items-center space-x-2">
                  <div className="flex-1">
                    <input
                      type="number"
                      inputMode="decimal"
                      min="10"
                      max="96"
                      className="w-full rounded-md border border-gray-300 py-3 px-3 text-center text-lg"
                      value={width}
                      onChange={(e) => handleWidthChange(parseInt(e.target.value) || 36)}
                    />
                  </div>
                  <div className="w-24">
                    <select
                      className="w-full rounded-md border border-gray-300 py-3 px-2 text-center text-lg"
                      value={widthFraction}
                      onChange={(e) => handleWidthFractionChange(e.target.value)}
                    >
                      <option value="0">0"</option>
                      <option value="0.125">1/8"</option>
                      <option value="0.25">1/4"</option>
                      <option value="0.375">3/8"</option>
                      <option value="0.5">1/2"</option>
                      <option value="0.625">5/8"</option>
                      <option value="0.75">3/4"</option>
                      <option value="0.875">7/8"</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
                <div className="flex items-center space-x-2">
                  <div className="flex-1">
                    <input
                      type="number"
                      inputMode="decimal"
                      min="10"
                      max="120"
                      className="w-full rounded-md border border-gray-300 py-3 px-3 text-center text-lg"
                      value={height}
                      onChange={(e) => handleHeightChange(parseInt(e.target.value) || 48)}
                    />
                  </div>
                  <div className="w-24">
                    <select
                      className="w-full rounded-md border border-gray-300 py-3 px-2 text-center text-lg"
                      value={heightFraction}
                      onChange={(e) => handleHeightFractionChange(e.target.value)}
                    >
                      <option value="0">0"</option>
                      <option value="0.125">1/8"</option>
                      <option value="0.25">1/4"</option>
                      <option value="0.375">3/8"</option>
                      <option value="0.5">1/2"</option>
                      <option value="0.625">5/8"</option>
                      <option value="0.75">3/4"</option>
                      <option value="0.875">7/8"</option>
                    </select>
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-600 mt-2">
                • For {selectedOptions['Mount Type'] || 'Inside Mount'}, measure to the nearest 1/8 inch.
              </p>
            </div>
          </div>
        )}

        {/* Color Section */}
        {activeSection === 'colors' && (
          <div className="colors-section">
            <h2 className="text-xl font-semibold mb-4">Select Color</h2>

            {colorOption && (
              <div className="grid grid-cols-2 gap-3 mb-4">
                {colorOption.values.map(color => (
                  <div
                    key={color}
                    className={`relative border rounded-md p-3 cursor-pointer overflow-hidden ${
                      selectedOptions['Color'] === color ? 'border-blue-600 ring-2 ring-blue-600' : 'border-gray-300'
                    }`}
                    onClick={() => handleOptionChange('Color', color)}
                  >
                    <div
                      className="h-16 w-full mb-2 rounded"
                      style={{ backgroundColor: colorMap[color] || color }}
                    />
                    <p className="text-sm font-medium text-center">{color}</p>

                    {selectedOptions['Color'] === color && (
                      <div className="absolute top-2 right-2 bg-blue-600 rounded-full p-1">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-sm mb-1">Need to see it first?</h3>
              <p className="text-xs text-gray-600 mb-2">Order free color samples to make sure it matches your décor.</p>
              <button className="w-full py-2 border border-blue-600 text-blue-600 rounded-md text-sm">
                Get Free Samples
              </button>
            </div>
          </div>
        )}

        {/* Options Section */}
        {activeSection === 'options' && (
          <div className="options-section">
            <h2 className="text-xl font-semibold mb-4">Control Options</h2>

            <div className="mb-6">
              <h3 className="text-base font-medium mb-2">Control Type</h3>
              <div className="grid grid-cols-1 gap-3">
                {['Standard', 'Cordless', 'Motorized'].map(type => (
                  <div
                    key={type}
                    className={`border rounded-md p-3 cursor-pointer flex items-center ${
                      selectedOptions['Control Type'] === type ? 'border-blue-600 bg-blue-50' : 'border-gray-300'
                    }`}
                    onClick={() => handleOptionChange('Control Type', type)}
                  >
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">{type}</h4>
                      <p className="text-xs text-gray-600">
                        {type === 'Standard' && 'Traditional cord operation'}
                        {type === 'Cordless' && 'Child-safe, no dangling cords (+$30)'}
                        {type === 'Motorized' && 'Remote controlled operation (+$75)'}
                      </p>
                    </div>
                    {selectedOptions['Control Type'] === type && (
                      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {selectedOptions['Control Type'] !== 'Cordless' && (
              <div className="mb-6">
                <h3 className="text-base font-medium mb-2">Control Side</h3>
                <div className="grid grid-cols-2 gap-3">
                  {['Left', 'Right'].map(side => (
                    <div
                      key={side}
                      className={`border rounded-md p-3 cursor-pointer text-center ${
                        selectedOptions['Control Side'] === side ? 'border-blue-600 bg-blue-50' : 'border-gray-300'
                      }`}
                      onClick={() => handleOptionChange('Control Side', side)}
                    >
                      <h4 className="text-sm font-medium">{side}</h4>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Features Section */}
        {activeSection === 'features' && (
          <div className="features-section">
            <h2 className="text-xl font-semibold mb-4">Additional Features</h2>

            <div className="mb-6">
              <h3 className="text-base font-medium mb-2">Light Blocker</h3>
              <div className="grid grid-cols-1 gap-3">
                {['None', 'Side Channels', 'Full Blackout Kit'].map(blocker => (
                  <div
                    key={blocker}
                    className={`border rounded-md p-3 cursor-pointer flex items-center ${
                      selectedOptions['Light Blocker'] === blocker ? 'border-blue-600 bg-blue-50' : 'border-gray-300'
                    }`}
                    onClick={() => handleOptionChange('Light Blocker', blocker)}
                  >
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">{blocker}</h4>
                      <p className="text-xs text-gray-600">
                        {blocker === 'None' && 'Standard installation'}
                        {blocker === 'Side Channels' && 'Reduces light leak on sides (+$15)'}
                        {blocker === 'Full Blackout Kit' && 'Maximum light blocking for complete darkness (+$25)'}
                      </p>
                    </div>
                    {selectedOptions['Light Blocker'] === blocker && (
                      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-base font-medium mb-2">Valance Type</h3>
              <div className="grid grid-cols-1 gap-3">
                {['Standard', 'Deluxe', 'None'].map(valance => (
                  <div
                    key={valance}
                    className={`border rounded-md p-3 cursor-pointer flex items-center ${
                      selectedOptions['Valance Type'] === valance ? 'border-blue-600 bg-blue-50' : 'border-gray-300'
                    }`}
                    onClick={() => handleOptionChange('Valance Type', valance)}
                  >
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">{valance}</h4>
                      <p className="text-xs text-gray-600">
                        {valance === 'Standard' && 'Clean, simple finishing touch'}
                        {valance === 'Deluxe' && 'Premium finish with decorative details (+$18)'}
                        {valance === 'None' && 'Minimal look without a decorative valance'}
                      </p>
                    </div>
                    {selectedOptions['Valance Type'] === valance && (
                      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <DeliveryEstimator
              selectedOptions={selectedOptions}
              mountType={selectedOptions['Mount Type'] || 'Inside Mount'}
              hasCustomFeatures={hasCustomFeatures()}
            />
          </div>
        )}

        {/* Summary Section */}
        {activeSection === 'summary' && (
          <div className="summary-section">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

            <div className="mb-4 p-4 border rounded-lg">
              <div className="flex items-start">
                <div className="mr-3 w-20 h-20 rounded overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-medium">{product.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{width}" × {height}" - {selectedOptions['Color'] || 'White'}</p>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Mount Type:</span>
                  <span className="font-medium">{selectedOptions['Mount Type'] || 'Inside Mount'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Control Type:</span>
                  <span className="font-medium">{selectedOptions['Control Type'] || 'Standard'}</span>
                </div>
                {selectedOptions['Control Type'] !== 'Cordless' && (
                  <div className="flex justify-between">
                    <span>Control Side:</span>
                    <span className="font-medium">{selectedOptions['Control Side'] || 'Right'}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Light Blocker:</span>
                  <span className="font-medium">{selectedOptions['Light Blocker'] || 'None'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Valance Type:</span>
                  <span className="font-medium">{selectedOptions['Valance Type'] || 'Standard'}</span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-base font-medium mb-2">Quantity</h3>
              <div className="flex border rounded-md">
                <button
                  className="w-12 h-12 flex items-center justify-center text-xl border-r"
                  onClick={() => handleQuantityChange(quantity - 1)}
                >−</button>
                <input
                  type="number"
                  inputMode="numeric"
                  min="1"
                  value={quantity}
                  onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                  className="w-full h-12 text-center text-xl border-none"
                />
                <button
                  className="w-12 h-12 flex items-center justify-center text-xl border-l"
                  onClick={() => handleQuantityChange(quantity + 1)}
                >+</button>
              </div>
            </div>

            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between text-sm mb-2">
                <span>Price Per Blind:</span>
                <span>${calculatedPrice.toFixed(2)}</span>
              </div>
              {quantity > 1 && (
                <div className="flex justify-between text-sm mb-2">
                  <span>Quantity:</span>
                  <span>×{quantity}</span>
                </div>
              )}
              <div className="flex justify-between font-medium text-lg border-t border-gray-300 pt-2 mt-2">
                <span>Total:</span>
                <span>${(calculatedPrice * quantity).toFixed(2)}</span>
              </div>
              <DeliveryEstimator
                selectedOptions={selectedOptions}
                mountType={selectedOptions['Mount Type'] || 'Inside Mount'}
                hasCustomFeatures={hasCustomFeatures()}
              />
            </div>

            <button
              className="w-full py-3 bg-primary-red text-white rounded-md font-medium text-lg"
              onClick={handleAddToCart}
            >
              Add to Cart
            </button>
          </div>
        )}
      </div>

      {/* Fixed Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg flex justify-between items-center p-3 z-20">
        <button
          onClick={goToPreviousSection}
          disabled={activeSection === 'preview'}
          className={`px-4 py-2 flex items-center ${
            activeSection === 'preview' ? 'opacity-50 text-gray-400' : 'text-blue-600'
          }`}
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </button>

        <div className="text-gray-600 text-sm flex-1 text-center">
          Step {(['preview', 'dimensions', 'colors', 'options', 'features', 'summary'].indexOf(activeSection) + 1)} of 6
        </div>

        {activeSection !== 'summary' ? (
          <button
            onClick={goToNextSection}
            className="px-4 py-2 text-blue-600 flex items-center"
          >
            Next
            <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ) : (
          <button
            onClick={handleAddToCart}
            className="px-4 py-2 bg-primary-red text-white rounded"
          >
            Add to Cart
          </button>
        )}
      </div>
    </div>
  );
};

export default MobileProductConfigurator;
