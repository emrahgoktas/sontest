import React from 'react';
import { Save, Download, BookOpen } from 'lucide-react';
import { Button } from '../../ui/Button';

/**
 * Step Final Save Component
 * Allows users to save and export the booklet
 */

interface StepFinalSaveProps {
  // Add props as needed
}

export const StepFinalSave: React.FC<StepFinalSaveProps> = ({
  // Add props as needed
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Kitapçık Kaydet</h3>
      
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Kitapçık Özeti</h4>
          <p className="text-sm text-blue-800">
            Kitapçık oluşturma işlemi tamamlandı. Şimdi kitapçığınızı kaydedebilir veya indirebilirsiniz.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            icon={Save}
          >
            Arşive Kaydet
          </Button>
          
          <Button
            variant="outline"
            icon={Download}
          >
            PDF İndir
          </Button>
          
          <Button
            icon={BookOpen}
          >
            Kitapçıkları Görüntüle
          </Button>
        </div>
      </div>
    </div>
  );
};