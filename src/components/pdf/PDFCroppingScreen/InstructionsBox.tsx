import React from 'react';
import { Scissors } from 'lucide-react';

/**
 * Instructions Box Component
 * Displays instructions for high-quality cropping
 */

interface InstructionsBoxProps {
  showInstructions: boolean;
  onToggleInstructions: () => void;
}

export const InstructionsBox: React.FC<InstructionsBoxProps> = ({
  showInstructions,
  onToggleInstructions
}) => {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
      <div className="flex items-start space-x-3">
        <Scissors className="text-amber-600 mt-0.5" size={20} />
        <div>
          <button
            onClick={onToggleInstructions}
            className="flex items-center justify-between w-full text-left"
          >
            <h4 className="font-medium text-amber-900">Yüksek Kaliteli Kırpma Nasıl Yapılır?</h4>
            <span className="text-amber-600 ml-2">
              {showInstructions ? '−' : '+'}
            </span>
          </button>
          
          {showInstructions && (
            <ul className="text-sm text-amber-800 space-y-2 mt-3 pl-4 border-l-2 border-amber-300">
              <li>• <strong>Yüksek Ölçek:</strong> En az 2.5x zoom kullanın (3.0x ideal)</li>
              <li>• <strong>Tam Kapsama:</strong> Soru ve tüm şıkları (A, B, C, D, E) içine alın</li>
              <li>• <strong>Kenar Boşlukları:</strong> Metinlerin etrafında küçük boşluk bırakın</li>
              <li>• <strong>PNG Kalitesi:</strong> Tüm kırpımlar kayıpsız PNG formatında saklanır</li>
              <li>• <strong>Canlı Önizleme:</strong> Seçim sırasında gerçek zamanlı önizleme görebilirsiniz</li>
              <li>• <strong>Dokunmatik Destek:</strong> Mobil cihazlarda parmakla dokunarak kırpabilirsiniz</li>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};