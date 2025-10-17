import React, { useState } from 'react';
import { Eye, EyeOff, FileText, Users, Clock, Settings } from 'lucide-react';
import { Button } from '../../ui/Button';
import { CroppedQuestion, TestMetadata } from '../../../types';

/**
 * Exam Preview Component
 * Shows preview of the exam configuration and questions
 */

interface ExamPreviewProps {
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
    pdfPages?: string[];
    pageCount?: number;
  };
  questions: CroppedQuestion[];
  metadata: TestMetadata;
}

export const ExamPreview: React.FC<ExamPreviewProps> = ({
  examConfig,
  questions,
  metadata
}) => {
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [showQuestionPreview, setShowQuestionPreview] = useState(false);

  /**
   * Format date for display
   */
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Belirtilmemiş';
    return new Date(dateString).toLocaleString('tr-TR');
  };

  return (
    <div className="space-y-6">
      {/* Exam Summary */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sınav Özeti</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <FileText className="mx-auto h-8 w-8 text-blue-600 mb-2" />
            <div className="text-2xl font-bold text-blue-600">
              {examConfig.pageCount || questions.length}
            </div>
            <div className="text-sm text-blue-800">
              {examConfig.pdfPages ? 'PDF Sayfası' : 'Soru'}
            </div>
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Clock className="mx-auto h-8 w-8 text-green-600 mb-2" />
            <div className="text-2xl font-bold text-green-600">
              {examConfig.timeLimit}
            </div>
            <div className="text-sm text-green-800">Dakika</div>
          </div>

          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <Users className="mx-auto h-8 w-8 text-purple-600 mb-2" />
            <div className="text-2xl font-bold text-purple-600">
              {examConfig.isActive ? 'Aktif' : 'İnaktif'}
            </div>
            <div className="text-sm text-purple-800">Durum</div>
          </div>

          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <Settings className="mx-auto h-8 w-8 text-orange-600 mb-2" />
            <div className="text-2xl font-bold text-orange-600">
              {[examConfig.shuffleQuestions, examConfig.shuffleOptions, examConfig.showResults, examConfig.allowReview].filter(Boolean).length}
            </div>
            <div className="text-sm text-orange-800">Özellik</div>
          </div>
        </div>
      </div>

      {/* Exam Details */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sınav Detayları</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-600">Başlık:</span>
              <div className="font-medium text-gray-900">{examConfig.title || 'Belirtilmemiş'}</div>
            </div>
            <div>
              <span className="text-sm text-gray-600">Açıklama:</span>
              <div className="font-medium text-gray-900">{examConfig.description || 'Yok'}</div>
            </div>
            <div>
              <span className="text-sm text-gray-600">Süre Limiti:</span>
              <div className="font-medium text-gray-900">{examConfig.timeLimit} dakika</div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-600">Başlangıç:</span>
              <div className="font-medium text-gray-900">{formatDate(examConfig.startDate)}</div>
            </div>
            <div>
              <span className="text-sm text-gray-600">Bitiş:</span>
              <div className="font-medium text-gray-900">{formatDate(examConfig.endDate)}</div>
            </div>
            <div>
              <span className="text-sm text-gray-600">Durum:</span>
              <div className={`font-medium ${examConfig.isActive ? 'text-green-600' : 'text-gray-600'}`}>
                {examConfig.isActive ? 'Aktif' : 'İnaktif'}
              </div>
            </div>
          </div>
        </div>

        {/* Settings Summary */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">Sınav Ayarları</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className={`flex items-center space-x-2 ${examConfig.shuffleQuestions ? 'text-green-600' : 'text-gray-500'}`}>
              <span>{examConfig.shuffleQuestions ? '✓' : '✗'}</span>
              <span>Soru Karıştırma</span>
            </div>
            <div className={`flex items-center space-x-2 ${examConfig.shuffleOptions ? 'text-green-600' : 'text-gray-500'}`}>
              <span>{examConfig.shuffleOptions ? '✓' : '✗'}</span>
              <span>Şık Karıştırma</span>
            </div>
            <div className={`flex items-center space-x-2 ${examConfig.showResults ? 'text-green-600' : 'text-gray-500'}`}>
              <span>{examConfig.showResults ? '✓' : '✗'}</span>
              <span>Sonuç Gösterme</span>
            </div>
            <div className={`flex items-center space-x-2 ${examConfig.allowReview ? 'text-green-600' : 'text-gray-500'}`}>
              <span>{examConfig.allowReview ? '✓' : '✗'}</span>
              <span>İnceleme İzni</span>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Preview */}
      {examConfig.pdfPages && examConfig.pdfPages.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">PDF İçeriği</h3>
            <Button
              variant="ghost"
              size="sm"
              icon={showPDFPreview ? EyeOff : Eye}
              onClick={() => setShowPDFPreview(!showPDFPreview)}
            >
              {showPDFPreview ? 'Gizle' : 'Önizle'}
            </Button>
          </div>

          {showPDFPreview && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {examConfig.pdfPages.slice(0, 3).map((pageImage, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                    <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                      <span className="text-xs font-medium text-gray-700">
                        Sayfa {index + 1}
                      </span>
                    </div>
                    <div className="p-2">
                      <img
                        src={pageImage}
                        alt={`Sayfa ${index + 1}`}
                        className="w-full h-auto max-h-32 object-contain bg-white"
                      />
                    </div>
                  </div>
                ))}
                
                {examConfig.pdfPages.length > 3 && (
                  <div className="border border-gray-200 rounded-lg p-4 flex items-center justify-center bg-gray-50">
                    <div className="text-center text-gray-600">
                      <div className="text-sm font-medium">+{examConfig.pdfPages.length - 3}</div>
                      <div className="text-xs">sayfa daha</div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  ✓ {examConfig.pdfPages.length} sayfa online sınavda tam boyut görüntülenecek
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Questions Preview */}
      {questions.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Sorular</h3>
            <Button
              variant="ghost"
              size="sm"
              icon={showQuestionPreview ? EyeOff : Eye}
              onClick={() => setShowQuestionPreview(!showQuestionPreview)}
            >
              {showQuestionPreview ? 'Gizle' : 'Önizle'}
            </Button>
          </div>

          {showQuestionPreview && (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {questions.slice(0, 5).map((question, index) => (
                <div key={question.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                  <div className="flex items-start space-x-3">
                    <div className="text-sm font-medium text-gray-700 mb-2">
                      Soru {index + 1}
                    </div>
                    <img
                      src={question.imageData}
                      alt={`Soru ${index + 1}`}
                      className="max-w-24 max-h-16 object-contain bg-white rounded border"
                    />
                    <div className="flex-1 text-xs text-gray-500">
                      <div><strong>Doğru Cevap:</strong> {question.correctAnswer}</div>
                      <div><strong>Boyut:</strong> {question.actualWidth}×{question.actualHeight}px</div>
                    </div>
                  </div>
                </div>
              ))}
              
              {questions.length > 5 && (
                <div className="text-center text-blue-600 text-sm">
                  +{questions.length - 5} soru daha
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};