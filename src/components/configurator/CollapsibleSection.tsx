import React, { useState, ReactNode } from 'react';

interface CollapsibleSectionProps {
  title: string;
  initiallyExpanded?: boolean;
  children: ReactNode;
  badge?: string;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  initiallyExpanded = true,
  children,
  badge
}) => {
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded);

  return (
    <div className="border border-gray-200 rounded-md mb-4 overflow-hidden">
      <button
        className="w-full px-4 py-3 flex items-center justify-between text-left bg-white hover:bg-gray-50 focus:outline-none"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <div className="flex items-center">
          <h3 className="text-base font-medium">{title}</h3>
          {badge && (
            <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
              {badge}
            </span>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isExpanded ? 'transform rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="p-4 border-t border-gray-200 bg-white">
          {children}
        </div>
      </div>
    </div>
  );
};

export default CollapsibleSection;
