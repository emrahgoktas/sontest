/**
 * Exam Error State Component
 * Error screen for exam loading failures
 */

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '../../ui/Button';

interface ExamErrorStateProps {
  error: string;
  onReturnHome: () => void;
}

export const ExamErrorState: React.FC<ExamErrorStateProps> = ({
  error,
  onReturnHome
}) => {
  /**
   * Format error message for better display
   */
  const formatErrorMessage = (errorText: string): { title: string; message: string; type: 'warning' | 'error' } => {
    if (errorText.includes('başlamamış')) {
      return {
        title: 'Sınav Henüz Başlamamış',
        message: errorText,
        type: 'warning'
      };
    }
    
    if (errorText.includes('dolmuş')) {
      return {
        title: 'Sınav Süresi Dolmuş',
        message: errorText,
        type: 'warning'
      };
    }
    
    if (errorText.includes('aktifleştirilmemiş')) {
      return {
        title: 'Sınav Aktif Değil',
        message: errorText,
        type: 'warning'
      };
    }
    
    return {
      title: 'Hata Oluştu',
      message: errorText,
      type: 'error'
    };
  };
  
  const { title, message, type } = formatErrorMessage(error);
  const isWarning = type === 'warning';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-lg mx-4">
        <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6 ${
          isWarning ? 'bg-yellow-100' : 'bg-red-100'
        }`}>
          <AlertCircle className={`w-8 h-8 ${
            isWarning ? 'text-yellow-600' : 'text-red-600'
          }`} />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
        
        <div className={`p-4 rounded-lg border mb-6 ${
          isWarning 
            ? 'bg-yellow-50 border-yellow-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <p className={`text-sm whitespace-pre-line ${
            isWarning ? 'text-yellow-800' : 'text-red-800'
          }`}>
            {message}
          </p>
        </div>
        
        <div className="space-y-3">
          <Button 
            onClick={onReturnHome} 
            variant="outline"
            size="lg"
            className="w-full"
          >
            Ana Sayfaya Dön
          </Button>
          
          {isWarning && (
            <Button 
              onClick={() => window.location.reload()} 
              variant="ghost"
              size="sm"
              className="w-full"
            >
              Sayfayı Yenile
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};