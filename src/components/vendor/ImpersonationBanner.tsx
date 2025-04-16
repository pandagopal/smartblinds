import React from 'react';
import { vendorDashboardService } from '../../services/vendorDashboardService';

const ImpersonationBanner: React.FC = () => {
  const isImpersonating = vendorDashboardService.isImpersonating();
  const impersonatedVendor = vendorDashboardService.getImpersonatedVendor();

  if (!isImpersonating || !impersonatedVendor) {
    return null;
  }

  const handleStopImpersonation = () => {
    vendorDashboardService.stopImpersonating();
  };

  return (
    <div className="bg-blue-600 text-white px-4 py-2 flex items-center justify-between">
      <div className="flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>
          You are viewing as <strong>{impersonatedVendor.name}</strong> (Vendor). This is an impersonation session.
        </span>
      </div>
      <button
        onClick={handleStopImpersonation}
        className="bg-white text-blue-600 px-3 py-1 rounded-md text-sm font-medium hover:bg-blue-50 transition-colors"
      >
        Exit Impersonation
      </button>
    </div>
  );
};

export default ImpersonationBanner;
