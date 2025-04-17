import React, { Component, ErrorInfo, ReactNode } from 'react';
import { handleSessionExpired } from '../utils/authUtils';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary component that catches authentication errors and provides recovery options
 */
class SessionErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error
    console.error('Session error boundary caught error:', error);
    console.error('Error info:', errorInfo);
  }

  // Handle resetting the error state
  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  // Handle logging out and redirecting to sign in
  handleSignOut = (): void => {
    handleSessionExpired();
  };

  // Check if the error is authentication related
  isAuthError = (): boolean => {
    const { error } = this.state;
    if (!error) return false;

    // Look for common auth error messages
    const authErrorPatterns = [
      /session (has )?expired/i,
      /not authorized/i,
      /authentication (error|failed)/i,
      /invalid token/i,
      /unauthorized/i,
      /forbidden/i,
      /login (required|needed)/i,
    ];

    return authErrorPatterns.some(pattern => pattern.test(error.message));
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // If it's an auth error, show special UI
      if (this.isAuthError()) {
        return (
          <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
              <div className="text-center">
                <svg
                  className="mx-auto h-12 w-12 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <h2 className="mt-2 text-xl font-bold text-gray-900">Session Error</h2>
                <p className="mt-1 text-gray-500">
                  Your session has expired or you're not authorized to access this page.
                </p>
                {this.state.error && (
                  <p className="mt-2 text-sm text-red-600">
                    {this.state.error.message}
                  </p>
                )}
              </div>
              <div className="mt-5 sm:mt-6 grid grid-cols-2 gap-3">
                <button
                  onClick={this.handleReset}
                  className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Try Again
                </button>
                <button
                  onClick={this.handleSignOut}
                  className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Sign In Again
                </button>
              </div>
            </div>
          </div>
        );
      }

      // For other errors, show generic error UI
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h2 className="mt-2 text-xl font-bold text-gray-900">Something went wrong</h2>
              <p className="mt-1 text-gray-500">
                We encountered an error while rendering the page.
              </p>
              {this.state.error && (
                <p className="mt-2 text-sm text-red-600">
                  {this.state.error.message}
                </p>
              )}
            </div>
            <div className="mt-5 sm:mt-6">
              <button
                onClick={this.handleReset}
                className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    // No error, render children normally
    return this.props.children;
  }
}

export default SessionErrorBoundary;
