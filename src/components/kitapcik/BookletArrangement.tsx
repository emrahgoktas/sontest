import React, { useState } from 'react';
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
import { ArrowLeft, ArrowRight, Shuffle, RotateCcw } from 'lucide-react';
import { Button } from '../ui/Button';
import { SortableQuestionItem } from './SortableQuestionItem';
import { CroppedQuestion } from '../../types';
import { Booklet } from '../../types/booklet';

/**
 * Kitapçık Soru Düzenleme Bileşeni
 * Her kitapçık versiyonu için soruları sürükle-bırak ile düzenleme
 */

interface BookletArrangementProps {
  booklets: Booklet[];
  questions: CroppedQuestion[];
  onComplete: (updatedBooklets: Booklet[]) => void;
  onBack: () => void;
}

export const BookletArrangement: React.FC<BookletArrangementProps> = ({
  booklets,
  questions,
  onComplete,
  onBack
}) => {
  const [currentBookletIndex, setCurrentBookletIndex] = useState(0);
  const [updatedBooklets, setUpdatedBooklets] = useState<Booklet[]>(booklets);

  const currentBooklet = updatedBooklets[currentBookletIndex];

  // DnD Kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  /**
   * Sürükle-bırak işlemi tamamlandığında
   */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = currentBooklet.questions.findIndex(q => q.id === active.id);
      const newIndex = currentBooklet.questions.findIndex(q => q.id === over.id);

      const reorderedQuestions = arrayMove(currentBooklet.questions, oldIndex, newIndex);
      
      // Update order property for each question
      const updatedQuestions = reorderedQuestions.map((q, index) => ({
        ...q,
        order: index
      }));

      updateCurrentBooklet(updatedQuestions);
    }
  };

  /**
   * Mevcut kitapçığı güncelleme
   */
  const updateCurrentBooklet = (newQuestions: CroppedQuestion[]) => {
    const newBooklets = [...updatedBooklets];
    newBooklets[currentBookletIndex] = {
      ...currentBooklet,
      questions: newQuestions,
      updatedAt: new Date()
    };
    setUpdatedBooklets(newBooklets);
  };

  /**
   * Soruları karıştırma
   */
  const shuffleQuestions = () => {
    const shuffled = [...currentBooklet.questions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    const reorderedQuestions = shuffled.map((q, index) => ({
      ...q,
      order: index
    }));
    
    updateCurrentBooklet(reorderedQuestions);
  };

  /**
   * Orijinal sıraya döndürme
   */
  const resetToOriginal = () => {
    const originalQuestions = [...questions].map((q, index) => ({
      ...q,
      order: index
    }));
    updateCurrentBooklet(originalQuestions);
  };

  /**
   * Kitapçık değiştirme
   */
  const changeBooklet = (index: number) => {
    setCurrentBookletIndex(index);
  };

  /**
   * Düzenlemeyi tamamlama
   */
  const handleComplete = () => {
    onComplete(updatedBooklets);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Soru Düzenlemesi
        </h3>
        <p className="text-gray-600">
          Her kitapçık versiyonu için soruları istediğiniz sırada düzenleyin
        </p>
      </div>

      {/* Kitapçık Seçimi */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-gray-900">Kitapçık Seçimi</h4>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              icon={Shuffle}
              onClick={shuffleQuestions}
            >
              Karıştır
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={RotateCcw}
              onClick={resetToOriginal}
            >
              Sıfırla
            </Button>
          </div>
        </div>

        <div className="flex space-x-2">
          {updatedBooklets.map((booklet, index) => (
            <button
              key={booklet.id}
              onClick={() => changeBooklet(index)}
              className={`
                px-4 py-2 rounded-lg border-2 transition-all duration-200 font-medium
                ${currentBookletIndex === index
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
                }
              `}
            >
              Kitapçık {booklet.version}
            </button>
          ))}
        </div>
      </div>

      {/* Soru Listesi */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-gray-900">
            Kitapçık {currentBooklet.version} - Sorular ({currentBooklet.questions.length})
          </h4>
          <div className="text-sm text-gray-500">
            Soruları sürükleyerek sıralayın
          </div>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={currentBooklet.questions.map(q => q.id)} 
              strategy={verticalListSortingStrategy}
            >
              {currentBooklet.questions.map((question, index) => (
                <SortableQuestionItem
                  key={question.id}
                  question={question}
                  index={index}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </div>

      {/* Kitapçık Özeti */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Kitapçık Özeti</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {updatedBooklets.map(booklet => (
            <div key={booklet.id} className="text-center">
              <div className="text-lg font-bold text-blue-600">
                {booklet.version}
              </div>
              <div className="text-sm text-gray-600">
                {booklet.questions.length} soru
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-6 border-t border-gray-200">
        <Button
          variant="outline"
          onClick={onBack}
          icon={ArrowLeft}
        >
          Geri
        </Button>
        
        <Button
          onClick={handleComplete}
          icon={ArrowRight}
          iconPosition="right"
        >
          Önizlemeye Geç
        </Button>
      </div>
    </div>
  );
};