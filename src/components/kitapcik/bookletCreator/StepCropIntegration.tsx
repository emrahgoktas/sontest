import React from 'react';
import { Scissors } from 'lucide-react';

/**
 * Step Crop Integration Component
 * Integrates with PDF cropping functionality
 */

interface StepCropIntegrationProps {
  // Add props as needed
}

export const StepCropIntegration: React.FC<StepCropIntegrationProps> = ({
  // Add props as needed
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Soru Kırpma</h3>
      
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <Scissors className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm font-medium text-gray-900">
          PDF'den soru kırpma özelliği
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Bu özellik henüz aktif değil. Şu an için mevcut test sorularını kullanabilirsiniz.
        </p>
      </div>
    </div>
  );
};