'use client';

import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teal-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading Shift Task Completion...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;