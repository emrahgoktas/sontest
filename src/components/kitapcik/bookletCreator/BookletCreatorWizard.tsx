import React, { useState } from 'react';
import { StepHeader } from './StepHeader';
import { BookletSetup } from '../BookletSetup';
import { BookletArrangement } from '../BookletArrangement';
import { BookletPreview } from '../BookletPreview';
import { BookletGeneration } from '../BookletGeneration';
import { TestMetadata, CroppedQuestion } from '../../../types';
import { ThemeType } from '../../../types/themes';
import { BookletCreationState, BookletSet } from '../../../types/booklet';

/**
 * Booklet Creator Wizard Component
 * Main component that orchestrates the booklet creation flow
 */

interface BookletCreatorWizardProps {
  metadata: TestMetadata;
  questions: CroppedQuestion[];
  theme: ThemeType;
  onBack: () => void;
  onSave: (bookletSet: BookletSet) => void;
}

export const BookletCreatorWizard: React.FC<BookletCreatorWizardProps> = ({
  metadata,
  questions,
  theme,
  onBack,
  onSave
}) => {
  const [state, setState] = useState<BookletCreationState>({
    currentStep: 'setup',
    selectedVersions: ['A'],
    booklets: [],
    optikForms: [],
    isGenerating: false,
    error: null
  });

  /**
   * Adım değiştirme
   */
  const handleStepChange = (step: BookletCreationState['currentStep']) => {
    setState(prev => ({ ...prev, currentStep: step }));
  };

  /**
   * Kitapçık kurulumu tamamlandığında
   */
  const handleSetupComplete = (selectedVersions: string[], booklets: any[]) => {
    setState(prev => ({
      ...prev,
      selectedVersions: selectedVersions as any,
      booklets,
      currentStep: 'arrange'
    }));
  };

  /**
   * Soru düzenlemesi tamamlandığında
   */
  const handleArrangementComplete = (updatedBooklets: any[]) => {
    setState(prev => ({
      ...prev,
      booklets: updatedBooklets,
      currentStep: 'preview'
    }));
  };

  /**
   * Önizleme sonrası PDF oluşturma
   */
  const handleGenerateBooklets = () => {
    setState(prev => ({ ...prev, currentStep: 'generate' }));
  };

  /**
   * Kitapçık setini kaydetme
   */
  const handleSaveBookletSet = (bookletSet: BookletSet) => {
    onSave(bookletSet);
  };

  /**
   * Mevcut adımın bileşenini render etme
   */
  const renderCurrentStep = () => {
    switch (state.currentStep) {
      case 'setup':
        return (
          <BookletSetup
            questions={questions}
            onComplete={handleSetupComplete}
            onBack={onBack}
          />
        );

      case 'arrange':
        return (
          <BookletArrangement
            booklets={state.booklets}
            questions={questions}
            onComplete={handleArrangementComplete}
            onBack={() => handleStepChange('setup')}
          />
        );

      case 'preview':
        return (
          <BookletPreview
            booklets={state.booklets}
            metadata={metadata}
            theme={theme}
            onGenerate={handleGenerateBooklets}
            onBack={() => handleStepChange('arrange')}
          />
        );

      case 'generate':
        return (
          <BookletGeneration
            booklets={state.booklets}
            metadata={metadata}
            theme={theme}
            onSave={handleSaveBookletSet}
            onBack={() => handleStepChange('preview')}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <StepHeader currentStep={state.currentStep} />

      {/* Error Display */}
      {state.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{state.error}</p>
        </div>
      )}

      {/* Current Step Content */}
      <div className="bg-white border border-gray-200 rounded-xl min-h-[600px]">
        {renderCurrentStep()}
      </div>
    </div>
  );
};