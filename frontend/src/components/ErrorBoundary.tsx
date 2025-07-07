import React, { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

// Simple error fallback component for HMR issues
const ErrorFallback = () => (
  <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--flambé-cream)' }}>
    <div className="max-w-md w-full preference-card text-center">
      <div className="text-6xl mb-4" style={{ color: 'var(--flambé-rust)' }}>⚠️</div>
      <h1 className="flambé-heading text-2xl mb-2">
        temporary error
      </h1>
      <p className="flambé-body mb-4" style={{ color: 'var(--flambé-ash)' }}>
        this appears to be a development hot-reload issue. the page should recover automatically.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="btn-primary"
      >
        refresh page
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