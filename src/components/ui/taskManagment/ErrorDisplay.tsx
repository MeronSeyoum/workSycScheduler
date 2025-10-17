'use client';

import React from 'react';

interface ErrorDisplayProps {
  error: string | null;
  onDismiss: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onDismiss }) => {
  if (!error) return null;

  return (
    <div className="mb-6 bg-red-50 border-l-4 border-red-500 rounded-xl p-4 shadow-sm">
      <div className="flex justify-between items-start">
        <p className="text-red-800 font-medium">{error}</p>
        <button onClick={onDismiss} className="text-red-600 hover:text-red-800">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ErrorDisplay;