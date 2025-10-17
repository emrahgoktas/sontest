import React, { useState } from 'react';
import { Edit2, Trash2, GripVertical, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { CroppedQuestion, AnswerChoice } from '../../types';

/**
 * Question Card Component
 * Displays individual cropped question with editing capabilities
 */

interface QuestionCardProps {
  question: CroppedQuestion;
  index: number;
  onEdit: (question: CroppedQuestion) => void;
  onDelete: (questionId: string) => void;
  isDragging?: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  index,
  onEdit,
  onDelete,
  isDragging = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedCorrectAnswer, setEditedCorrectAnswer] = useState<AnswerChoice>(question.correctAnswer);

  // Available answer choices
  const allChoices: AnswerChoice[] = ['A', 'B', 'C', 'D', 'E'];

  /**
   * Save changes
   */
  const handleSave = () => {
    const updatedQuestion: CroppedQuestion = {
      ...question,
      correctAnswer: editedCorrectAnswer
    };

    onEdit(updatedQuestion);
    setIsEditing(false);
  };

  /**
   * Cancel editing
   */
  const handleCancel = () => {
    setEditedCorrectAnswer(question.correctAnswer);
    setIsEditing(false);
  };

  /**
   * Confirm deletion
   */
  const handleDelete = () => {
    if (window.confirm('Bu soruyu silmek istediğinizden emin misiniz?')) {
      onDelete(question.id);
    }
  };

  return (
    <div className={`
      bg-white rounded-lg border-2 transition-all duration-200 overflow-hidden
      ${isDragging 
        ? 'border-blue-400 shadow-lg scale-105' 
        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
      }
    `}>
      {/* Card Header */}
      <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="cursor-grab active:cursor-grabbing text-gray-400">
            <GripVertical size={20} />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">
              Soru {index + 1}
            </h4>
            <p className="text-sm text-gray-500">
              Doğru Cevap: {question.correctAnswer}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            icon={Edit2}
            onClick={() => setIsEditing(true)}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={Trash2}
            onClick={handleDelete}
            className="text-red-600 hover:text-red-700"
          />
        </div>
      </div>

      {/* Question Image */}
      <div className="p-4">
        <div className="bg-gray-100 rounded-lg p-2 text-center">
          <img
            src={question.imageData}
            alt={`Soru ${index + 1}`}
            className="max-w-full max-h-40 object-contain mx-auto rounded"
          />
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Soru ve şıkları içeren görsel
        </p>
      </div>

      {/* Editing Mode */}
      {isEditing && (
        <div className="border-t border-gray-200 p-4 bg-blue-50">
          <div className="space-y-4">
            {/* Correct answer selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Doğru Cevap
              </label>
              <div className="grid grid-cols-5 gap-2">
                {allChoices.map(choice => (
                  <button
                    key={choice}
                    onClick={() => setEditedCorrectAnswer(choice)}
                    className={`
                      px-3 py-2 rounded border transition-colors text-sm font-medium
                      ${editedCorrectAnswer === choice
                        ? 'border-green-500 bg-green-100 text-green-700'
                        : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
                      }
                    `}
                  >
                    {choice}
                    {editedCorrectAnswer === choice && (
                      <Check size={14} className="inline ml-1" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-end space-x-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
              >
                İptal
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
              >
                Kaydet
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};