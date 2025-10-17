import React, { useState } from 'react';
import { Sparkles, Wand2 } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { AIQuestionRequest } from '../../../utils/geminiApi';

/**
 * AI Question Generator Form Component
 * Form for generating questions using AI within the online exam creator
 */

interface AIQuestionGeneratorFormProps {
  onGenerate: (request: AIQuestionRequest) => void;
  isGenerating: boolean;
  onCancel: () => void;
}

export const AIQuestionGeneratorForm: React.FC<AIQuestionGeneratorFormProps> = ({
  onGenerate,
  isGenerating,
  onCancel
}) => {
  const [formData, setFormData] = useState<AIQuestionRequest>({
    subject: 'Matematik',
    topic: '',
    gradeLevel: '',
    difficulty: 'medium',
    questionCount: 10,
    language: 'turkish',
    includeAnswerKey: true,
    questionType: 'multiple-choice'
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Subject options
  const subjects = [
    'Matematik', 'Türkçe', 'Fen Bilimleri', 'Sosyal Bilgiler', 'İngilizce',
    'Fizik', 'Kimya', 'Biyoloji', 'Tarih', 'Coğrafya', 'Felsefe', 'Edebiyat'
  ];

  // Grade level options
  const gradeLevels = [
    'Anaokulu', '1. Sınıf', '2. Sınıf', '3. Sınıf', '4. Sınıf', '5. Sınıf',
    '6. Sınıf', '7. Sınıf', '8. Sınıf', '9. Sınıf', '10. Sınıf', '11. Sınıf', '12. Sınıf',
    'Üniversite'
  ];

  // Difficulty options
  const difficulties = [
    { value: 'easy', label: 'Kolay' },
    { value: 'medium', label: 'Orta' },
    { value: 'hard', label: 'Zor' }
  ];

  /**
   * Validate form
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.subject.trim()) {
      newErrors.subject = 'Ders seçimi zorunludur';
    }

    if (!formData.topic.trim()) {
      newErrors.topic = 'Konu başlığı zorunludur';
    }

    if (formData.questionCount < 1 || formData.questionCount > 50) {
      newErrors.questionCount = 'Soru sayısı 1-50 arasında olmalıdır';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = () => {
    if (validateForm()) {
      onGenerate(formData);
    }
  };

  /**
   * Update form field
   */
  const updateField = (field: keyof AIQuestionRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-purple-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          AI ile Soru Üretimi
        </h3>
        <p className="text-gray-600">
          Google Gemini 2.5 Flash ile otomatik soru oluşturun
        </p>
      </div>

      <div className="space-y-4">
        {/* Subject Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ders <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.subject}
            onChange={(e) => updateField('subject', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
              errors.subject ? 'border-red-300' : 'border-gray-300'
            }`}
            disabled={isGenerating}
          >
            {subjects.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
          {errors.subject && (
            <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
          )}
        </div>

        {/* Topic */}
        <Input
          label="Konu Başlığı"
          value={formData.topic}
          onChange={(e) => updateField('topic', e.target.value)}
          placeholder="örn: Dört İşlem, Kesirler, Geometri"
          error={errors.topic}
          required
          disabled={isGenerating}
        />

        {/* Grade Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sınıf Seviyesi (Opsiyonel)
          </label>
          <select
            value={formData.gradeLevel || ''}
            onChange={(e) => updateField('gradeLevel', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            disabled={isGenerating}
          >
            <option value="">Sınıf seviyesi seçin</option>
            {gradeLevels.map(grade => (
              <option key={grade} value={grade}>{grade}</option>
            ))}
          </select>
        </div>

        {/* Difficulty and Question Count */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Zorluk Seviyesi
            </label>
            <select
              value={formData.difficulty}
              onChange={(e) => updateField('difficulty', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              disabled={isGenerating}
            >
              {difficulties.map(difficulty => (
                <option key={difficulty.value} value={difficulty.value}>
                  {difficulty.label}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Soru Sayısı"
            type="number"
            min="1"
            max="50"
            value={formData.questionCount.toString()}
            onChange={(e) => updateField('questionCount', parseInt(e.target.value) || 10)}
            error={errors.questionCount}
            disabled={isGenerating}
          />
        </div>

        {/* Advanced Options */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Gelişmiş Seçenekler</h4>
          
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.includeAnswerKey}
              onChange={(e) => updateField('includeAnswerKey', e.target.checked)}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              disabled={isGenerating}
            />
            <div>
              <span className="text-sm font-medium text-gray-700">
                Cevap anahtarı ve açıklama ekle
              </span>
              <p className="text-xs text-gray-500">
                Her soru için doğru cevabın açıklaması eklenir
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isGenerating}
        >
          İptal
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isGenerating}
          isLoading={isGenerating}
          icon={isGenerating ? undefined : Wand2}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {isGenerating ? 'AI Sorular Üretiyor...' : 'AI ile Soru Üret'}
        </Button>
      </div>

      {/* AI Info */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h4 className="font-medium text-purple-900 mb-2 flex items-center">
          <Sparkles className="mr-2" size={16} />
          Google Gemini 2.5 Flash
        </h4>
        <ul className="text-sm text-purple-800 space-y-1">
          <li>• Gelişmiş AI ile yüksek kaliteli sorular</li>
          <li>• Çoktan seçmeli format (A-E şıkları)</li>
          <li>• Zorluk seviyesine göre uyarlanmış içerik</li>
          <li>• Türkçe dil desteği</li>
          <li>• Otomatik cevap anahtarı</li>
          <li>• Müfredata uygun kazanım odaklı sorular</li>
        </ul>
      </div>
    </div>
  );
};