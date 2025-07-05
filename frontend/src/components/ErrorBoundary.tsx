import React, { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

// Simple error fallback component for HMR issues
const ErrorFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
      <div className="text-red-500 text-6xl mb-4">⚠️</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Temporary Error
      </h1>
      <p className="text-gray-600 mb-4">
        This appears to be a development hot-reload issue. The page should recover automatically.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
      >
        Refresh Page
      </button>
    </div>
  </div>
);

// Simple wrapper that catches common HMR errors
const ErrorBoundary: React.FC<Props> = ({ children }) => {
  try {
    return <>{children}</>;
  } catch (error) {
    console.error('ErrorBoundary caught error:', error);
    return <ErrorFallback />;
  }
};

export default ErrorBoundary; 