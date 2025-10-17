import React, { useState } from 'react';
import { Sparkles, Download, Eye, Printer, Save, ArrowLeft, Wand2, BookOpen, Monitor } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { generateQuestionsWithAI, AIQuestionRequest, AIGeneratedQuestion } from '../../utils/geminiApi';
import { ThemedTestBuilderWizard } from '../test/ThemedTestBuilderWizard';
import { TestMetadata, ManualQuestion } from '../../types';

/**
 * AI Question Generator Component
 * Uses Google Gemini API to generate questions automatically
 */

export const AIQuestionGenerator: React.FC = () => {
  const [showTestBuilder, setShowTestBuilder] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<AIGeneratedQuestion[]>([]);
  
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
   * Generate questions with AI
   */
  const handleGenerateQuestions = async () => {
    if (!validateForm()) return;

    setIsGenerating(true);
    
    try {
      const result = await generateQuestionsWithAI(formData);
      
      if (result.success) {
        setGeneratedQuestions(result.questions);
        // Show success message with better UX
        const message = result.message || `${result.questions.length} soru başarıyla oluşturuldu!`;
        alert(`✅ ${message}`);
      } else {
        // Show user-friendly error message
        const errorMessage = result.error || 'Soru üretimi başarısız oldu';
        alert(`❌ ${errorMessage}`);
      }
    } catch (error) {
      console.error('AI question generation error:', error);
      alert('❌ Beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyip tekrar deneyin.');
    } finally {
      setIsGenerating(false);
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

  /**
   * Convert AI questions to manual questions format
   */
  const convertToManualQuestions = (): ManualQuestion[] => {
    return generatedQuestions.map((aiQuestion, index) => ({
      id: aiQuestion.id,
      questionText: aiQuestion.questionText,
      options: aiQuestion.options,
      correctAnswer: aiQuestion.correctAnswer,
      explanation: aiQuestion.explanation,
      tags: [aiQuestion.subject, aiQuestion.topic],
      difficulty: aiQuestion.difficulty,
      subject: aiQuestion.subject as any,
      order: index,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
  };

  /**
   * Create test from generated questions
   */
  const handleCreateTest = () => {
    if (generatedQuestions.length === 0) {
      alert('Test oluşturmak için önce soru üretmelisiniz');
      return;
    }
    setShowTestBuilder(true);
  };

  /**
   * Handle navigation back to main page
   */
  const handleNavigationBack = () => {
    if (generatedQuestions.length > 0) {
      if (window.confirm('Üretilen sorular kaybolacak. Ana sayfaya dönmek istediğinizden emin misiniz?')) {
        window.location.href = '/';
      }
    } else {
      window.location.href = '/';
    }
  };

  /**
   * Generate preview HTML
   */
  const generatePreviewHTML = (): string => {
    return `
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AI Üretilen Sorular - ${formData.subject}</title>
        <style>
          body { font-family: 'Times New Roman', serif; line-height: 1.6; max-width: 1200px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
          .question { margin-bottom: 30px; padding: 20px; border: 1px solid #e5e5e5; border-radius: 8px; }
          .question-number { font-weight: bold; margin-bottom: 10px; font-size: 16px; color: #333; }
          .question-text { margin-bottom: 15px; font-size: 14px; }
          .options { margin-left: 20px; }
          .option { margin-bottom: 8px; }
          .correct-answer { color: #059669; font-weight: bold; }
          .explanation { margin-top: 10px; padding: 10px; background: #f0f9ff; border-left: 4px solid #0ea5e9; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>AI Üretilen Sorular</h1>
          <p><strong>Ders:</strong> ${formData.subject} | <strong>Konu:</strong> ${formData.topic}${formData.gradeLevel ? ` | <strong>Sınıf:</strong> ${formData.gradeLevel}` : ''}</p>
          <p><strong>Zorluk:</strong> ${difficulties.find(d => d.value === formData.difficulty)?.label} | <strong>Soru Sayısı:</strong> ${generatedQuestions.length}</p>
        </div>
        
        ${generatedQuestions.map((question, index) => `
          <div class="question">
            <div class="question-number">${index + 1}. Soru</div>
            <div class="question-text">${question.questionText}</div>
            <div class="options">
              ${Object.entries(question.options).map(([key, value]) => `
                <div class="option ${question.correctAnswer === key ? 'correct-answer' : ''}">
                  ${key}) ${value} ${question.correctAnswer === key ? '✓' : ''}
                </div>
              `).join('')}
            </div>
            ${question.explanation ? `
              <div class="explanation">
                <strong>Açıklama:</strong> ${question.explanation}
              </div>
            ` : ''}
          </div>
        `).join('')}
      </body>
      </html>
    `;
  };

  /**
   * Show preview
   */
  const handlePreview = () => {
    if (generatedQuestions.length === 0) {
      alert('Önce soru üretmelisiniz');
      return;
    }
    
    const htmlContent = generatePreviewHTML();
    const previewWindow = window.open('', '_blank');
    if (previewWindow) {
      previewWindow.document.write(htmlContent);
      previewWindow.document.close();
    } else {
      alert('Popup engelleyici nedeniyle önizleme açılamadı');
    }
  };

  /**
   * Print questions
   */
  const handlePrint = () => {
    if (generatedQuestions.length === 0) {
      alert('Önce soru üretmelisiniz');
      return;
    }
    
    const htmlContent = generatePreviewHTML();
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    } else {
      alert('Popup engelleyici nedeniyle yazdırma açılamadı');
    }
  };

  // Show test builder if requested
  if (showTestBuilder) {
    const metadata: TestMetadata = {
      testName: `AI ${formData.subject} Testi - ${formData.topic}`,
      courseName: formData.subject,
      questionSpacing: 5
    };

    return (
      <ThemedTestBuilderWizard
        sourceType="manual"
        manualQuestions={convertToManualQuestions()}
        metadata={metadata}
        onBack={() => setShowTestBuilder(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-600 rounded-lg p-2">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">AI Soru Üretici</h1>
                <p className="text-sm text-gray-500">Google Gemini 2.5 Flash ile otomatik soru oluşturma</p>
              </div>
            </div>
            
            {generatedQuestions.length > 0 && (
              <Button
                onClick={handleCreateTest}
                icon={BookOpen}
                size="lg"
              >
                Test Oluştur ({generatedQuestions.length} soru)
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Controls */}
        <div className="mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <Button
              variant="outline"
              onClick={handleNavigationBack}
              className="flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Ana Sayfaya Dön</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Left Column - AI Generation Form */}
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Wand2 className="mr-2" size={20} />
                AI Soru Üretimi
              </h3>

              <div className="space-y-6">
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

                {/* Generate Button */}
                <Button
                  onClick={handleGenerateQuestions}
                  isLoading={isGenerating}
                  icon={Sparkles}
                  size="lg"
                  fullWidth
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {isGenerating ? 'AI Sorular Üretiyor...' : 'AI ile Soru Üret'}
                </Button>
              </div>
            </div>

            {/* AI Info */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-medium text-purple-900 mb-2 flex items-center">
                <Sparkles className="mr-2" size={16} />
                Google Gemini 2.5 Flash
              </h4>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>• Gelişmiş AI ile yüksek kaliteli, büyük boyutlu sorular</li>
                <li>• Çoktan seçmeli format (A-E şıkları)</li>
                <li>• Zorluk seviyesine göre uyarlanmış içerik</li>
                <li>• Türkçe dil desteği</li>
                <li>• Otomatik cevap anahtarı</li>
                <li>• Müfredata uygun kazanım odaklı sorular</li>
                <li>• PDF'de tam alan kullanımı</li>
                <li>• A-E kitapçık versiyonları oluşturma</li>
              </ul>
            </div>
          </div>

          {/* Right Column - Generated Questions */}
          <div className="space-y-6">
            {generatedQuestions.length > 0 ? (
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Üretilen Sorular ({generatedQuestions.length})
                  </h3>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Eye}
                      onClick={handlePreview}
                    >
                      Önizle
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Printer}
                      onClick={handlePrint}
                    >
                      Yazdır
                    </Button>
                  </div>
                </div>

                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {generatedQuestions.slice(0, 3).map((question, index) => (
                    <div key={question.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded">
                          Soru {index + 1}
                        </span>
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                          Doğru: {question.correctAnswer}
                        </span>
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                          {difficulties.find(d => d.value === question.difficulty)?.label}
                        </span>
                      </div>
                      
                      <p className="text-gray-900 mb-2 text-sm">
                        {question.questionText}
                      </p>
                      
                      <div className="grid grid-cols-1 gap-1 text-xs">
                        {Object.entries(question.options).map(([key, value]) => (
                          <div key={key} className={`p-2 rounded ${
                            question.correctAnswer === key ? 'bg-green-50 border border-green-200' : 'bg-white'
                          }`}>
                            <span className="font-medium">{key}:</span> {value}
                          </div>
                        ))}
                      </div>
                      
                      {question.explanation && (
                        <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                          <strong>Açıklama:</strong> {question.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {generatedQuestions.length > 3 && (
                    <div className="text-center text-purple-600 text-sm">
                      +{generatedQuestions.length - 3} soru daha
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-gray-200 space-y-3">
                  <Button
                    onClick={handleCreateTest}
                    icon={BookOpen}
                    fullWidth
                    size="lg"
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Test Kitapçığı Oluştur ({generatedQuestions.length} soru)
                  </Button>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      onClick={handlePreview}
                      icon={Eye}
                      fullWidth
                    >
                      Önizle
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={handlePrint}
                      icon={Printer}
                      fullWidth
                    >
                      Yazdır
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    AI ile Soru Üretmeye Hazır
                  </h3>
                  <p className="text-gray-600">
                    Sol taraftaki formu doldurun ve AI'nin sizin için sorular üretmesini sağlayın
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};