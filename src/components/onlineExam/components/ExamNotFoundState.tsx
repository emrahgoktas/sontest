/**
 * Exam Not Found State Component
 * State when exam data cannot be loaded
 */

import React from 'react';
import { Monitor } from 'lucide-react';
import { Button } from '../../ui/Button';

interface ExamNotFoundStateProps {
  onReturnHome: () => void;
}

export const ExamNotFoundState: React.FC<ExamNotFoundStateProps> = ({
  onReturnHome
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Monitor className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Sınav Bulunamadı</h2>
        <p className="text-gray-600 mb-4">Sınav bilgileri yüklenemedi</p>
        <Button onClick={onReturnHome} variant="outline">
          Ana Sayfaya Dön
        </Button>
      </div>
    </div>
  );
};