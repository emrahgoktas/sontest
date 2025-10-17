import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { AnswerChoice } from '../../types';

/**
 * Cropping Popup Component
 * Shows cropped question image and allows selecting the correct answer only
 * Enhanced with mobile-responsive design and improved touch interactions
 */

interface CroppingPopupProps {
  isOpen: boolean;
  imageData: string;
  onSave: (correctAnswer: AnswerChoice) => void;
  onCancel: () => void;
}

export const CroppingPopup = ({
  isOpen,
  imageData,
  onSave,
  onCancel
}: CroppingPopupProps) => {
  const [correctAnswer, setCorrectAnswer] = useState<AnswerChoice>('A');

  // Available answer choices
  const allChoices: AnswerChoice[] = ['A', 'B', 'C', 'D', 'E'];

  /**
   * Handle save action
   */
  const handleSave = () => {
    onSave(correctAnswer);
  };

  /**
   * Handle cancel action
   */
  const handleCancel = () => {
    onCancel();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title="Doğru Cevabı Seçin"
      size="lg"
      closeOnOverlayClick={false}
      className="max-h-screen" // Ensure modal fits on mobile screens
    >
      <div className="space-y-4 sm:space-y-6">
        {/* Cropped image preview with mobile-responsive sizing */}
        <div className="text-center">
          <div className="inline-block border-2 border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm max-w-full">
            <img
              src={imageData}
              alt="Kırpılan soru"
              className="max-w-full max-h-48 sm:max-h-64 object-contain"
              style={{ 
                width: 'auto',
                height: 'auto',
                maxWidth: '100%'
              }}
            />
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-2">
            Kırpılan soru görseli (soru ve şıkları içerir)
          </p>
        </div>

        {/* Correct answer selection with mobile-optimized layout */}
        <div className="space-y-3 sm:space-y-4">
          <h4 className="font-medium text-gray-900 text-sm sm:text-base">Doğru Cevap</h4>
          <p className="text-xs sm:text-sm text-gray-600">
            Bu sorunun doğru cevabı hangi şık?
          </p>
          
          {/* Mobile-responsive answer choice grid */}
          <div className="grid grid-cols-5 gap-2 sm:gap-3">
            {allChoices.map(choice => (
              <button
                key={choice}
                onClick={() => setCorrectAnswer(choice)}
                className={`
                  relative p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 font-medium text-base sm:text-lg
                  touch-manipulation min-h-[48px] flex items-center justify-center
                  ${correctAnswer === choice
                    ? 'border-green-500 bg-green-50 text-green-700 shadow-md'
                    : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400 hover:bg-gray-50 active:bg-gray-100'
                  }
                `}
              >
                <span className="text-lg sm:text-xl">{choice}</span>
                {correctAnswer === choice && (
                  <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-green-500 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center">
                    <Check size={12} className="sm:w-3.5 sm:h-3.5" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Action buttons with mobile-responsive layout */}
        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={handleCancel}
            icon={X}
            fullWidth={true}
            className="sm:w-auto order-2 sm:order-1"
          >
            İptal
          </Button>
          <Button
            onClick={handleSave}
            icon={Check}
            fullWidth={true}
            className="sm:w-auto order-1 sm:order-2"
          >
            Soruyu Kaydet
          </Button>
        </div>
      </div>
    </Modal>
  );
};