import React from 'react';

interface ProfessionalServicesProps {
  professionalMeasurement: boolean;
  professionalInstallation: boolean;
  expeditedProduction: boolean;
  onToggleMeasurement: () => void;
  onToggleInstallation: () => void;
  onToggleExpedited: () => void;
}

const ProfessionalServices: React.FC<ProfessionalServicesProps> = ({
  professionalMeasurement,
  professionalInstallation,
  expeditedProduction,
  onToggleMeasurement,
  onToggleInstallation,
  onToggleExpedited
}) => {
  return (
    <div className="mb-6 bg-gray-50 p-4 rounded-lg">
      <h3 className="text-lg font-medium mb-3">Professional Services</h3>

      <div className="space-y-4">
        {/* Professional Measurement */}
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="prof-measure"
              name="prof-measure"
              type="checkbox"
              checked={professionalMeasurement}
              onChange={onToggleMeasurement}
              className="focus:ring-primary-red h-4 w-4 text-primary-red border-gray-300 rounded"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="prof-measure" className="font-medium text-gray-700">Professional Measurement</label>
            <p className="text-gray-500">Have an expert take precise window measurements for you. $39.99</p>
          </div>
          <div className="ml-auto text-right">
            <span className="font-medium text-primary-red">$39.99</span>
          </div>
        </div>

        {/* Professional Installation */}
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="prof-install"
              name="prof-install"
              type="checkbox"
              checked={professionalInstallation}
              onChange={onToggleInstallation}
              className="focus:ring-primary-red h-4 w-4 text-primary-red border-gray-300 rounded"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="prof-install" className="font-medium text-gray-700">Professional Installation</label>
            <p className="text-gray-500">Have a local expert install your window treatments. $79.99 per blind</p>
          </div>
          <div className="ml-auto text-right">
            <span className="font-medium text-primary-red">$79.99</span>
          </div>
        </div>

        {/* Expedited Production */}
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="expedited"
              name="expedited"
              type="checkbox"
              checked={expeditedProduction}
              onChange={onToggleExpedited}
              className="focus:ring-primary-red h-4 w-4 text-primary-red border-gray-300 rounded"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="expedited" className="font-medium text-gray-700">Expedited Production</label>
            <p className="text-gray-500">Receive your order faster with our expedited production. 25% surcharge</p>
          </div>
          <div className="ml-auto text-right">
            <span className="font-medium text-primary-red">+25%</span>
          </div>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-500">
        <p className="flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Professional installation and measurement will be added at checkout
        </p>
      </div>
    </div>
  );
};

export default ProfessionalServices;
