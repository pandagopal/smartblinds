import React, { useState, useEffect } from 'react';
import { dbService } from '../services/db';

interface DatabaseStatusIndicatorProps {
  position?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left';
}

const DatabaseStatusIndicator: React.FC<DatabaseStatusIndicatorProps> = ({
  position = 'bottom-right'
}) => {
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [showDetails, setShowDetails] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  // Position class mapping
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'bottom-right': 'bottom-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-left': 'bottom-4 left-4'
  };

  // Check database connection on component mount and periodically
  useEffect(() => {
    const checkConnection = async () => {
      try {
        setStatus('checking');
        const isConnected = await dbService.checkConnection();
        setStatus(isConnected ? 'connected' : 'disconnected');
        setLastChecked(new Date());
      } catch (error) {
        console.error('Error checking database connection:', error);
        setStatus('disconnected');
        setLastChecked(new Date());
      }
    };

    // Check connection immediately
    checkConnection();

    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000);

    return () => clearInterval(interval);
  }, []);

  // Status colors and labels
  const statusConfig = {
    connected: {
      bgColor: 'bg-green-500',
      text: 'Connected',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )
    },
    disconnected: {
      bgColor: 'bg-red-500',
      text: 'Disconnected',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )
    },
    checking: {
      bgColor: 'bg-yellow-500',
      text: 'Checking...',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      )
    }
  };

  const currentStatus = statusConfig[status];

  const handleRetryConnection = () => {
    dbService.checkConnection()
      .then(isConnected => {
        setStatus(isConnected ? 'connected' : 'disconnected');
        setLastChecked(new Date());
      })
      .catch(error => {
        console.error('Error checking database connection:', error);
        setStatus('disconnected');
        setLastChecked(new Date());
      });
  };

  if (process.env.NODE_ENV === 'production' && status === 'connected') {
    return null; // Don't show indicator in production when connected
  }

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      <div
        className={`${currentStatus.bgColor} text-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 ease-in-out ${
          showDetails ? 'w-64' : 'w-auto'
        }`}
      >
        {/* Status indicator button */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex items-center justify-between p-2 text-sm"
        >
          <div className="flex items-center">
            {currentStatus.icon}
            <span>{currentStatus.text}</span>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 transition-transform duration-300 ${showDetails ? 'transform rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Details panel */}
        {showDetails && (
          <div className="bg-white text-gray-800 p-3 text-xs">
            <div className="mb-2">
              <p className="font-semibold">Database: PostgreSQL</p>
              <p>Status: {currentStatus.text}</p>
              <p>Last checked: {lastChecked ? lastChecked.toLocaleTimeString() : 'N/A'}</p>
            </div>
            <div className="flex justify-between">
              <button
                onClick={handleRetryConnection}
                className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs"
              >
                Check Now
              </button>
              {status === 'disconnected' && (
                <button
                  onClick={() => window.location.reload()}
                  className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
                >
                  Reload Page
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DatabaseStatusIndicator;
