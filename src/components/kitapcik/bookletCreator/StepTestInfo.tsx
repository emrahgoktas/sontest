import React from 'react';

/**
 * Step Test Info Component
 * Displays test information like name, description, etc.
 */

interface StepTestInfoProps {
  metadata: any;
  questions: any[];
  theme: string;
}

export const StepTestInfo: React.FC<StepTestInfoProps> = ({
  metadata,
  questions,
  theme
}) => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h4 className="font-medium text-blue-900 mb-2">Test Bilgileri</h4>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-blue-800">
        <div><strong>Test Adı:</strong> {metadata.testName || 'Test'}</div>
        <div><strong>Ders:</strong> {metadata.courseName || '-'}</div>
        <div><strong>Soru Sayısı:</strong> {questions.length}</div>
        <div><strong>Tema:</strong> {theme}</div>
      </div>
    </div>
  );
};