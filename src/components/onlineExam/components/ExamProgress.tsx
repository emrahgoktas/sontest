/**
 * Exam Progress Component
 * Shows overall exam progress and statistics
 */

import React from 'react';
import { CheckCircle, Circle, Clock } from 'lucide-react';
import { ExamProgress as ExamProgressType } from '../../../types/onlineExam';
import { ExamTimer } from './ExamTimer';

interface ExamProgressProps {
  progress: ExamProgressType;
  timeRemaining: number;
  totalTime: number;
}

export const ExamProgress: React.FC<ExamProgressProps> = ({
  progress,
  timeRemaining,
  totalTime
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-4">
      <h3 className="font-medium text-gray-900">Sınav İlerlemesi</h3>
      
      {/* Timer */}
      <ExamTimer
        timeRemaining={timeRemaining}
        totalTime={totalTime}
      />
      
      {/* Progress Stats */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">İlerleme:</span>
          <span className="font-medium text-gray-900">
            {progress.currentQuestion} / {progress.totalQuestions}
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(progress.currentQuestion / progress.totalQuestions) * 100}%` }}
          />
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-1">
            <CheckCircle size={16} className="text-green-600" />
            <span className="text-gray-600">Cevaplanmış:</span>
            <span className="font-medium text-green-600">{progress.answeredQuestions}</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Circle size={16} className="text-gray-400" />
            <span className="text-gray-600">Kalan:</span>
            <span className="font-medium text-gray-900">
              {progress.totalQuestions - progress.answeredQuestions}
            </span>
          </div>
        </div>
        
        <div className="pt-2 border-t border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {progress.percentage}%
            </div>
            <div className="text-xs text-gray-500">Tamamlandı</div>
          </div>
        </div>
      </div>
    </div>
  );
};