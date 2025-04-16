import React, { useState } from 'react';

const CreateEstimatePage: React.FC = () => {
  const [step, setStep] = useState(1);

  // Step 1: Initial Details Form State
  const [windowCount, setWindowCount] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Step 2: Window Details Form State
  const [windows, setWindows] = useState([
    {
      id: 1,
      room: '',
      width: '',
      height: '',
      mountType: '',
      productType: '',
      color: ''
    }
  ]);

  // Step 3: Additional Preferences
  const [preferences, setPreferences] = useState({
    budget: '',
    timeframe: 'Within 1 month',
    features: [] as string[],
    additionalNotes: ''
  });

  // Step 4: Estimate Results
  const [estimateData, setEstimateData] = useState({
    estimateId: '',
    totalPrice: 0,
    items: [] as any[],
    validUntil: ''
  });

  const handleNextStep = () => {
    if (step === 3) {
      // Generate estimate
      generateEstimate();
    }

    setStep(step + 1);
  };

  const handlePreviousStep = () => {
    setStep(step - 1);
  };

  const addWindow = () => {
    const newWindow = {
      id: windows.length + 1,
      room: '',
      width: '',
      height: '',
      mountType: '',
      productType: '',
      color: ''
    };

    setWindows([...windows, newWindow]);
    setWindowCount(windowCount + 1);
  };

  const removeWindow = (id: number) => {
    if (windows.length > 1) {
      setWindows(windows.filter(window => window.id !== id));
      setWindowCount(windowCount - 1);
    }
  };

  const updateWindow = (id: number, field: string, value: string) => {
    setWindows(windows.map(window =>
      window.id === id ? { ...window, [field]: value } : window
    ));
  };

  const updatePreference = (field: string, value: any) => {
    setPreferences({ ...preferences, [field]: value });
  };

  const toggleFeature = (feature: string) => {
    const currentFeatures = [...preferences.features];
    const index = currentFeatures.indexOf(feature);

    if (index > -1) {
      currentFeatures.splice(index, 1);
    } else {
      currentFeatures.push(feature);
    }

    updatePreference('features', currentFeatures);
  };

  const generateEstimate = () => {
    // In a real implementation, this would send the data to an API and get a real estimate
    // For now, we'll create a simple placeholder estimate

    // Create an estimate item for each window
    const estimateItems = windows.map(window => {
      // Basic placeholder item with minimal details
      return {
        id: window.id,
        description: `${window.productType || 'Custom Window Treatment'} for ${window.room || 'Room'}`,
        dimensions: `${window.width || '30'}" × ${window.height || '60'}"`,
        mountType: window.mountType || 'Inside Mount',
        color: window.color || 'White',
        price: 0, // Price would come from API in real implementation
        features: preferences.features
      };
    });

    // Create a date 30 days from now for quote validity
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 30);

    setEstimateData({
      estimateId: `EST-${Math.floor(10000 + Math.random() * 90000)}`,
      totalPrice: 0, // Would be calculated by API in real implementation
      items: estimateItems,
      validUntil: validUntil.toLocaleDateString()
    });
  };

  const renderStepOne = () => {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold mb-4">Step 1: Basic Information</h2>

        <div>
          <label htmlFor="windowCount" className="block text-sm font-medium text-gray-700 mb-1">
            How many windows do you need covered?
          </label>
          <div className="flex">
            <button
              type="button"
              onClick={() => windowCount > 1 && setWindowCount(windowCount - 1)}
              className="bg-gray-200 text-gray-600 px-3 py-2 rounded-l"
            >
              -
            </button>
            <input
              type="number"
              id="windowCount"
              value={windowCount}
              onChange={(e) => setWindowCount(parseInt(e.target.value) || 1)}
              min="1"
              className="w-16 text-center border-y border-gray-300 py-2"
            />
            <button
              type="button"
              onClick={() => setWindowCount(windowCount + 1)}
              className="bg-gray-200 text-gray-600 px-3 py-2 rounded-r"
            >
              +
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Your Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-primary-red"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-primary-red"
            />
          </div>
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number (Optional)
          </label>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-primary-red"
          />
        </div>

        <div className="pt-4">
          <button
            type="button"
            onClick={handleNextStep}
            className="bg-primary-red hover:bg-red-700 text-white font-medium py-2 px-6 rounded transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  const renderStepTwo = () => {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold mb-4">Step 2: Window Details</h2>
        <p className="text-gray-600 mb-4">
          Please provide details for each window you want to cover. Add accurate measurements for the best estimate.
        </p>

        {windows.map((window, index) => (
          <div key={window.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Window {index + 1}</h3>
              {windows.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeWindow(window.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room
                </label>
                <select
                  value={window.room}
                  onChange={(e) => updateWindow(window.id, 'room', e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-primary-red"
                >
                  <option value="">Select Room</option>
                  <option value="Living Room">Living Room</option>
                  <option value="Bedroom">Bedroom</option>
                  <option value="Kitchen">Kitchen</option>
                  <option value="Bathroom">Bathroom</option>
                  <option value="Dining Room">Dining Room</option>
                  <option value="Office">Office</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Width (inches)
                </label>
                <input
                  type="text"
                  value={window.width}
                  onChange={(e) => updateWindow(window.id, 'width', e.target.value)}
                  placeholder="e.g., 36"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-primary-red"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Height (inches)
                </label>
                <input
                  type="text"
                  value={window.height}
                  onChange={(e) => updateWindow(window.id, 'height', e.target.value)}
                  placeholder="e.g., 72"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-primary-red"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mount Type
                </label>
                <select
                  value={window.mountType}
                  onChange={(e) => updateWindow(window.id, 'mountType', e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-primary-red"
                >
                  <option value="">Select Mount Type</option>
                  <option value="Inside Mount">Inside Mount</option>
                  <option value="Outside Mount">Outside Mount</option>
                  <option value="Not Sure">Not Sure</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Type
                </label>
                <select
                  value={window.productType}
                  onChange={(e) => updateWindow(window.id, 'productType', e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-primary-red"
                >
                  <option value="">Select Product</option>
                  <option value="Cellular Shades">Cellular Shades</option>
                  <option value="Wood Blinds">Wood Blinds</option>
                  <option value="Faux Wood Blinds">Faux Wood Blinds</option>
                  <option value="Roller Shades">Roller Shades</option>
                  <option value="Roman Shades">Roman Shades</option>
                  <option value="Not Sure">Not Sure</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color Preference
                </label>
                <select
                  value={window.color}
                  onChange={(e) => updateWindow(window.id, 'color', e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-primary-red"
                >
                  <option value="">Select Color</option>
                  <option value="White">White</option>
                  <option value="Off-White">Off-White</option>
                  <option value="Gray">Gray</option>
                  <option value="Black">Black</option>
                  <option value="Wood Tone">Wood Tone</option>
                  <option value="Not Sure">Not Sure</option>
                </select>
              </div>
            </div>
          </div>
        ))}

        {windows.length < windowCount && (
          <div className="text-center">
            <button
              type="button"
              onClick={addWindow}
              className="border border-primary-red text-primary-red hover:bg-red-50 font-medium py-2 px-4 rounded transition-colors"
            >
              + Add Another Window
            </button>
          </div>
        )}

        <div className="pt-4 flex justify-between">
          <button
            type="button"
            onClick={handlePreviousStep}
            className="border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2 px-6 rounded transition-colors"
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleNextStep}
            className="bg-primary-red hover:bg-red-700 text-white font-medium py-2 px-6 rounded transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  const renderStepThree = () => {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold mb-4">Step 3: Additional Preferences</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Budget Range
          </label>
          <select
            value={preferences.budget}
            onChange={(e) => updatePreference('budget', e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-primary-red"
          >
            <option value="">Select Budget Range</option>
            <option value="$0-$500">$0-$500</option>
            <option value="$500-$1,000">$500-$1,000</option>
            <option value="$1,000-$2,000">$1,000-$2,000</option>
            <option value="$2,000-$5,000">$2,000-$5,000</option>
            <option value="$5,000+">$5,000+</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timeframe
          </label>
          <select
            value={preferences.timeframe}
            onChange={(e) => updatePreference('timeframe', e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-primary-red"
          >
            <option value="Within 1 month">Within 1 month</option>
            <option value="1-3 months">1-3 months</option>
            <option value="3-6 months">3-6 months</option>
            <option value="Just researching">Just researching</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Special Features (Select all that apply)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {['Cordless', 'Motorized', 'Room Darkening', 'Energy Efficient', 'Child Safety', 'Smart Home Compatible'].map(feature => (
              <div key={feature} className="flex items-center">
                <input
                  type="checkbox"
                  id={`feature-${feature}`}
                  checked={preferences.features.includes(feature)}
                  onChange={() => toggleFeature(feature)}
                  className="mr-2"
                />
                <label htmlFor={`feature-${feature}`} className="text-gray-700">
                  {feature}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Notes or Requests
          </label>
          <textarea
            value={preferences.additionalNotes}
            onChange={(e) => updatePreference('additionalNotes', e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-primary-red h-32"
            placeholder="Tell us about any specific requirements, concerns, or questions..."
          ></textarea>
        </div>

        <div className="pt-4 flex justify-between">
          <button
            type="button"
            onClick={handlePreviousStep}
            className="border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2 px-6 rounded transition-colors"
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleNextStep}
            className="bg-primary-red hover:bg-red-700 text-white font-medium py-2 px-6 rounded transition-colors"
          >
            Generate Estimate
          </button>
        </div>
      </div>
    );
  };

  const renderStepFour = () => {
    return (
      <div className="space-y-6">
        <div className="bg-green-50 p-4 border border-green-200 rounded-lg text-green-800 mb-6">
          <h2 className="text-xl font-semibold mb-2">Your Estimate is Ready!</h2>
          <p>
            We've created a personalized estimate based on your requirements. A copy has also been sent to your email.
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
            <div>
              <h3 className="font-semibold text-lg">Estimate #{estimateData.estimateId}</h3>
              <p className="text-sm text-gray-600">Valid until: {estimateData.validUntil}</p>
            </div>
            <div className="mt-2 md:mt-0">
              <span className="font-bold text-xl text-primary-red">
                ${estimateData.totalPrice.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Description</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Dimensions</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Options</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {estimateData.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 text-sm">{item.description}</td>
                    <td className="px-4 py-3 text-sm">{item.dimensions}</td>
                    <td className="px-4 py-3 text-sm">
                      <div>{item.mountType}</div>
                      <div>{item.color}</div>
                      {item.features.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          {item.features.join(', ')}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">${item.price.toFixed(2)}</td>
                  </tr>
                ))}
                <tr className="bg-gray-50">
                  <td colSpan={3} className="px-4 py-3 font-semibold text-right">Total Estimate</td>
                  <td className="px-4 py-3 font-bold text-right">${estimateData.totalPrice.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
          <h3 className="font-semibold text-lg mb-4">Ready to move forward with your project?</h3>
          <p className="text-gray-600 mb-6">
            This is just an estimate. Speak with one of our window treatment experts to finalize your order.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="bg-primary-red hover:bg-red-700 text-white font-medium py-2 px-6 rounded transition-colors">
              Schedule a Consultation
            </button>
            <button className="border border-primary-red text-primary-red hover:bg-red-50 font-medium py-2 px-6 rounded transition-colors">
              Place Order Online
            </button>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="button"
            onClick={handlePreviousStep}
            className="border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2 px-6 rounded transition-colors"
          >
            Back to Edit Estimate
          </button>
        </div>
      </div>
    );
  };

  const renderStepContent = () => {
    switch(step) {
      case 1:
        return renderStepOne();
      case 2:
        return renderStepTwo();
      case 3:
        return renderStepThree();
      case 4:
        return renderStepFour();
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2 text-gray-800">Create Your Free Estimate</h1>
      <p className="text-gray-600 mb-8">Get a personalized quote for your custom window treatments in minutes.</p>

      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((stepNumber) => (
            <React.Fragment key={stepNumber}>
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= stepNumber ? 'bg-primary-red text-white' : 'bg-gray-200 text-gray-600'}`}>
                  {stepNumber}
                </div>
                <span className={`text-xs mt-1 ${step >= stepNumber ? 'text-primary-red' : 'text-gray-500'}`}>
                  {stepNumber === 1 && 'Basic Info'}
                  {stepNumber === 2 && 'Windows'}
                  {stepNumber === 3 && 'Preferences'}
                  {stepNumber === 4 && 'Estimate'}
                </span>
              </div>

              {stepNumber < 4 && (
                <div className={`flex-1 h-1 mx-2 ${step > stepNumber ? 'bg-primary-red' : 'bg-gray-200'}`}></div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
        <div className="p-6">
          {renderStepContent()}
        </div>
      </div>
    </div>
  );
};

export default CreateEstimatePage;
