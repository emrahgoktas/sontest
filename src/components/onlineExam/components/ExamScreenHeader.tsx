/**
 * Exam Screen Header Component
 * Header with exam title, timer, and exit button
 */

import React from 'react';
import { LogOut } from 'lucide-react';
import { Button } from '../../ui/Button';
import { ExamTimer } from './ExamTimer';
import { ExamHeaderProps } from '../../../types/onlineExamScreen';

export const ExamScreenHeader: React.FC<ExamHeaderProps> = ({
  examTitle,
  currentQuestionIndex,
  totalQuestions,
  timeRemaining,
  timeLimit,
  onExitExam
}) => {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Exam Info */}
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-gray-900 truncate">
              {examTitle}
            </h1>
            <p className="text-sm text-gray-500">
              Soru {currentQuestionIndex + 1} / {totalQuestions}
            </p>
          </div>
          
          {/* Timer */}
          {timeLimit > 0 && (
            <div className="flex-shrink-0 mx-4">
              <ExamTimer
                timeRemaining={timeRemaining}
                totalTime={timeLimit * 60}
              />
            </div>
          )}
          
          {/* Exit Button */}
          <div className="flex-shrink-0">
            <Button
              variant="outline"
              onClick={onExitExam}
              icon={LogOut}
              size="sm"
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              Çıkış
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};