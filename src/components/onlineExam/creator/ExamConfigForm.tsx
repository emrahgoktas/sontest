import React from 'react';
import { Clock, Settings, Users } from 'lucide-react';
import { Input } from '../../ui/Input';

/**
 * Exam Configuration Form Component
 * Handles exam settings and configuration
 */

interface ExamConfigFormProps {
  examConfig: {
    title: string;
    description: string;
    timeLimit: number;
    shuffleQuestions: boolean;
    shuffleOptions: boolean;
    showResults: boolean;
    allowReview: boolean;
    isActive: boolean;
    startDate: string;
    endDate: string;
  };
  onConfigChange: (field: string, value: any) => void;
  errors: Record<string, string>;
}

export const ExamConfigForm: React.FC<ExamConfigFormProps> = ({
  examConfig,
  onConfigChange,
  errors
}) => {
  return (
    <>
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Settings className="mr-2" size={20} />
          Temel Bilgiler
        </h3>
        
        <div className="space-y-4">
          <Input
            label="Sınav Başlığı"
            value={examConfig.title}
            onChange={(e) => onConfigChange('title', e.target.value)}
            placeholder="örn: Matematik 1. Dönem Online Sınavı"
            error={errors.title}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Açıklama (Opsiyonel)
            </label>
            <textarea
              value={examConfig.description}
              onChange={(e) => onConfigChange('description', e.target.value)}
              placeholder="Sınav hakkında kısa açıklama..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Time Settings */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Clock className="mr-2" size={20} />
          Zaman Ayarları
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Süre Limiti (dakika)"
            type="number"
            min="1"
            max="300"
            value={examConfig.timeLimit.toString()}
            onChange={(e) => onConfigChange('timeLimit', parseInt(e.target.value) || 60)}
            error={errors.timeLimit}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Başlangıç Tarihi
            </label>
            <input
              type="datetime-local"
              value={examConfig.startDate}
              onChange={(e) => onConfigChange('startDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bitiş Tarihi
            </label>
            <input
              type="datetime-local"
              value={examConfig.endDate}
              onChange={(e) => onConfigChange('endDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Users className="mr-2" size={20} />
          Gelişmiş Ayarlar
        </h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={examConfig.shuffleQuestions}
                  onChange={(e) => onConfigChange('shuffleQuestions', e.target.checked)}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Soruları karıştır
                  </span>
                  <p className="text-xs text-gray-500">
                    Her öğrenci için farklı soru sırası
                  </p>
                </div>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={examConfig.shuffleOptions}
                  onChange={(e) => onConfigChange('shuffleOptions', e.target.checked)}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Şıkları karıştır
                  </span>
                  <p className="text-xs text-gray-500">
                    A, B, C, D, E şıklarının sırası değişir
                  </p>
                </div>
              </label>
            </div>

            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={examConfig.showResults}
                  onChange={(e) => onConfigChange('showResults', e.target.checked)}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Sonuçları göster
                  </span>
                  <p className="text-xs text-gray-500">
                    Sınav bitiminde sonuçları göster
                  </p>
                </div>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={examConfig.allowReview}
                  onChange={(e) => onConfigChange('allowReview', e.target.checked)}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    İncelemeye izin ver
                  </span>
                  <p className="text-xs text-gray-500">
                    Öğrenciler cevaplarını gözden geçirebilir
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={examConfig.isActive}
                onChange={(e) => onConfigChange('isActive', e.target.checked)}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Sınavı hemen aktifleştir
                </span>
              </div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}