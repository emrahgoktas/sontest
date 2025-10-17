import React from 'react';
import { Save, Eye, Monitor, ArrowLeft } from 'lucide-react';
import { Button } from '../../ui/Button';

/**
 * Exam Actions Component
 * Provides action buttons for exam creation
 */

interface ExamActionsProps {
  onCreateExam: () => void;
  onPreviewExam: () => void;
  onBack: () => void;
  isCreating: boolean;
  canCreate: boolean;
}

export const ExamActions: React.FC<ExamActionsProps> = ({
  onCreateExam,
  onPreviewExam,
  onBack,
  isCreating,
  canCreate
}) => {
  return (
    <div className="space-y-4">
      {/* Primary Actions */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">İşlemler</h3>
        
        <div className="space-y-3">
          <Button
            onClick={onCreateExam}
            disabled={!canCreate || isCreating}
            isLoading={isCreating}
            icon={Save}
            size="lg"
            fullWidth
            className="bg-green-600 hover:bg-green-700"
          >
            {isCreating ? 'Online Sınav Oluşturuluyor...' : 'Online Sınavı Oluştur'}
          </Button>
          
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={onPreviewExam}
              disabled={!canCreate}
              icon={Eye}
              fullWidth
            >
              Önizle
            </Button>
            
            <Button
              variant="outline"
              onClick={() => alert('Test modu özelliği yakında!')}
              disabled={!canCreate}
              icon={Monitor}
              fullWidth
            >
              Test Et
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t border-gray-200">
        <Button
          variant="outline"
          onClick={onBack}
          icon={ArrowLeft}
        >
          Geri
        </Button>
      </div>
    </div>
  );
};