import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import {
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ArrowLeft, ArrowRight, List } from 'lucide-react';
import { Button } from '../ui/Button';
import { QuestionCard } from './QuestionCard';
import { CroppedQuestion } from '../../types';

/**
 * Sortable Question Card Wrapper
 */
interface SortableQuestionCardProps {
  question: CroppedQuestion;
  index: number;
  onEdit: (question: CroppedQuestion) => void;
  onDelete: (questionId: string) => void;
}

const SortableQuestionCard: React.FC<SortableQuestionCardProps> = ({
  question,
  index,
  onEdit,
  onDelete
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
      {...attributes}
      {...listeners}
    >
      <QuestionCard
        question={question}
        index={index}
        onEdit={onEdit}
        onDelete={onDelete}
        isDragging={isDragging}
      />
    </div>
  );
};

/**
 * Questions List Component
 * Displays all cropped questions with drag & drop reordering
 */
interface QuestionsListProps {
  questions: CroppedQuestion[];
  onQuestionsReorder: (questions: CroppedQuestion[]) => void;
  onQuestionEdit: (question: CroppedQuestion) => void;
  onQuestionDelete: (questionId: string) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export const QuestionsList: React.FC<QuestionsListProps> = ({
  questions,
  onQuestionsReorder,
  onQuestionEdit,
  onQuestionDelete,
  onNext,
  onPrevious
}) => {
  // DnD Kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  /**
   * Handle drag end event
   */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = questions.findIndex(q => q.id === active.id);
      const newIndex = questions.findIndex(q => q.id === over.id);

      const reorderedQuestions = arrayMove(questions, oldIndex, newIndex);
      
      // Update order property for each question
      const updatedQuestions = reorderedQuestions.map((q, index) => ({
        ...q,
        order: index
      }));

      onQuestionsReorder(updatedQuestions);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Kırpılan Sorular</h2>
          <p className="text-gray-600">
            Soruları düzenleyin, sıralayın ve test oluşturmaya hazırlanın
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
            <div className="flex items-center space-x-2 text-blue-700">
              <List size={16} />
              <span className="text-sm font-medium">
                {questions.length} Soru
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      {questions.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-900 mb-2">Soru Yönetimi</h4>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• Soruları sürükleyerek sıralamayı değiştirebilirsiniz</li>
            <li>• Düzenle butonuyla şıkları ve doğru cevabı güncelleyebilirsiniz</li>
            <li>• Çöp tenekesi butonuyla istediğiniz soruyu silebilirsiniz</li>
            <li>• Test oluşturmak için en az 1 soru olmalıdır</li>
          </ul>
        </div>
      )}

      {/* Questions list */}
      {questions.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <List className="text-gray-400" size={24} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Henüz soru kırpılmamış
          </h3>
          <p className="text-gray-600 mb-4">
            PDF'den soru kırpmak için önceki adıma dönün
          </p>
          <Button
            variant="outline"
            onClick={onPrevious}
            icon={ArrowLeft}
          >
            Soru Kırpma Ekranına Dön
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={questions.map(q => q.id)} 
              strategy={verticalListSortingStrategy}
            >
              {questions.map((question, index) => (
                <SortableQuestionCard
                  key={question.id}
                  question={question}
                  index={index}
                  onEdit={onQuestionEdit}
                  onDelete={onQuestionDelete}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex justify-between pt-6 border-t border-gray-200">
        <Button
          variant="outline"
          onClick={onPrevious}
          icon={ArrowLeft}
        >
          Geri
        </Button>
        
        <Button
          onClick={onNext}
          disabled={questions.length === 0}
          icon={ArrowRight}
          iconPosition="right"
        >
          Test Oluştur ({questions.length} soru)
        </Button>
      </div>
    </div>
  );
};