import React from 'react';

const MeasureInstallPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Measuring & Installation Guide</h1>

      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Why Proper Measurements Matter</h2>
          <p className="text-gray-600 mb-4">
            Accurate measurements are crucial for a perfect fit. Since all our window treatments are custom-made to your specifications,
            taking the time to measure correctly will ensure your blinds or shades fit beautifully and function properly.
          </p>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
            <p className="text-sm font-medium text-gray-800">Need help? Our measurement experts are ready to assist you!</p>
            <p className="text-sm text-gray-600">Call (316) 530-2635 or schedule a free virtual consultation.</p>
          </div>
          <button className="bg-primary-red hover:bg-red-700 text-white font-medium py-2 px-4 rounded transition-colors">
            Schedule Free Consultation
          </button>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Choose Your Mount Type</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="h-48 bg-gray-100 flex items-center justify-center">
              <img src="https://ext.same-assets.com/2035588304/3867452910.jpeg" alt="Inside Mount" className="h-full object-cover" />
            </div>
            <div className="p-5">
              <h3 className="font-medium text-lg mb-2">Inside Mount</h3>
              <p className="text-gray-600 mb-4">
                Inside mount installations fit inside the window frame, creating a clean, built-in look that showcases your window trim.
                Ideal for windows with attractive trim or when you have multiple windows side by side.
              </p>
              <div className="space-y-2 text-sm text-gray-600">
                <p><span className="font-medium">Minimum Depth Required:</span> Varies by product (1-4 inches)</p>
                <p><span className="font-medium">Light Gap:</span> Small light gaps may be present on sides</p>
                <p><span className="font-medium">Appearance:</span> Clean, built-in look</p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="h-48 bg-gray-100 flex items-center justify-center">
              <img src="https://ext.same-assets.com/2035588304/1867452910.jpeg" alt="Outside Mount" className="h-full object-cover" />
            </div>
            <div className="p-5">
              <h3 className="font-medium text-lg mb-2">Outside Mount</h3>
              <p className="text-gray-600 mb-4">
                Outside mount installations attach to the wall above the window or on the window frame.
                This option provides better light control, more privacy, and can make windows appear larger.
              </p>
              <div className="space-y-2 text-sm text-gray-600">
                <p><span className="font-medium">Depth Requirements:</span> None</p>
                <p><span className="font-medium">Light Blockage:</span> Better light blockage and privacy</p>
                <p><span className="font-medium">Best For:</span> Shallow window frames, better room darkening</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">How to Measure</h2>

        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
          <div className="p-6">
            <h3 className="font-medium text-lg text-primary-red mb-4">For Inside Mount</h3>

            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-2">Step 1: Measure Width</h4>
                <p className="text-gray-600 mb-2">
                  Measure the exact width of the window opening in three places: top, middle, and bottom.
                  Record the narrowest measurement to ensure your blinds will fit properly.
                </p>
                <div className="bg-gray-50 p-3 rounded border border-gray-200">
                  <p className="text-sm text-gray-700"><strong>Pro Tip:</strong> DO NOT deduct anything from your measurements. Our factory will make the necessary deductions to ensure proper fit.</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Step 2: Measure Height</h4>
                <p className="text-gray-600 mb-2">
                  Measure the exact height of the window opening in three places: left, center, and right.
                  Record the tallest measurement to ensure your blinds will cover the entire opening.
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Step 3: Measure Depth</h4>
                <p className="text-gray-600">
                  Measure the depth of your window frame to ensure you have enough space for an inside mount.
                  Check the product specifications for minimum depth requirements.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6">
            <h3 className="font-medium text-lg text-primary-red mb-4">For Outside Mount</h3>

            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-2">Step 1: Measure Width</h4>
                <p className="text-gray-600 mb-2">
                  Measure the width of the area you want to cover. We recommend adding 3-4 inches (1.5-2 inches per side)
                  to your window opening width to minimize light leakage and provide better privacy.
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Step 2: Measure Height</h4>
                <p className="text-gray-600 mb-2">
                  Measure the height of the area you want to cover. For optimal light control, add 3-4 inches above the window opening
                  and have the treatment extend to the windowsill or 2-3 inches below it.
                </p>
                <div className="bg-gray-50 p-3 rounded border border-gray-200">
                  <p className="text-sm text-gray-700"><strong>Pro Tip:</strong> For outside mount, the measurements you provide will be the exact size of the product we create.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Installation Guides</h2>
          <p className="text-gray-600 mb-6">
            Every Smart Blinds order comes with detailed installation instructions specific to your product.
            You can also download general installation guides below:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a href="#" className="flex items-center p-3 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
              <svg className="w-6 h-6 text-primary-red mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-700">Horizontal Blinds Installation Guide</span>
            </a>

            <a href="#" className="flex items-center p-3 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
              <svg className="w-6 h-6 text-primary-red mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-700">Cellular Shades Installation Guide</span>
            </a>

            <a href="#" className="flex items-center p-3 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
              <svg className="w-6 h-6 text-primary-red mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-700">Roman Shades Installation Guide</span>
            </a>

            <a href="#" className="flex items-center p-3 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
              <svg className="w-6 h-6 text-primary-red mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-700">Motorized Products Installation Guide</span>
            </a>
          </div>
        </div>
      </div>

      <div className="bg-primary-red text-white rounded-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-2">Need Professional Installation?</h2>
          <p className="mb-4">
            We partner with professional installers nationwide. Our installation services start at just $149 per visit.
          </p>
          <button className="bg-white text-primary-red hover:bg-gray-100 font-medium py-2 px-4 rounded transition-colors">
            Get Installation Quote
          </button>
        </div>
      </div>
    </div>
  );
};

export default MeasureInstallPage;
