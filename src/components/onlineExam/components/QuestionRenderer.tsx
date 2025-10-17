/**
 * Question Renderer Component
 * Dynamically renders different question types
 */

import React, { useState, useCallback } from 'react';
import { Check, X } from 'lucide-react';
import { Question, MultipleChoiceQuestion, TrueFalseQuestion, FillBlankQuestion } from '../../../types/onlineExam';

interface QuestionRendererProps {
  question: Question;
  userAnswer?: string | boolean | string[];
  onAnswerSelect: (answer: string | boolean | string[]) => void;
  disabled?: boolean;
}

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  userAnswer,
  onAnswerSelect,
  disabled = false
}) => {
  const [fillBlankAnswers, setFillBlankAnswers] = useState<string[]>(
    Array.isArray(userAnswer) ? userAnswer : ['']
  );

  /**
   * Handle multiple choice selection
   */
  const handleMultipleChoiceSelect = useCallback((option: string) => {
    if (!disabled) {
      onAnswerSelect(option);
    }
  }, [disabled, onAnswerSelect]);

  /**
   * Handle true/false selection
   */
  const handleTrueFalseSelect = useCallback((value: boolean) => {
    if (!disabled) {
      onAnswerSelect(value);
    }
  }, [disabled, onAnswerSelect]);

  /**
   * Handle fill blank input
   */
  const handleFillBlankChange = useCallback((index: number, value: string) => {
    if (disabled) return;
    
    const newAnswers = [...fillBlankAnswers];
    newAnswers[index] = value;
    setFillBlankAnswers(newAnswers);
    onAnswerSelect(newAnswers);
  }, [disabled, fillBlankAnswers, onAnswerSelect]);

  /**
   * Render multiple choice question
   */
  const renderMultipleChoice = (q: MultipleChoiceQuestion) => {
    const options = Object.entries(q.options).filter(([_, value]) => value);
    
    return (
      <div className="space-y-4">
        <div className="prose max-w-none">
          <p className="text-lg text-gray-900 leading-relaxed">{q.text}</p>
        </div>
        
        <div className="space-y-3">
          {options.map(([key, value]) => (
            <label
              key={key}
              className={`
                flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                ${userAnswer === key
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <input
                type="radio"
                name={`question_${q.id}`}
                value={key}
                checked={userAnswer === key}
                onChange={() => handleMultipleChoiceSelect(key)}
                disabled={disabled}
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">{key})</span>
                  <span className="text-gray-900">{value}</span>
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>
    );
  };

  /**
   * Render true/false question
   */
  const renderTrueFalse = (q: TrueFalseQuestion) => {
    return (
      <div className="space-y-4">
        <div className="prose max-w-none">
          <p className="text-lg text-gray-900 leading-relaxed">{q.text}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <label
            className={`
              flex items-center justify-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
              ${userAnswer === true
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <input
              type="radio"
              name={`question_${q.id}`}
              checked={userAnswer === true}
              onChange={() => handleTrueFalseSelect(true)}
              disabled={disabled}
              className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
            />
            <Check className="w-5 h-5 text-green-600" />
            <span className="font-medium text-gray-900">Doğru</span>
          </label>
          
          <label
            className={`
              flex items-center justify-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
              ${userAnswer === false
                ? 'border-red-500 bg-red-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <input
              type="radio"
              name={`question_${q.id}`}
              checked={userAnswer === false}
              onChange={() => handleTrueFalseSelect(false)}
              disabled={disabled}
              className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
            />
            <X className="w-5 h-5 text-red-600" />
            <span className="font-medium text-gray-900">Yanlış</span>
          </label>
        </div>
      </div>
    );
  };

  /**
   * Render fill in the blank question
   */
  const renderFillBlank = (q: FillBlankQuestion) => {
    // Split question text by blanks (assuming _____ represents blanks)
    const parts = q.text.split('_____');
    const blankCount = parts.length - 1;
    
    // Ensure we have enough answer slots
    if (fillBlankAnswers.length < blankCount) {
      const newAnswers = [...fillBlankAnswers];
      while (newAnswers.length < blankCount) {
        newAnswers.push('');
      }
      setFillBlankAnswers(newAnswers);
    }

    return (
      <div className="space-y-4">
        <div className="prose max-w-none">
          <div className="text-lg text-gray-900 leading-relaxed">
            {parts.map((part, index) => (
              <React.Fragment key={index}>
                {part}
                {index < parts.length - 1 && (
                  <input
                    type="text"
                    value={fillBlankAnswers[index] || ''}
                    onChange={(e) => handleFillBlankChange(index, e.target.value)}
                    disabled={disabled}
                    className={`
                      inline-block mx-2 px-3 py-1 border-b-2 border-blue-500 bg-transparent
                      focus:outline-none focus:border-blue-600 min-w-32
                      ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    placeholder="Cevabınız"
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
        
        {!q.caseSensitive && (
          <p className="text-sm text-gray-500">
            💡 Bu soruda büyük/küçük harf duyarlılığı yoktur.
          </p>
        )}
      </div>
    );
  };

  /**
   * Render question based on type
   */
  const renderQuestion = () => {
    switch (question.type) {
      case 'multiple-choice':
        return renderMultipleChoice(question as MultipleChoiceQuestion);
      case 'true-false':
        return renderTrueFalse(question as TrueFalseQuestion);
      case 'fill-blank':
        return renderFillBlank(question as FillBlankQuestion);
      default:
        return <div className="text-red-600">Desteklenmeyen soru tipi</div>;
    }
  };

  return (
    <div className="space-y-6">
      {renderQuestion()}
    </div>
  );
};