/**
 * Completion Prompt Component
 * Prompt shown when all questions are answered
 */

import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Button } from '../../ui/Button';

interface CompletionPromptProps {
  isSubmitting: boolean;
  onSubmitExam: () => void;
}

export const CompletionPrompt: React.FC<CompletionPromptProps> = ({
  isSubmitting,
  onSubmitExam
}) => {
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <div className="text-center">
        <CheckCircle className="mx-auto h-8 w-8 text-green-600 mb-2" />
        <h4 className="font-medium text-green-900 mb-2">
          Tüm Sorular Cevaplanmış!
        </h4>
        <p className="text-sm text-green-800 mb-4">
          Sınavınızı tamamlamaya hazırsınız
        </p>
        <Button
          onClick={onSubmitExam}
          disabled={isSubmitting}
          isLoading={isSubmitting}
          size="lg"
          fullWidth
          className="bg-green-600 hover:bg-green-700"
        >
          {isSubmitting ? 'Gönderiliyor...' : 'Sınavı Tamamla'}
        </Button>
      </div>
    </div>
  );
};