import React from 'react';
import { ArrowLeft, ArrowRight, Home, Settings } from 'lucide-react';
import { Button } from '../ui/Button';
import { useNavigation } from '../../contexts/NavigationContext';

/**
 * Navigation Controls Component
 * Provides universal navigation controls for steps and modules
 */

interface NavigationControlsProps {
  onNext?: () => void;
  onPrevious?: () => void;
  nextLabel?: string;
  previousLabel?: string;
  showModuleNavigation?: boolean;
  className?: string;
}

export const NavigationControls: React.FC<NavigationControlsProps> = ({
  onNext,
  onPrevious,
  nextLabel = 'İleri',
  previousLabel = 'Geri',
  showModuleNavigation = true,
  className = ''
}) => {
  const { navigationState, goBack, navigateToModule } = useNavigation();

  /**
   * Handle back navigation
   */
  const handleBack = () => {
    if (onPrevious) {
      onPrevious();
    } else if (navigationState.canGoBack) {
      goBack();
    }
  };

  /**
   * Handle next navigation
   */
  const handleNext = () => {
    if (onNext) {
      onNext();
    }
  };

  /**
   * Navigate to main module
   */
  const handleGoToMain = () => {
    navigateToModule('main', 'upload');
  };

  /**
   * Navigate to question editor
   */
  const handleGoToQuestionEditor = () => {
    navigateToModule('question-editor');
  };

  return (
    <div className={`flex items-center justify-between ${className}`}>
      {/* Left side - Back navigation */}
      <div className="flex items-center space-x-3">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={!navigationState.canGoBack && !onPrevious}
          icon={ArrowLeft}
        >
          {previousLabel}
        </Button>

        {/* Module navigation shortcuts */}
        {showModuleNavigation && navigationState.currentModule !== 'main' && (
          <Button
            variant="ghost"
            onClick={handleGoToMain}
            icon={Home}
            size="sm"
          >
            Ana Sayfa
          </Button>
        )}
      </div>

      {/* Center - Current location indicator */}
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <span className="capitalize">{navigationState.currentModule}</span>
        <span>•</span>
        <span className="capitalize">{navigationState.currentStep}</span>
      </div>

      {/* Right side - Forward navigation and module switches */}
      <div className="flex items-center space-x-3">
        {/* Module navigation shortcuts */}
        {showModuleNavigation && navigationState.currentModule !== 'question-editor' && (
          <Button
            variant="ghost"
            onClick={handleGoToQuestionEditor}
            icon={Settings}
            size="sm"
          >
            Soru Editörü
          </Button>
        )}

        {onNext && (
          <Button
            onClick={handleNext}
            icon={ArrowRight}
            iconPosition="right"
          >
            {nextLabel}
          </Button>
        )}
      </div>
    </div>
  );
};