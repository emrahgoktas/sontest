import React from 'react';

/**
 * Quality Info Box Component
 * Displays information about rendering quality and memory usage
 */

interface QualityInfoBoxProps {
  scale: number;
  recommendedScale: number;
  estimatedMemory: number;
}

export const QualityInfoBox: React.FC<QualityInfoBoxProps> = ({
  scale,
  recommendedScale,
  estimatedMemory
}) => {
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <h4 className="font-medium text-green-900 mb-2">Kalite Bilgileri</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-green-800">
        <div>
          <strong>Mevcut Ölçek:</strong> {scale.toFixed(1)}x
          {scale >= recommendedScale ? ' ✓' : ' (Düşük)'}
        </div>
        <div>
          <strong>Önerilen Ölçek:</strong> {recommendedScale.toFixed(1)}x
        </div>
        <div>
          <strong>Tahmini Bellek:</strong> {estimatedMemory.toFixed(0)}MB
        </div>
      </div>
    </div>
  );
};