import React from 'react';
import { NavigationControls } from '../navigation/NavigationControls';
import { useNavigation } from '../../contexts/NavigationContext';
import { BookletCreatorWizard } from './bookletCreator/BookletCreatorWizard';
import { TestMetadata, CroppedQuestion } from '../../types';
import { ThemeType } from '../../types/themes';
import { BookletSet } from '../../types/booklet';

/**
 * Enhanced Booklet Creator with Navigation
 */
interface BookletCreatorProps {
  metadata: TestMetadata;
  questions: CroppedQuestion[];
  theme: ThemeType;
  onBack: () => void;
  onSave: (bookletSet: BookletSet) => void;
}

export const BookletCreator: React.FC<BookletCreatorProps> = ({
  metadata,
  questions,
  theme,
  onBack,
  onSave
}) => {
  const { navigateToStep } = useNavigation();

  /**
   * Handle navigation back to test generator
   */
  const handleNavigationBack = () => {
    navigateToStep('generate');
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Navigation Controls */}
      <NavigationControls
        onPrevious={handleNavigationBack}
        previousLabel="Test Oluşturucuya Dön"
        showModuleNavigation={true}
        className="bg-white border border-gray-200 rounded-lg p-4"
      />

      {/* Booklet Creator Wizard */}
      <BookletCreatorWizard
        metadata={metadata}
        questions={questions}
        theme={theme}
        onBack={handleNavigationBack}
        onSave={onSave}
      />
    </div>
  );
};

// Default export for easier imports
export default BookletCreatorWizard;