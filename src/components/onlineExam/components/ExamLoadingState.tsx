/**
 * Exam Loading State Component
 * Loading screen for exam initialization
 */

import React from 'react';

export const ExamLoadingState: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Sınav Yükleniyor...</h2>
        <p className="text-gray-600">Lütfen bekleyin</p>
      </div>
    </div>
  );
};