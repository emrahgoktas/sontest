/**
 * Exam Navigation Component
 * Question navigation grid with status indicators
 */

import React from 'react';
import { CheckCircle, Circle, AlertCircle } from 'lucide-react';
import { Question, ExamAnswer } from '../../../types/onlineExam';

interface ExamNavigationProps {
  questions: Question[];
  currentQuestionIndex: number;
  answers: Record<string, ExamAnswer>;
  onQuestionSelect: (index: number) => void;
}

export const ExamNavigation: React.FC<ExamNavigationProps> = ({
  questions,
  currentQuestionIndex,
  answers,
  onQuestionSelect
}) => {
  /**
   * Get question status
   */
  const getQuestionStatus = (question: Question, index: number) => {
    const isAnswered = question.id in answers;
    const isCurrent = index === currentQuestionIndex;
    
    if (isCurrent) {
      return {
        icon: AlertCircle,
        className: 'bg-blue-500 text-white border-blue-500',
        label: 'Mevcut'
      };
    }
    
    if (isAnswered) {
      return {
        icon: CheckCircle,
        className: 'bg-green-50 text-green-700 border-green-300',
        label: 'Cevaplanmış'
      };
    }
    
    return {
      icon: Circle,
      className: 'bg-white text-gray-600 border-gray-300 hover:border-gray-400',
      label: 'Cevaplanmamış'
    };
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h3 className="font-medium text-gray-900 mb-4">Soru Navigasyonu</h3>
      
      {/* Question Grid */}
      <div className="grid grid-cols-5 gap-2 mb-4">
        {questions.map((question, index) => {
          const status = getQuestionStatus(question, index);
          const Icon = status.icon;
          
          return (
            <button
              key={question.id}
              onClick={() => onQuestionSelect(index)}
              className={`
                relative w-10 h-10 rounded-lg border-2 text-sm font-medium transition-all duration-200
                flex items-center justify-center
                ${status.className}
              `}
              title={`Soru ${index + 1} - ${status.label}`}
            >
              {index < 9 ? (
                <span>{index + 1}</span>
              ) : (
                <Icon size={16} />
              )}
            </button>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="space-y-2 text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-50 border border-green-300 rounded"></div>
          <span className="text-gray-600">Cevaplanmış</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-white border border-gray-300 rounded"></div>
          <span className="text-gray-600">Cevaplanmamış</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-500 border border-blue-500 rounded"></div>
          <span className="text-gray-600">Mevcut soru</span>
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center">
            <div className="text-lg font-semibold text-green-600">
              {Object.keys(answers).length}
            </div>
            <div className="text-gray-600">Cevaplanmış</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-600">
              {questions.length - Object.keys(answers).length}
            </div>
            <div className="text-gray-600">Kalan</div>
          </div>
        </div>
      </div>
    </div>
  );
};