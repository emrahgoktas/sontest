import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../ui/Button';

/**
 * Navigation Controls Component
 * Provides back navigation and breadcrumb
 */

interface NavigationControlsProps {
  onBack: () => void;
}

export const NavigationControls: React.FC<NavigationControlsProps> = ({
  onBack
}) => {
  return (
    <div className="mb-6">
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <Button
          variant="outline"
          onClick={onBack}
          icon={ArrowLeft}
          className="flex items-center space-x-2"
        >
          <span>Geri Dön</span>
        </Button>
      </div>
    </div>
  );
};