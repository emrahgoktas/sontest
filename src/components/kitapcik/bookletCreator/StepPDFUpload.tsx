import React from 'react';
import { Upload } from 'lucide-react';
import { Button } from '../../ui/Button';

/**
 * Step PDF Upload Component
 * Allows users to upload a PDF file
 */

interface StepPDFUploadProps {
  // Add props as needed
}

export const StepPDFUpload: React.FC<StepPDFUploadProps> = ({
  // Add props as needed
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">PDF Yükleme</h3>
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm font-medium text-gray-900">
          PDF dosyasını buraya sürükleyin
        </p>
        <p className="mt-1 text-xs text-gray-500">
          veya dosya seçmek için tıklayın
        </p>
        
        <div className="mt-4">
          <Button
            variant="outline"
            size="sm"
            disabled
          >
            PDF Seç
          </Button>
        </div>
        
        <p className="mt-4 text-xs text-gray-500">
          Not: Bu özellik henüz aktif değil. Şu an için mevcut test sorularını kullanabilirsiniz.
        </p>
      </div>
    </div>
  );
};