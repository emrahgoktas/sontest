import React, { useState } from 'react';
import { Save, X } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { saveTestToDatabase } from '../../utils/api';

/**
 * Save Test Modal Component
 * Allows users to save their test with title, description, and lesson
 */

interface SaveTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (testData: { title: string; description?: string; lesson: string; questions?: any[] }) => void;
  theme?: string;                // ▼ eklendi
  watermarkConfig?: any;         // ▼ eklendi
  includeAnswerKey?: boolean;    // ▼ eklendi
  isLoading?: boolean;
  questions?: any[];
}

export const SaveTestModal: React.FC<SaveTestModalProps> = ({
  isOpen,
  onClose,
  onSave,
  isLoading = false,
  questions = [],
  theme,
  watermarkConfig,
  includeAnswerKey
}) => {
  const { userInfo } = useUser();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [lesson, setLesson] = useState(userInfo?.subject || '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Available lessons
  const lessons = [
    'Türkçe',
    'Matematik',
    'Fen Bilimleri',
    'Sosyal Bilgiler',
    'İngilizce',
    'Fizik',
    'Kimya',
    'Biyoloji',
    'Tarih',
    'Coğrafya',
    'Felsefe',
    'Edebiyat'
  ];

  /**
   * Validate form
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Test başlığı zorunludur';
    }

    if (!lesson) {
      newErrors.lesson = 'Ders seçimi zorunludur';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle save
   */
  const handleSave = async () => {
    if (validateForm()) {
      setIsSaving(true);
      
      try {
        // Save to database
       const result = await saveTestToDatabase({
  title: title.trim(),
  description: description.trim() || undefined,
  lesson,
  class_name: userInfo?.gradeLevel,
  teacher_name: userInfo?.fullName,
  theme: theme,                            // ▼ eklendi
  watermark_config: watermarkConfig,       // ▼ eklendi
  include_answer_key: includeAnswerKey,    // ▼ eklendi
  questions: questions
});

        if (result.success) {
          // Call parent onSave with the saved test data
          onSave({
            title: title.trim(),
            description: description.trim() || undefined,
            lesson,
            questions: questions
          });
          
          // Reset form
          setTitle('');
          setDescription('');
          setLesson('');
          setErrors({});
        } else {
          alert(result.message || 'Test kaydedilirken bir hata oluştu');
        }
      } catch (error) {
        console.error('Test save error:', error);
        alert('Test kaydedilirken bir hata oluştu');
      } finally {
        setIsSaving(false);
      }
    }
  };

  /**
   * Handle save (legacy for compatibility)
   */
  const handleLegacySave = () => {
    if (validateForm()) {
      onSave({
        title: title.trim(),
        description: description.trim() || undefined,
        lesson,
        questions: questions
      });
      
      // Reset form
      setTitle('');
      setDescription('');
      setLesson('');
      setErrors({});
    }
  };

  /**
   * Handle cancel
   */
  const handleCancel = () => {
    setTitle('');
    setDescription('');
    setLesson('');
    setErrors({});
    onClose();
  };

  /**
   * Clear error when field changes
   */
  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title="Testi Kaydet"
      size="md"
      closeOnOverlayClick={!isLoading}
    >
      <div className="space-y-6">
        {/* Description */}
        <p className="text-gray-600 text-sm">
          Testinizi kaydederek daha sonra kitapçık oluşturabilir veya tekrar kullanabilirsiniz.
        </p>

        {/* Form */}
        <div className="space-y-4">
          {/* Title */}
          <Input
            label="Test Başlığı"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              clearError('title');
            }}
            placeholder="örn: Matematik 1. Dönem Sınavı"
            error={errors.title}
            required
            disabled={isLoading}
          />

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Açıklama (Opsiyonel)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Test hakkında kısa açıklama..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={3}
              disabled={isLoading}
            />
          </div>

          {/* Lesson */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ders <span className="text-red-500">*</span>
            </label>
            <select
              value={lesson}
              onChange={(e) => {
                setLesson(e.target.value);
                clearError('lesson');
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.lesson ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={isLoading}
            >
              <option value="">Ders seçin</option>
              {lessons.map(lessonOption => (
                <option key={lessonOption} value={lessonOption}>
                  {lessonOption}
                </option>
              ))}
            </select>
            {errors.lesson && (
              <p className="mt-1 text-sm text-red-600">{errors.lesson}</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
            fullWidth={true}
            className="sm:w-auto"
          >
            İptal
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || isLoading}
            isLoading={isSaving || isLoading}
            icon={Save}
            fullWidth={true}
            className="sm:w-auto"
          >
            {(isSaving || isLoading) ? 'Kaydediliyor...' : 'Testi Kaydet'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};