import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { CroppedQuestion } from '../../types';

/**
 * Sürüklenebilir Soru Öğesi
 * Kitapçık düzenlemesi için sürükle-bırak destekli soru kartı
 */

interface SortableQuestionItemProps {
  question: CroppedQuestion;
  index: number;
}

export const SortableQuestionItem: React.FC<SortableQuestionItemProps> = ({
  question,
  index
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        bg-white border rounded-lg p-3 transition-all duration-200
        ${isDragging 
          ? 'border-blue-400 shadow-lg scale-105 z-10' 
          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
        }
      `}
    >
      <div className="flex items-center space-x-3">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
        >
          <GripVertical size={20} />
        </div>

        {/* Question Number */}
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-blue-600">
              {index + 1}
            </span>
          </div>
        </div>

        {/* Question Preview */}
        <div className="flex-1 flex items-center space-x-3">
          <div className="flex-shrink-0">
            <img
              src={question.imageData}
              alt={`Soru ${index + 1}`}
              className="w-16 h-12 object-contain bg-gray-50 rounded border"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate">
              Soru {index + 1}
            </div>
            <div className="text-xs text-gray-500">
              Doğru Cevap: {question.correctAnswer}
            </div>
          </div>
        </div>

        {/* Question Info */}
        <div className="flex-shrink-0 text-right">
          <div className="text-xs text-gray-500">
            {question.actualWidth}×{question.actualHeight}px
          </div>
        </div>
      </div>
    </div>
  );
};