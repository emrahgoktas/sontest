/**
 * Advanced Answer Form Component
 * 100-row answer sheet with yellow highlighting for answered questions
 */

import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../../ui/Button';
import { AnswerFormProps } from '../../../types/onlineExamScreen';

export const AdvancedAnswerForm: React.FC<AnswerFormProps> = React.memo(({
  questions,
  currentQuestionIndex,
  answers,
  onAnswerSelect,
  onQuestionNavigation,
  isCompleted
}) => {
  const [showAllQuestions, setShowAllQuestions] = React.useState(false);
  
  // Always display up to 100 questions in grid format
  const maxDisplayQuestions = 100;
  const displayQuestions = questions.slice(0, maxDisplayQuestions);
  const remainingQuestions = Math.max(0, questions.length - maxDisplayQuestions);

  console.log('AdvancedAnswerForm - questions:', questions?.length, 'answers:', Object.keys(answers).length);

  /**
   * Get answer for question
   */
  const getQuestionAnswer = (questionId: string): string | null => {
    const answer = answers[questionId];
    return answer ? String(answer.answer) : null;
  };

  /**
   * Check if question is answered
   */
  const isQuestionAnswered = (questionId: string): boolean => {
    return questionId in answers;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h3 className="font-medium text-gray-900 mb-4">Cevap Anahtarı</h3>
      
      <div className="space-y-1 max-h-[500px] overflow-y-auto">
        {displayQuestions.map((question, index) => {
          const isAnswered = isQuestionAnswered(question.id);
          const userAnswer = getQuestionAnswer(question.id);
          const isCurrent = index === currentQuestionIndex;
          
          return (
            <div
              key={question.id}
              className={`
                flex items-center justify-between p-1.5 rounded border text-xs transition-colors
                ${isCurrent 
                  ? 'border-blue-500 bg-blue-50' 
                  : isAnswered 
                  ? 'border-yellow-300 bg-yellow-200' 
                  : 'border-gray-200 bg-white hover:bg-gray-50'
                }
              `}
            >
              {/* Question Number */}
              <button
                onClick={() => onQuestionNavigation(index)}
                className="font-medium text-gray-700 w-6 text-left hover:text-blue-600 text-xs"
              >
                {index + 1})
              </button>
              
              {/* Answer Options */}
              <div className="flex space-x-1">
                {['A', 'B', 'C', 'D', 'E'].map(option => (
                  <button
                    key={option}
                    onClick={() => {
                      onAnswerSelect(question.id, option);
                      if (index !== currentQuestionIndex) {
                        onQuestionNavigation(index);
                      }
                    }}
                    disabled={isCompleted}
                    className={`
                      w-5 h-5 text-xs font-medium rounded border transition-colors
                      ${userAnswer === option
                        ? 'bg-green-500 text-white border-green-500'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                      }
                      ${isCompleted ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
        
        {/* Show More Questions Button */}
        {remainingQuestions > 0 && !showAllQuestions && (
          <div className="text-center py-4 border-t border-gray-200">
            <span className="text-sm text-gray-500 block mb-2">
              +{remainingQuestions} soru daha
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllQuestions(!showAllQuestions)}
              icon={showAllQuestions ? ChevronUp : ChevronDown}
              className="text-blue-600 hover:text-blue-700"
            >
              {showAllQuestions ? 'Daha Az Göster' : 'Tümünü Göster'}
            </Button>
          </div>
        )}
        
        {/* Show remaining questions if expanded */}
        {showAllQuestions && remainingQuestions > 0 && (
          <div className="border-t border-gray-200 pt-2">
            {questions.slice(maxDisplayQuestions).map((question, index) => {
              const actualIndex = maxDisplayQuestions + index;
              const isAnswered = isQuestionAnswered(question.id);
              const userAnswer = getQuestionAnswer(question.id);
              const isCurrent = actualIndex === currentQuestionIndex;
              
              return (
                <div key={question.id} className={`flex items-center justify-between p-1.5 rounded border text-xs transition-colors mb-1 ${
                  isCurrent ? 'border-blue-500 bg-blue-50' : 
                  isAnswered ? 'border-yellow-300 bg-yellow-200' : 
                  'border-gray-200 bg-white hover:bg-gray-50'
                }`}>
                  <button onClick={() => onQuestionNavigation(actualIndex)} className="font-medium text-gray-700 w-6 text-left hover:text-blue-600 text-xs">
                    {actualIndex + 1})
                  </button>
                  <div className="flex space-x-1">
                    {['A', 'B', 'C', 'D', 'E'].map(option => (
                      <button key={option} onClick={() => { onAnswerSelect(question.id, option); if (actualIndex !== currentQuestionIndex) onQuestionNavigation(actualIndex); }} disabled={isCompleted} className={`w-5 h-5 text-xs font-medium rounded border transition-colors ${userAnswer === option ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400 hover:bg-gray-50'} ${isCompleted ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Answer Form Stats */}
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
        
        <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${(Object.keys(answers).length / questions.length) * 100}%` 
            }}
          />
        </div>
        
        <div className="mt-2 text-center text-xs text-gray-500">
          %{Math.round((Object.keys(answers).length / questions.length) * 100)} tamamlandı
        </div>
      </div>
    </div>
  );
});

AdvancedAnswerForm.displayName = 'AdvancedAnswerForm';