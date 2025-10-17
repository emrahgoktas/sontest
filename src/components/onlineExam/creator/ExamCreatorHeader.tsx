import React from 'react';
import { Monitor } from 'lucide-react';

/**
 * Exam Creator Header Component
 * Displays the header section with title and description
 */

interface ExamCreatorHeaderProps {
  questionsCount: number;
}

export const ExamCreatorHeader: React.FC<ExamCreatorHeaderProps> = ({
  questionsCount
}) => {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="bg-green-600 rounded-lg p-2">
              <Monitor className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Online Sınav Oluşturucu</h1>
              <p className="text-sm text-gray-500">İnteraktif online sınavlar hazırlayın</p>
            </div>
          </div>
          
          {questionsCount > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              <span className="text-sm font-medium text-green-700">
                {questionsCount} soru hazır
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};