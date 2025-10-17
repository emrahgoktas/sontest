import React from 'react';

/**
 * Step Source Selection Component
 * Allows users to select the source of questions
 */

interface StepSourceSelectionProps {
  // Add props as needed
}

export const StepSourceSelection: React.FC<StepSourceSelectionProps> = ({
  // Add props as needed
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h4 className="font-medium text-gray-900 mb-4">Soru Kaynağı Seçimi</h4>
      
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <input
            type="radio"
            id="source-current"
            name="question-source"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            defaultChecked
          />
          <label htmlFor="source-current" className="text-sm text-gray-700">
            Mevcut test sorularını kullan
          </label>
        </div>
        
        <div className="flex items-center space-x-3">
          <input
            type="radio"
            id="source-archive"
            name="question-source"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            disabled
          />
          <label htmlFor="source-archive" className="text-sm text-gray-400">
            Arşivden soru seç (Yakında)
          </label>
        </div>
        
        <div className="flex items-center space-x-3">
          <input
            type="radio"
            id="source-pdf"
            name="question-source"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            disabled
          />
          <label htmlFor="source-pdf" className="text-sm text-gray-400">
            Yeni PDF yükle (Yakında)
          </label>
        </div>
      </div>
    </div>
  );
};