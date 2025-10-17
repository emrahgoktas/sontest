/**
 * Exam Screen Footer Component
 * Navigation controls and submit button
 */

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../../ui/Button';
import { ExamFooterProps } from '../../../types/onlineExamScreen';

export const ExamScreenFooter: React.FC<ExamFooterProps> = ({
  currentQuestionIndex,
  totalQuestions,
  isSubmitting,
  onPrevious,
  onNext,
  onSubmitExam
}) => {
  return (
    <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={currentQuestionIndex === 0}
        icon={ChevronLeft}
      >
        Önceki
      </Button>

      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-600">
          {currentQuestionIndex + 1} / {totalQuestions}
        </span>
        
        {currentQuestionIndex === totalQuestions - 1 ? (
          <Button
            onClick={onSubmitExam}
            disabled={isSubmitting}
            isLoading={isSubmitting}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? 'Gönderiliyor...' : 'Sınavı Bitir'}
          </Button>
        ) : (
          <Button
            onClick={onNext}
            disabled={currentQuestionIndex === totalQuestions - 1}
            icon={ChevronRight}
            iconPosition="right"
          >
            Sonraki
          </Button>
        )}
      </div>
    </div>
  );
};