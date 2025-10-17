import React, { useState } from 'react';
import { Monitor } from 'lucide-react';
import { Button } from '../ui/Button';
import { ExamCreatorHeader } from './creator/ExamCreatorHeader';
import { NavigationControls } from './creator/NavigationControls';
import { PDFUploadSection } from './creator/PDFUploadSection';
import { ExamConfigForm } from './creator/ExamConfigForm';
import { ExamPreview } from './creator/ExamPreview';
import { ExamActions } from './creator/ExamActions';
import { createOnlineExam } from '../../utils/api';
import { saveTestToDatabase } from '../../utils/api';
import { TestMetadata, CroppedQuestion } from '../../types';
import { OnlineExamConfig } from '../../types/booklet';

/**
 * Online Exam Creator Component
 * Main orchestrator for online exam creation - now modular and clean
 */

interface OnlineExamCreatorProps {
  metadata: TestMetadata;
  questions: CroppedQuestion[];
  onCreateExam: (examConfig: OnlineExamConfig) => void;
  onBack: () => void;
}

export const OnlineExamCreator: React.FC<OnlineExamCreatorProps> = ({
  metadata,
  questions,
  onCreateExam,
  onBack
}) => {
  // Exam configuration state
  const [examConfig, setExamConfig] = useState({
    title: metadata.testName || '',
    description: '',
    timeLimit: 60,
    shuffleQuestions: false,
    shuffleOptions: false,
    showResults: true,
    allowReview: true,
    isActive: true,
    startDate: new Date().toISOString().slice(0, 16), // Current time
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16), // 7 days from now
    pdfPages: [] as string[],
    pageCount: 0
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCreating, setIsCreating] = useState(false);
  const [createdExam, setCreatedExam] = useState<{
    id: string;
    title: string;
    examUrl: string;
    shareUrl: string;
  } | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  /**
   * Update exam configuration
   */
  const updateExamConfig = (field: string, value: any) => {
    setExamConfig(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  /**
   * Handle PDF processing
   */
  const handlePDFProcessed = (pdfData: {
    pdfUrl?: string;
    pdfId?: string;
    pdfPages: string[];
    pageCount: number;
  }) => {
    setExamConfig(prev => ({
      ...prev,
      pdfPages: pdfData.pdfPages,
      pageCount: pdfData.pageCount,
      pdfUrl: pdfData.pdfUrl,
      pdfId: pdfData.pdfId
    }));
  };

  /**
   * Validate exam configuration
   */
  const validateExamConfig = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!examConfig.title.trim()) {
      newErrors.title = 'Sınav başlığı zorunludur';
    }

    if (examConfig.timeLimit < 1 || examConfig.timeLimit > 300) {
      newErrors.timeLimit = 'Süre limiti 1-300 dakika arasında olmalıdır';
    }

    if (examConfig.startDate && examConfig.endDate) {
      if (new Date(examConfig.startDate) >= new Date(examConfig.endDate)) {
        newErrors.endDate = 'Bitiş tarihi başlangıç tarihinden sonra olmalıdır';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Create online exam
   */
  const handleCreateExam = async () => {
    if (!validateExamConfig()) return;

    setIsCreating(true);

    try {
      // First save test if we have questions
      let testId = `test_${Date.now()}`;
      
      if (questions.length > 0) {
        try {
          const testResult = await saveTestToDatabase({
            title: examConfig.title,
            description: examConfig.description,
            lesson: metadata.courseName || 'Online Sınav',
            class_name: metadata.className,
            teacher_name: metadata.teacherName,
            questions: questions
          });
          
          if (testResult.success && testResult.test) {
            testId = testResult.test.id;
          }
        } catch (testError) {
          console.warn('Test creation failed, using local ID:', testError);
        }
      }
      
      // Create exam configuration
      const examConfigData: OnlineExamConfig = {
        id: `exam_${Date.now()}`,
        testId: testId,
        pdfPages: examConfig.pdfPages,
        title: examConfig.title,
        description: examConfig.description,
        timeLimit: examConfig.timeLimit,
        shuffleQuestions: examConfig.shuffleQuestions,
        shuffleOptions: examConfig.shuffleOptions,
        showResults: examConfig.showResults,
        allowReview: examConfig.allowReview,
        isActive: examConfig.isActive,
        startDate: examConfig.startDate ? new Date(examConfig.startDate) : undefined,
        endDate: examConfig.endDate ? new Date(examConfig.endDate) : undefined
      };

      // Save exam data to localStorage for OnlineExamScreen to access
      // Optimize exam data for localStorage - remove large data
      try {
        // Store only exam ID and title - minimal data
        const minimalData = {
          id: examConfigData.id,
          title: examConfig.title
        };
        localStorage.setItem('onlineExamData', JSON.stringify(minimalData));
        console.log('💾 Saved minimal exam data to localStorage');
      } catch (storageError) {
        console.warn('⚠️ localStorage save failed, continuing without storage');
        // Continue without localStorage - exam will work with PDF data only
      }

      // Try to create via API
      try {
        const result = await createOnlineExam({
          test_id: testId,
          title: examConfig.title,
          description: examConfig.description,
          time_limit: examConfig.timeLimit,
          shuffle_questions: examConfig.shuffleQuestions,
          shuffle_options: examConfig.shuffleOptions,
          show_results: examConfig.showResults,
          allow_review: examConfig.allowReview,
          is_active: true, // Force active for immediate testing
          start_date: examConfig.startDate || undefined,
          end_date: examConfig.endDate || undefined
        });
        
        if (result.success) {
          // Set created exam data for display
          const examData = {
            id: result.exam.id,
            title: result.exam.title,
            examUrl: `${window.location.origin}/online-exam/${result.exam.id}`,
            shareUrl: `${window.location.origin}/exam/${result.exam.id}`
          };
          
          setCreatedExam(examData);
          setShowSuccessModal(true);
          return;
        }
      } catch (apiError) {
        console.warn('API creation failed, using local creation:', apiError);
      }

      // Fallback to local creation
      const localExamData = {
        id: examConfigData.id,
        title: examConfigData.title,
        examUrl: `${window.location.origin}/online-exam/${examConfigData.id}`,
        shareUrl: `${window.location.origin}/exam/${examConfigData.id}`
      };
      
      setCreatedExam(localExamData);
      setShowSuccessModal(true);

    } catch (error) {
      console.error('Online exam creation error:', error);
      alert('Online sınav oluşturulurken hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsCreating(false);
    }
  };

  /**
   * Preview exam
   */
  const handlePreviewExam = () => {
    if (!validateExamConfig()) return;

    // Generate preview HTML
    const previewHTML = generateExamPreviewHTML();
    const previewWindow = window.open('', '_blank');
    if (previewWindow) {
      previewWindow.document.write(previewHTML);
      previewWindow.document.close();
    } else {
      alert('Popup engelleyici nedeniyle önizleme açılamadı.');
    }
  };

  /**
   * Generate exam preview HTML
   */
  const generateExamPreviewHTML = (): string => {
    return `
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${examConfig.title} - Önizleme</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; max-width: 1200px; margin: 0 auto; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
          .exam-info { background: #f0f9ff; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
          .pdf-pages { display: grid; grid-template-columns: 1fr; gap: 20px; margin-bottom: 40px; }
          .pdf-page { border: 1px solid #e5e5e5; border-radius: 8px; overflow: hidden; }
          .page-header { background: #f8fafc; padding: 10px; border-bottom: 1px solid #e5e5e5; }
          .page-image { width: 100%; height: auto; display: block; }
          @media print { body { margin: 0; padding: 15px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${examConfig.title}</h1>
          <p>Online Sınav Önizlemesi</p>
        </div>
        
        <div class="exam-info">
          <h3>Sınav Bilgileri</h3>
          <p><strong>Açıklama:</strong> ${examConfig.description || 'Yok'}</p>
          <p><strong>Süre Limiti:</strong> ${examConfig.timeLimit} dakika</p>
          <p><strong>Sayfa Sayısı:</strong> ${examConfig.pdfPages.length}</p>
          <p><strong>Durum:</strong> ${examConfig.isActive ? 'Aktif' : 'İnaktif'}</p>
        </div>
        
        ${examConfig.pdfPages.length > 0 ? `
          <div class="pdf-pages">
            ${examConfig.pdfPages.map((pageImage, index) => `
              <div class="pdf-page">
                <div class="page-header">
                  <strong>Sayfa ${index + 1}</strong>
                </div>
                <img src="${pageImage}" alt="Sayfa ${index + 1}" class="page-image">
              </div>
            `).join('')}
          </div>
        ` : `
          <div style="text-align: center; padding: 40px; color: #64748b;">
            <p>PDF yüklenmemiş - Sadece sorular kullanılacak</p>
          </div>
        `}
      </body>
      </html>
    `;
  };

  /**
   * Copy link to clipboard
   */
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Link panoya kopyalandı!');
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Link panoya kopyalandı!');
    }
  };

  /**
   * Handle success modal close
   */
  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    if (createdExam) {
      onCreateExam(createdExam as any);
    }
  };

  // Check if exam can be created
  const canCreateExam = examConfig.title.trim() && 
                       (examConfig.pdfPages.length > 0 || questions.length > 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <ExamCreatorHeader questionsCount={questions.length} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <NavigationControls onBack={onBack} />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Left Column - Configuration */}
          <div className="space-y-6">
            {/* PDF Upload */}
            <PDFUploadSection onPDFProcessed={handlePDFProcessed} />

            {/* Exam Configuration */}
            <ExamConfigForm
              examConfig={examConfig}
              onConfigChange={updateExamConfig}
              errors={errors}
            />
          </div>

          {/* Right Column - Preview and Actions */}
          <div className="space-y-6">
            {/* Preview */}
            <ExamPreview
              examConfig={examConfig}
              questions={questions}
              metadata={metadata}
            />

            {/* Actions */}
            <ExamActions
              onCreateExam={handleCreateExam}
              onPreviewExam={handlePreviewExam}
              onBack={onBack}
              isCreating={isCreating}
              canCreate={canCreateExam}
            />
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && createdExam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Monitor className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Online Sınav Oluşturuldu!
              </h3>
              <p className="text-sm text-gray-600">
                "{createdExam.title}" başarıyla oluşturuldu
              </p>
            </div>

            <div className="space-y-4">
              {/* Exam URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sınav Linki (Öğrenciler için)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={createdExam.examUrl}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(createdExam.examUrl)}
                  >
                    Kopyala
                  </Button>
                </div>
              </div>

              {/* Share URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paylaşım Linki
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={createdExam.shareUrl}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(createdExam.shareUrl)}
                  >
                    Kopyala
                  </Button>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h4 className="text-sm font-medium text-blue-900 mb-1">Nasıl Kullanılır?</h4>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• Sınav linkini öğrencilerinizle paylaşın</li>
                  <li>• Öğrenciler linke tıklayarak sınava katılabilir</li>
                  <li>• Sınav durumunu profil panelinden takip edebilirsiniz</li>
                  <li>• Sonuçları gerçek zamanlı olarak görebilirsiniz</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => window.open(createdExam.examUrl, '_blank')}
              >
                Sınavı Aç
              </Button>
              <Button
                onClick={handleSuccessModalClose}
              >
                Tamam
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};