import React from 'react';
import { Eye } from 'lucide-react';

/**
 * Preview Panel Component
 * Displays live preview of the cropped selection
 */

interface PreviewPanelProps {
  showPreview: boolean;
  previewImageData: string;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({
  showPreview,
  previewImageData
}) => {
  if (!showPreview) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h4 className="font-medium text-gray-900 mb-3">Canlı Önizleme</h4>
      {previewImageData ? (
        <div className="space-y-3">
          <div className="border border-gray-200 rounded overflow-hidden">
            <img
              src={previewImageData}
              alt="Canlı önizleme"
              className="w-full h-auto"
            />
          </div>
          <div className="text-xs text-gray-500 space-y-1">
            <div>Gerçek boyut korunacak</div>
            <div>PNG formatında kayıpsız</div>
            <div>Yazdırma kalitesi: Yüksek</div>
            <div>Dokunmatik destekli</div>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500 py-8">
          <Eye size={24} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">Kırpma alanı seçin</p>
          <p className="text-xs mt-1">Mouse veya dokunmatik</p>
        </div>
      )}
    </div>
  );
};