import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '../../ui/Button';

/**
 * Footer Actions Component
 * Provides navigation buttons at the bottom of the screen
 */

interface FooterActionsProps {
  questionsCount: number;
  onPrevious: () => void;
  onNext: () => void;
}

export const FooterActions: React.FC<FooterActionsProps> = ({
  questionsCount,
  onPrevious,
  onNext
}) => {
  return (
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
        disabled={questionsCount === 0}
        icon={ArrowRight}
        iconPosition="right"
      >
        Soru Listesine Geç ({questionsCount} yüksek kaliteli soru)
      </Button>
    </div>
  );
};