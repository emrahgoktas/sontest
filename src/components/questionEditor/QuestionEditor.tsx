import React, { useState } from 'react';
import { Plus, Save, Trash2, Edit2, FileText, Upload, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ManualQuestion, AnswerChoice, TestMetadata } from '../../types';
import { ThemedTestBuilderWizard } from '../test/ThemedTestBuilderWizard';

/**
 * Question Editor Component
 * Allows manual creation of questions with text, images, and multiple choice options
 */

export const QuestionEditor: React.FC = () => {
  const [questions, setQuestions] = useState<ManualQuestion[]>([]);
  const [showTestBuilder, setShowTestBuilder] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Partial<ManualQuestion>>({
    questionText: '',
    options: { A: '', B: '', C: '', D: '', E: '' },
    correctAnswer: 'A',
    explanation: ''
  });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  /**
   * Validate current question form
   */
  const validateQuestion = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!currentQuestion.questionText?.trim()) {
      newErrors.questionText = 'Soru metni zorunludur';
    }

    // Check all options are filled
    const options = currentQuestion.options;
    if (!options?.A?.trim()) newErrors.optionA = 'A şıkkı zorunludur';
    if (!options?.B?.trim()) newErrors.optionB = 'B şıkkı zorunludur';
    if (!options?.C?.trim()) newErrors.optionC = 'C şıkkı zorunludur';
    if (!options?.D?.trim()) newErrors.optionD = 'D şıkkı zorunludur';
    if (!options?.E?.trim()) newErrors.optionE = 'E şıkkı zorunludur';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle image upload
   */
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match(/^image\/(png|jpg|jpeg)$/)) {
      alert('Lütfen PNG veya JPG formatında görsel seçin');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Görsel boyutu 5MB\'dan küçük olmalıdır');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Data = e.target?.result as string;
      setCurrentQuestion(prev => ({ ...prev, imageData: base64Data }));
    };
    reader.readAsDataURL(file);
  };

  /**
   * Save current question
   */
  const handleSaveQuestion = () => {
    if (!validateQuestion()) return;

    const questionData: ManualQuestion = {
      id: editingIndex !== null ? questions[editingIndex].id : `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      questionText: currentQuestion.questionText!,
      imageData: currentQuestion.imageData,
      options: currentQuestion.options!,
      correctAnswer: currentQuestion.correctAnswer!,
      explanation: currentQuestion.explanation,
      order: editingIndex !== null ? questions[editingIndex].order : questions.length,
      createdAt: editingIndex !== null ? questions[editingIndex].createdAt : new Date()
    };

    if (editingIndex !== null) {
      // Update existing question
      const updatedQuestions = [...questions];
      updatedQuestions[editingIndex] = questionData;
      setQuestions(updatedQuestions);
      setEditingIndex(null);
    } else {
      // Add new question
      setQuestions([...questions, questionData]);
    }

    // Reset form
    setCurrentQuestion({
      questionText: '',
      options: { A: '', B: '', C: '', D: '', E: '' },
      correctAnswer: 'A',
      explanation: ''
    });
    setErrors({});
  };

  /**
   * Edit existing question
   */
  const handleEditQuestion = (index: number) => {
    const question = questions[index];
    setCurrentQuestion({
      questionText: question.questionText,
      imageData: question.imageData,
      options: question.options,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation
    });
    setEditingIndex(index);
  };

  /**
   * Delete question
   */
  const handleDeleteQuestion = (index: number) => {
    if (window.confirm('Bu soruyu silmek istediğinizden emin misiniz?')) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  /**
   * Cancel editing
   */
  const handleCancelEdit = () => {
    setCurrentQuestion({
      questionText: '',
      options: { A: '', B: '', C: '', D: '', E: '' },
      correctAnswer: 'A',
      explanation: ''
    });
    setEditingIndex(null);
    setErrors({});
  };

  /**
   * Update option value
   */
  const updateOption = (option: AnswerChoice, value: string) => {
    setCurrentQuestion(prev => ({
      ...prev,
      options: { ...prev.options!, [option]: value }
    }));
    
    // Clear error for this option
    if (errors[`option${option}`]) {
      setErrors(prev => ({ ...prev, [`option${option}`]: '' }));
    }
  };

  /**
   * Open test builder with manual questions
   */
  const handleCreateTestBooklet = () => {
    if (questions.length === 0) {
      alert('Test oluşturmak için en az 1 soru eklemelisiniz');
      return;
    }
    setShowTestBuilder(true);
  };

  // Show test builder if requested
  if (showTestBuilder) {
    const metadata: TestMetadata = {
      testName: 'Manuel Oluşturulan Test',
      questionSpacing: 5
    };

    return (
      <ThemedTestBuilderWizard
        sourceType="manual"
        manualQuestions={questions}
        metadata={metadata}
        onBack={() => setShowTestBuilder(false)}
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Soru Editörü</h2>
          <p className="text-gray-600">Manuel olarak soru oluşturun ve test kitapçığı hazırlayın</p>
        </div>
        
        {questions.length > 0 && (
          <Button
            onClick={handleCreateTestBooklet}
            icon={FileText}
            size="lg"
          >
            Test Kitapçığı Oluştur ({questions.length} soru)
          </Button>
        )}
      </div>

      {/* Question Form */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {editingIndex !== null ? 'Soruyu Düzenle' : 'Yeni Soru Ekle'}
        </h3>

        <div className="space-y-6">
          {/* Question Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Soru Metni <span className="text-red-500">*</span>
            </label>
            <textarea
              value={currentQuestion.questionText || ''}
              onChange={(e) => {
                setCurrentQuestion(prev => ({ ...prev, questionText: e.target.value }));
                if (errors.questionText) setErrors(prev => ({ ...prev, questionText: '' }));
              }}
              placeholder="Soru metnini buraya yazın..."
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                errors.questionText ? 'border-red-300' : 'border-gray-300'
              }`}
              rows={3}
            />
            {errors.questionText && (
              <p className="mt-1 text-sm text-red-600">{errors.questionText}</p>
            )}
          </div>

          {/* Optional Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Görsel (Opsiyonel)
            </label>
            <div className="space-y-3">
              <input
                type="file"
                accept=".png,.jpg,.jpeg"
                onChange={handleImageUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              
              {currentQuestion.imageData && (
                <div className="relative inline-block">
                  <img
                    src={currentQuestion.imageData}
                    alt="Soru görseli"
                    className="max-w-64 max-h-32 object-contain border border-gray-200 rounded"
                  />
                  <button
                    onClick={() => setCurrentQuestion(prev => ({ ...prev, imageData: undefined }))}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Multiple Choice Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Çoktan Seçmeli Şıklar <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3">
              {(['A', 'B', 'C', 'D', 'E'] as AnswerChoice[]).map(option => (
                <div key={option} className="flex items-center space-x-3">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="correctAnswer"
                      value={option}
                      checked={currentQuestion.correctAnswer === option}
                      onChange={(e) => setCurrentQuestion(prev => ({ ...prev, correctAnswer: e.target.value as AnswerChoice }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <label className="ml-2 text-sm font-medium text-gray-700 w-4">
                      {option}
                    </label>
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={currentQuestion.options?.[option] || ''}
                      onChange={(e) => updateOption(option, e.target.value)}
                      placeholder={`${option} şıkkı`}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors[`option${option}`] ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors[`option${option}`] && (
                      <p className="mt-1 text-sm text-red-600">{errors[`option${option}`]}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Optional Explanation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Açıklama (Opsiyonel)
            </label>
            <textarea
              value={currentQuestion.explanation || ''}
              onChange={(e) => setCurrentQuestion(prev => ({ ...prev, explanation: e.target.value }))}
              placeholder="Sorunun açıklaması..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={2}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            {editingIndex !== null && (
              <Button
                variant="outline"
                onClick={handleCancelEdit}
              >
                İptal
              </Button>
            )}
            <Button
              onClick={handleSaveQuestion}
              icon={Save}
            >
              {editingIndex !== null ? 'Güncelle' : 'Soruyu Kaydet'}
            </Button>
          </div>
        </div>
      </div>

      {/* Questions List */}
      {questions.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Eklenen Sorular ({questions.length})
            </h3>
          </div>

          <div className="space-y-4">
            {questions.map((question, index) => (
              <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                        Soru {index + 1}
                      </span>
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                        Doğru: {question.correctAnswer}
                      </span>
                    </div>
                    
                    <p className="text-gray-900 mb-2 line-clamp-2">
                      {question.questionText}
                    </p>
                    
                    {question.imageData && (
                      <img
                        src={question.imageData}
                        alt={`Soru ${index + 1} görseli`}
                        className="max-w-32 max-h-20 object-contain border border-gray-200 rounded mb-2"
                      />
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-sm">
                      {Object.entries(question.options).map(([key, value]) => (
                        <div key={key} className={`p-2 rounded ${
                          question.correctAnswer === key ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                        }`}>
                          <span className="font-medium">{key}:</span> {value}
                        </div>
                      ))}
                    </div>
                    
                    {question.explanation && (
                      <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                        <strong>Açıklama:</strong> {question.explanation}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Edit2}
                      onClick={() => handleEditQuestion(index)}
                    >
                      Düzenle
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Trash2}
                      onClick={() => handleDeleteQuestion(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Sil
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {questions.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Henüz soru eklenmemiş
          </h3>
          <p className="text-gray-600">
            Yukarıdaki formu kullanarak ilk sorunuzu ekleyin
          </p>
        </div>
      )}
    </div>
  );
};