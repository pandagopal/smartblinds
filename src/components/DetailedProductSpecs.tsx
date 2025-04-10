import React, { useState } from 'react';
import { Product } from '../models/Product';

interface DetailedProductSpecsProps {
  product: Product;
  selectedOptions?: Record<string, string>;
}

interface TabItem {
  id: string;
  title: string;
  icon: React.ReactNode;
}

const DetailedProductSpecs: React.FC<DetailedProductSpecsProps> = ({ product, selectedOptions }) => {
  const [activeTab, setActiveTab] = useState<string>('specifications');

  // Define the tabs
  const tabs: TabItem[] = [
    {
      id: 'specifications',
      title: 'Specifications',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      )
    },
    {
      id: 'features',
      title: 'Features & Benefits',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )
    },
    {
      id: 'installation',
      title: 'Installation Guide',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    {
      id: 'care',
      title: 'Care & Maintenance',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      )
    },
    {
      id: 'warranty',
      title: 'Warranty Information',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
  ];

  // Enhanced product specifications
  const enhancedSpecs = [
    { name: 'Material', value: 'High-quality PVC (Faux Wood) / Basswood (Real Wood)' },
    { name: 'Slat Size Options', value: '2 inch (standard), 2.5 inch (premium)' },
    { name: 'Minimum Width', value: '12 inches' },
    { name: 'Maximum Width', value: '96 inches' },
    { name: 'Minimum Height', value: '12 inches' },
    { name: 'Maximum Height', value: '108 inches' },
    { name: 'Light Control', value: 'Excellent - adjustable slats for precise light control' },
    { name: 'Privacy Level', value: 'High when closed' },
    { name: 'Control Types', value: 'Standard cord, Cordless (child-safe), Motorized' },
    { name: 'Mount Types', value: 'Inside mount, Outside mount' },
    { name: 'Headrail', value: 'Standard valance, Deluxe valance' },
    { name: 'Color Options', value: '12+ designer colors including whites, neutrals, and wood tones' },
    { name: 'Weight', value: 'Approx. 1.5-2.5 pounds per square foot' },
    { name: 'Country of Origin', value: 'Assembled in USA with imported materials' }
  ];

  // Features and benefits
  const features = [
    {
      title: 'Durability & Long Life',
      description: 'Our faux wood blinds are made from high-quality PVC that won\'t warp, crack, or fade, ensuring years of reliable performance.'
    },
    {
      title: 'Energy Efficiency',
      description: 'These blinds provide excellent insulation to help keep your home cool in summer and warm in winter, potentially reducing energy costs.'
    },
    {
      title: 'Moisture Resistance',
      description: 'Perfect for high-humidity areas like kitchens and bathrooms, these blinds resist moisture damage that can affect real wood blinds.'
    },
    {
      title: 'UV Protection',
      description: 'Our blinds block harmful UV rays, protecting your furniture, flooring, and artwork from sun damage and fading.'
    },
    {
      title: 'Easy Cleaning',
      description: 'Simply dust with a soft cloth or vacuum with a brush attachment for routine maintenance. For deeper cleaning, the slats can be wiped with a damp cloth.'
    },
    {
      title: 'Child & Pet Safety',
      description: 'Available with cordless or motorized options to eliminate dangling cords, making them safer for homes with children and pets.'
    },
    {
      title: 'Precise Light Control',
      description: 'Adjust the slats to control the exact amount of light entering your room, from full brightness to complete privacy.'
    }
  ];

  // Installation guide
  const installationSteps = [
    {
      step: 1,
      title: 'Gather Your Tools',
      description: 'You\'ll need a drill, screwdriver, pencil, measuring tape, and level. All mounting hardware is included with your blinds.'
    },
    {
      step: 2,
      title: 'Mark Bracket Positions',
      description: 'For inside mounts, place brackets 1/4 inch from the front of the window frame. For outside mounts, position brackets at the desired height and width.'
    },
    {
      step: 3,
      title: 'Install the Brackets',
      description: 'Use the included screws to secure the brackets to your window frame or wall. Ensure they are level and firmly attached.'
    },
    {
      step: 4,
      title: 'Mount the Headrail',
      description: 'Slide the headrail into the brackets until it clicks into place. Make sure it is secure before proceeding.'
    },
    {
      step: 5,
      title: 'Attach the Valance',
      description: 'Clip the valance onto the front of the headrail to hide the mounting hardware for a finished look.'
    },
    {
      step: 6,
      title: 'Test Operation',
      description: 'Test the blind\'s operation to ensure smooth raising, lowering, and tilting. Make any necessary adjustments to the cord length.'
    }
  ];

  // Care instructions
  const careInstructions = [
    {
      title: 'Regular Dusting',
      frequency: 'Weekly',
      description: 'Use a soft cloth, feather duster, or vacuum with a brush attachment to gently remove dust from slats. Work from top to bottom with slats in the closed position.'
    },
    {
      title: 'Deeper Cleaning',
      frequency: 'Monthly or as needed',
      description: 'For more thorough cleaning, wipe slats with a damp cloth using mild soap and water. Avoid soaking the slats or getting water on the headrail mechanism.'
    },
    {
      title: 'Spot Cleaning',
      frequency: 'As needed',
      description: 'For stains or marks, use a gentle cleaner appropriate for PVC/vinyl surfaces. Test in an inconspicuous area first.'
    },
    {
      title: 'Headrail Maintenance',
      frequency: 'Every 6 months',
      description: 'Keep the headrail mechanism clean and free of dust to ensure smooth operation. A can of compressed air can help remove dust from hard-to-reach areas.'
    },
    {
      title: 'Cord Maintenance',
      frequency: 'Every 3 months',
      description: 'Check cords for fraying or damage. Keep them clean and untangled for optimal performance and safety.'
    },
    {
      title: 'Avoid Harsh Chemicals',
      frequency: 'Always',
      description: 'Never use bleach, ammonia, or abrasive cleaners on your blinds as these can damage the finish and material.'
    }
  ];

  // Warranty information
  const warrantyInfo = {
    basic: {
      title: 'Limited Lifetime Warranty',
      description: 'Our faux wood blinds come with a limited lifetime warranty covering manufacturing defects, including faulty materials, mechanisms, and workmanship under normal use.',
      coverage: [
        'Headrail mechanisms',
        'Brackets and hardware',
        'Slats and valance',
        'Color fastness and warping'
      ]
    },
    motorized: {
      title: '5-Year Motor Warranty',
      description: 'For motorized blinds, the motor and electronic components are covered by a 5-year warranty against manufacturing defects and failure under normal use.',
      coverage: [
        'Motor functionality',
        'Remote control operation',
        'Electronic components',
        'Battery performance (1 year)'
      ]
    },
    exclusions: [
      'Damage from improper installation',
      'Accidents or misuse',
      'Exposure to extreme environmental conditions',
      'Normal wear and tear',
      'Damage from improper cleaning'
    ],
    claims: 'To make a warranty claim, contact our customer service department with your order information and a description of the issue. We may request photos or videos of the problem for assessment.'
  };

  return (
    <div className="detailed-product-specs bg-white rounded shadow-md p-4 mb-8">
      <h2 className="text-lg font-medium mb-4">Detailed Product Information</h2>

      {/* Tabs */}
      <div className="tabs-container mb-6">
        <div className="tabs-header overflow-x-auto pb-2">
          <div className="flex space-x-1 min-w-max border-b border-gray-200">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`px-4 py-2 flex items-center text-sm font-medium whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-b-2 border-primary-red text-primary-red'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.title}
              </button>
            ))}
          </div>
        </div>

        <div className="tab-content p-1">
          {/* Specifications Tab */}
          {activeTab === 'specifications' && (
            <div className="specifications-tab">
              <h3 className="text-base font-medium mb-3">Technical Specifications</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <tbody>
                    {enhancedSpecs.map((spec, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="py-2 px-3 font-medium w-1/3">{spec.name}</td>
                        <td className="py-2 px-3 text-gray-700">{spec.value}</td>
                      </tr>
                    ))}
                    {product.specs.map((spec, index) => {
                      // Skip if the spec is already included in enhancedSpecs
                      if (enhancedSpecs.find(s => s.name === spec.name)) return null;
                      return (
                        <tr key={`product-${index}`} className={(enhancedSpecs.length + index) % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="py-2 px-3 font-medium w-1/3">{spec.name}</td>
                          <td className="py-2 px-3 text-gray-700">{spec.value}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Selected configuration summary */}
              {selectedOptions && Object.keys(selectedOptions).length > 0 && (
                <div className="mt-6">
                  <h3 className="text-base font-medium mb-3">Your Current Configuration</h3>
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(selectedOptions).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="font-medium">{key}:</span>
                          <span className="text-gray-700">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Features Tab */}
          {activeTab === 'features' && (
            <div className="features-tab">
              <h3 className="text-base font-medium mb-3">Features & Benefits</h3>
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div key={index} className="feature-item">
                    <h4 className="text-sm font-medium text-gray-800">{feature.title}</h4>
                    <p className="text-sm text-gray-700">{feature.description}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <h3 className="text-base font-medium mb-3">Additional Features</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                  {product.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Installation Tab */}
          {activeTab === 'installation' && (
            <div className="installation-tab">
              <h3 className="text-base font-medium mb-3">Installation Instructions</h3>
              <div className="space-y-6">
                {installationSteps.map((step) => (
                  <div key={step.step} className="installation-step flex">
                    <div className="step-number flex-shrink-0 w-10 h-10 rounded-full bg-primary-red text-white flex items-center justify-center font-medium mr-4">
                      {step.step}
                    </div>
                    <div className="step-content">
                      <h4 className="text-sm font-medium text-gray-800">{step.title}</h4>
                      <p className="text-sm text-gray-700">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 bg-blue-50 p-4 rounded border border-blue-100">
                <h4 className="text-sm font-medium text-blue-800 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Professional Installation Available
                </h4>
                <p className="text-sm text-blue-700 mt-1">
                  For a perfect fit and hassle-free experience, our professional installation service is available.
                  Our experts will ensure your blinds are installed correctly and look their best.
                </p>
                <button className="mt-3 bg-blue-600 text-white text-sm py-1 px-3 rounded hover:bg-blue-700 transition">
                  Schedule Installation
                </button>
              </div>
            </div>
          )}

          {/* Care Tab */}
          {activeTab === 'care' && (
            <div className="care-tab">
              <h3 className="text-base font-medium mb-3">Care & Maintenance</h3>
              <div className="space-y-4">
                {careInstructions.map((instruction, index) => (
                  <div key={index} className="care-instruction bg-gray-50 p-3 rounded">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="text-sm font-medium text-gray-800">{instruction.title}</h4>
                      <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                        {instruction.frequency}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{instruction.description}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 border border-gray-200 rounded">
                <h4 className="text-sm font-medium text-gray-800 mb-2">Pro Tips for Longevity</h4>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                  <li>Rotate your blinds from the closed position regularly to prevent dust buildup in one direction.</li>
                  <li>When cleaning, work from top to bottom to prevent dust from falling on already-cleaned slats.</li>
                  <li>Use the cord wand for tilting rather than pulling on slats directly to prevent damage.</li>
                  <li>Consider scheduling professional deep cleaning once a year for best results.</li>
                </ul>
              </div>
            </div>
          )}

          {/* Warranty Tab */}
          {activeTab === 'warranty' && (
            <div className="warranty-tab">
              <h3 className="text-base font-medium mb-3">Warranty Information</h3>

              <div className="warranty-basic bg-gray-50 p-4 rounded mb-4">
                <h4 className="text-sm font-medium text-gray-800">{warrantyInfo.basic.title}</h4>
                <p className="text-sm text-gray-700 mb-3">{warrantyInfo.basic.description}</p>
                <h5 className="text-xs font-medium text-gray-800 mb-1">Coverage Includes:</h5>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                  {warrantyInfo.basic.coverage.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="warranty-motorized bg-blue-50 p-4 rounded border border-blue-100 mb-4">
                <h4 className="text-sm font-medium text-blue-800">{warrantyInfo.motorized.title}</h4>
                <p className="text-sm text-blue-700 mb-3">{warrantyInfo.motorized.description}</p>
                <h5 className="text-xs font-medium text-blue-800 mb-1">Coverage Includes:</h5>
                <ul className="list-disc pl-5 space-y-1 text-sm text-blue-700">
                  {warrantyInfo.motorized.coverage.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="warranty-exclusions p-4 border border-gray-200 rounded mb-4">
                <h4 className="text-sm font-medium text-gray-800 mb-2">Warranty Exclusions</h4>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                  {warrantyInfo.exclusions.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="warranty-claims bg-gray-50 p-4 rounded">
                <h4 className="text-sm font-medium text-gray-800 mb-2">Making a Warranty Claim</h4>
                <p className="text-sm text-gray-700">{warrantyInfo.claims}</p>
                <div className="mt-3 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-red mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-sm font-medium">Customer Service: (316) 530-2635</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailedProductSpecs;
