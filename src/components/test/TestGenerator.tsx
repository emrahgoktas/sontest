import React, { useState } from 'react';
import { Download, FileText, ArrowLeft, Eye, Printer, BookPlus, Monitor, Save } from 'lucide-react';
import { Button } from '../ui/Button';
import { SaveTestModal } from './SaveTestModal';
import { BookletCreator } from '../kitapcik/BookletCreator';
import { OnlineExamCreator } from '../onlineExam/OnlineExamCreator';
import { TestMetadata, CroppedQuestion, SavedTest } from '../../types';
import { BookletSet, OnlineExamConfig } from '../../types/booklet';
import { generateTestFilename } from '../../utils/pdfRender';
import { generateThemedTestPDF } from '../../utils/pdf/themedCore';
import { ThemeType, WatermarkConfig } from '../../types/themes';

/**
 * Test Generator Component
 * Creates and exports the final test PDF with theme support
 */

interface TestGeneratorProps {
  metadata: TestMetadata;
  questions: CroppedQuestion[];
  onPrevious: () => void;
  onRestart: () => void;
}

export const TestGenerator: React.FC<TestGeneratorProps> = ({
  metadata,
  questions,
  onPrevious,
  onRestart
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGeneratedPDF, setLastGeneratedPDF] = useState<Uint8Array | null>(null);
  const [currentView, setCurrentView] = useState<'main' | 'booklet' | 'online'>('main');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedTests, setSavedTests] = useState<SavedTest[]>(() => {
    // Load saved tests from localStorage
    const saved = localStorage.getItem('savedTests');
    return saved ? JSON.parse(saved) : [];
  });

  // Extract theme and watermark settings from metadata
  const getThemeSettings = () => {
    const customFields = (metadata as any).customFields;
    if (!customFields) {
      return { 
        theme: 'classic' as ThemeType, 
        watermark: { type: 'none' as const },
        includeAnswerKey: true
      };
    }

    const theme = customFields.selectedTheme || 'classic';
    let watermark = { type: 'none' as const };
    let includeAnswerKey = true;
    
    try {
      if (customFields.watermarkConfig) {
        watermark = JSON.parse(customFields.watermarkConfig);
      }
      if (customFields.includeAnswerKey) {
        includeAnswerKey = customFields.includeAnswerKey === 'true';
      }
    } catch (error) {
      console.warn('Failed to parse settings:', error);
    }

    return { theme, watermark, includeAnswerKey };
  };

  /**
   * Generate and download test PDF using themed system
   */
  const handleGenerateTestPDF = async () => {
    setIsGenerating(true);
    
    try {
      const { theme, watermark, includeAnswerKey } = getThemeSettings();
      
      const pdfBytes = await generateThemedTestPDF(metadata, questions, {
        theme,
        watermark,
        includeAnswerKey // Pass the checkbox state to PDF generation
      });
      
      // Store the generated PDF for preview and print
      setLastGeneratedPDF(pdfBytes);
      
      // Create download link
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = generateTestFilename(metadata);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('PDF oluşturma hatası:', error);
      alert('PDF oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Generate HTML content for responsive web preview
   */
  const generateTestHTML = (): string => {
    const currentDate = new Date().toLocaleDateString('tr-TR');
    
    return `
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${generateTestFilename(metadata)}</title>
        <style>
          body {
            font-family: 'Times New Roman', serif;
            line-height: 1.6;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            margin: 0 0 10px 0;
            font-size: 24px;
            font-weight: bold;
          }
          .header-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-top: 15px;
            font-size: 14px;
            text-align: left;
          }
          .questions-container {
            margin-bottom: 40px;
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
          }
          .question {
            break-inside: avoid;
            page-break-inside: avoid;
            margin-bottom: 20px;
            padding: 15px;
            border: 1px solid #e5e5e5;
            border-radius: 8px;
            background: #fafafa;
          }
          .question-number {
            font-weight: bold;
            margin-bottom: 10px;
            font-size: 16px;
            color: #333;
          }
          .question-image {
            max-width: 100%;
            height: auto;
            margin-bottom: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            display: block;
          }
          .answer-key {
            page-break-before: always;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #333;
          }
          .answer-key h2 {
            text-align: center;
            margin-bottom: 20px;
          }
          .answer-grid {
            display: grid;
            grid-template-columns: repeat(10, 1fr);
            gap: 10px;
            max-width: 800px;
            margin: 0 auto;
          }
          .answer-item {
            text-align: center;
            padding: 8px 4px;
            border: 1px solid #333;
            font-weight: bold;
            font-size: 12px;
          }
          
          /* Mobile responsive */
          @media (max-width: 768px) {
            .questions-container {
              grid-template-columns: 1fr;
            }
            .header-info {
              grid-template-columns: 1fr;
              gap: 10px;
              text-align: center;
            }
            .answer-grid {
              grid-template-columns: repeat(5, 1fr);
              gap: 8px;
            }
            .answer-item {
              font-size: 11px;
              padding: 6px 2px;
            }
          }
          
          @media print {
            body { 
              margin: 0; 
              padding: 15px; 
              max-width: none;
            }
            .question { 
              break-inside: avoid; 
              border: 1px solid #ccc;
              background: white;
            }
          }
        </style>
      </head>
      <body>
        <!-- Test Header -->
        <div class="header">
          <h1>${metadata.testName || 'TEST'}</h1>
          <div class="header-info">
            <div>
              ${metadata.className ? `<strong>Sınıf:</strong> ${metadata.className}<br>` : ''}
              ${metadata.courseName ? `<strong>Ders:</strong> ${metadata.courseName}` : ''}
            </div>
            <div>
              ${metadata.teacherName ? `<strong>Öğretmen:</strong> ${metadata.teacherName}<br>` : ''}
              <strong>Tarih:</strong> ${currentDate}
            </div>
          </div>
        </div>

        <!-- Questions Container -->
        <div class="questions-container">
          ${questions.map((question, index) => `
            <div class="question">
              <div class="question-number">${index + 1}.</div>
              <img src="${question.imageData}" alt="Soru ${index + 1}" class="question-image">
            </div>
          `).join('')}
        </div>

        <!-- Answer Key -->
        <div class="answer-key">
          <h2>CEVAP ANAHTARI</h2>
          <div class="answer-grid">
            ${questions.map((question, index) => `
              <div class="answer-item">
                ${index + 1}.${question.correctAnswer}
              </div>
            `).join('')}
          </div>
        </div>
      </body>
      </html>
    `;
  };

  /**
   * Generate themed PDF preview (creates PDF in memory for preview)
   */
  const handleThemedPreview = async () => {
    try {
      console.log('🔄 Temalı PDF önizleme başlatılıyor...');
      
      const { theme, watermark, includeAnswerKey } = getThemeSettings();
      
      // Generate themed PDF in memory
      const pdfBytes = await generateThemedTestPDF(metadata, questions, {
        theme,
        watermark,
        includeAnswerKey
      });
      
      console.log('✅ Temalı PDF oluşturuldu, boyut:', pdfBytes.length, 'bytes');
      
      // Create blob and open in new window for preview
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const previewWindow = window.open(url, '_blank');
      
      if (!previewWindow) {
        alert('Popup engelleyici nedeniyle temalı önizleme açılamadı. Lütfen popup engelleyiciyi devre dışı bırakın.');
      } else {
        console.log('✅ Temalı PDF önizleme açıldı');
        
        // Store the generated PDF for potential download
        setLastGeneratedPDF(pdfBytes);
        
        // Clean up URL after 30 seconds
        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 30000);
      }
      
    } catch (error) {
      console.error('Temalı PDF önizleme hatası:', error);
      alert('Temalı PDF önizlemesi oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  /**
   * Show test preview in new window with responsive layout
   */
  const handleShowPreview = () => {
    if (lastGeneratedPDF) {
      // Show PDF preview if available
      const blob = new Blob([lastGeneratedPDF as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const previewWindow = window.open(url, '_blank');
      if (!previewWindow) {
        alert('Popup engelleyici nedeniyle önizleme açılamadı. Lütfen popup engelleyiciyi devre dışı bırakın.');
      }
    } else {
      // Fallback to HTML preview
      const testContent = generateTestHTML();
      const previewWindow = window.open('', '_blank');
      if (previewWindow) {
        previewWindow.document.write(testContent);
        previewWindow.document.close();
      } else {
        alert('Popup engelleyici nedeniyle önizleme açılamadı. Lütfen popup engelleyiciyi devre dışı bırakın.');
      }
    }
  };

  /**
   * Print test using browser print
   */
  const handlePrintTest = () => {
    if (lastGeneratedPDF) {
      // Print PDF if available
      const blob = new Blob([lastGeneratedPDF as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const printWindow = window.open(url, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      } else {
        alert('Popup engelleyici nedeniyle yazdırma açılamadı. Lütfen popup engelleyiciyi devre dışı bırakın.');
      }
    } else {
      // Fallback to HTML print
      const testContent = generateTestHTML();
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(testContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
      } else {
        alert('Popup engelleyici nedeniyle yazdırma açılamadı. Lütfen popup engelleyiciyi devre dışı bırakın.');
      }
    }
  };

  /**
   * Handle save test
   */
  const handleSaveTest = async (testData: { title: string; description?: string; lesson: string; questions?: any[] }) => {
    setIsSaving(true);
    
    try {
      // Test already saved to database in SaveTestModal
      // Just update local state for UI
      if (testData.questions) {
        const newTest: SavedTest = {
          id: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: testData.title,
          description: testData.description,
          lesson: testData.lesson,
          questions: testData.questions,
          metadata: metadata,
          createdAt: new Date()
        };
        
        const updatedTests = [newTest, ...savedTests];
        setSavedTests(updatedTests);
        
        // Save to localStorage for local reference
        localStorage.setItem('savedTests', JSON.stringify(updatedTests));
      }
      
      setShowSaveModal(false);
      
      // Show success message
      alert('Test veritabanına başarıyla kaydedildi! Artık bu testi kitapçık oluşturmak için kullanabilirsiniz.');
      
    } catch (error) {
      console.error('Test kaydetme hatası:', error);
      alert('Test kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Kitapçık oluşturma ekranına geçiş
   */
  const handleCreateBooklet = () => {
    setCurrentView('booklet');
  };

  /**
   * Online sınav oluşturma ekranına geçiş
   */
  const handleCreateOnlineExam = () => {
    setCurrentView('online');
  };

  /**
   * Kitapçık kaydedildiğinde
   */
  const handleBookletSaved = (bookletSet: BookletSet) => {
    console.log('Kitapçık seti kaydedildi:', bookletSet);
    alert('Kitapçık seti başarıyla oluşturuldu ve arşive kaydedildi!');
    setCurrentView('main');
  };

  /**
   * Online sınav oluşturulduğunda
   */
  const handleOnlineExamCreated = (examConfig: OnlineExamConfig) => {
    console.log('Online sınav oluşturuldu:', examConfig);
    alert('Online sınav başarıyla oluşturuldu!');
    setCurrentView('main');
  };

  /**
   * Ana ekrana dönüş
   */
  const handleBackToMain = () => {
    setCurrentView('main');
  };

  // Kitapçık oluşturma ekranı
  if (currentView === 'booklet') {
    return (
      <BookletCreator
        metadata={metadata}
        questions={questions}
        theme={getThemeSettings().theme}
        onBack={handleBackToMain}
        onSave={handleBookletSaved}
      />
    );
  }

  // Online sınav oluşturma ekranı
  if (currentView === 'online') {
    return (
      <OnlineExamCreator
        metadata={metadata}
        questions={questions}
        onCreateExam={handleOnlineExamCreated}
        onBack={handleBackToMain}
      />
    );
  }

  // Calculate estimated pages (conservative estimate since layout is now dynamic)
  const estimatedPages = Math.ceil(questions.length / 8) + 1; // Conservative estimate + answer key
  const { theme, watermark, includeAnswerKey } = getThemeSettings();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Test Oluşturma Tamamlandı!
        </h2>
        <p className="text-gray-600">
          Testiniz seçilen tema ve ayarlarla hazır. Her soru gerçek boyutlarında optimal şekilde yerleştirilmiştir.
        </p>
      </div>

      {/* Test Summary */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
          <FileText className="mr-2" size={20} />
          Test Özeti
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Test Info */}
          <div className="space-y-3">
            <h4 className="font-medium text-green-800">Test Bilgileri</h4>
            <div className="space-y-2 text-sm text-green-700">
              {metadata.testName && (
                <div><strong>Test Adı:</strong> {metadata.testName}</div>
              )}
              {metadata.className && (
                <div><strong>Sınıf:</strong> {metadata.className}</div>
              )}
              {metadata.courseName && (
                <div><strong>Ders:</strong> {metadata.courseName}</div>
              )}
              {metadata.teacherName && (
                <div><strong>Öğretmen:</strong> {metadata.teacherName}</div>
              )}
            </div>
          </div>

          {/* Theme and Layout Info */}
          <div className="space-y-3">
            <h4 className="font-medium text-green-800">Tema ve Düzen</h4>
            <div className="space-y-2 text-sm text-green-700">
              <div><strong>Seçilen Tema:</strong> {theme}</div>
              <div><strong>Soru Sayısı:</strong> {questions.length}</div>
              <div><strong>Filigran:</strong> {watermark.type === 'none' ? 'Yok' : (watermark as any).content || 'Var'}</div>
              <div><strong>Cevap Anahtarı:</strong> {includeAnswerKey ? 'Dahil' : 'Dahil Değil'}</div>
              <div><strong>Tahmini Sayfa:</strong> {includeAnswerKey ? estimatedPages : estimatedPages - 1}</div>
            </div>
          </div>

          {/* Answer Distribution */}
          <div className="space-y-3">
            <h4 className="font-medium text-green-800">Cevap Dağılımı</h4>
            <div className="space-y-2 text-sm text-green-700">
              {['A', 'B', 'C', 'D', 'E'].map(choice => {
                const count = questions.filter(q => q.correctAnswer === choice).length;
                return count > 0 ? (
                  <div key={choice}>
                    <strong>{choice} Şıkkı:</strong> {count} soru
                  </div>
                ) : null;
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Theme Features */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2 flex items-center">
          <FileText className="mr-2" size={20} />
          Seçilen Tema Özellikleri
        </h3>
        <div className="text-sm text-blue-800 space-y-2">
          <p><strong>✓ Tema:</strong> {theme} - Her tema kendine özgü görünüm ve düzen</p>
          <p><strong>✓ Gerçek Boyutlar:</strong> Sorular asla küçültülmez, gerçek boyutlarında yerleştirilir</p>
          <p><strong>✓ Akıllı Yerleşim:</strong> Soru sığmıyorsa otomatik olarak sonraki sütuna/sayfaya geçer</p>
          <p><strong>✓ Tema Renkleri:</strong> Her tema kendine özgü renk paleti kullanır</p>
          {watermark.type !== 'none' && (
            <p><strong>✓ Filigran:</strong> Tüm sayfalarda tema uyumlu filigran</p>
          )}
          <p><strong>✓ Cevap Anahtarı:</strong> {includeAnswerKey ? 'Son sayfada dahil edildi' : 'Dahil edilmedi'}</p>
        </div>
      </div>

      {/* Question Preview */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Soru Önizlemesi
        </h3>
        
        <div className="space-y-4 max-h-96 overflow-y-auto border border-gray-100 rounded-lg p-4">
          {questions.slice(0, 8).map((question, index) => (
            <div key={question.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Soru {index + 1}
                  </div>
                  <img
                    src={question.imageData}
                    alt={`Soru ${index + 1}`}
                    className="max-w-32 max-h-24 object-contain bg-white rounded border"
                  />
                </div>
                <div className="flex-1 space-y-1 text-xs text-gray-500">
                  <div><strong>Doğru Cevap:</strong> {question.correctAnswer}</div>
                  <div><strong>Gerçek Boyut:</strong> {question.actualWidth}×{question.actualHeight} piksel</div>
                  <div><strong>Aspect Ratio:</strong> {(question.actualWidth / question.actualHeight).toFixed(2)}</div>
                  <div><strong>Tema:</strong> {theme} teması ile yerleştirilecek</div>
                </div>
              </div>
            </div>
          ))}
          
          {questions.length > 8 && (
            <div className="border border-gray-200 rounded-lg p-3 flex items-center justify-center bg-blue-50">
              <div className="text-center text-blue-600">
                <div className="text-sm font-medium">+{questions.length - 8} soru daha</div>
                <div className="text-xs">Her soru seçilen tema ile gerçek boyutlarında PDF'de yer alacak</div>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-4 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
          <strong>Tema Sistemi:</strong> Seçilen "{theme}" teması ile her soru kendi gerçek boyutlarında yerleştirilir. 
          Tema, sayfa düzeni, renkler, başlık ve filigran görünümünü belirler.
          Hiçbir soru zorla küçültülmez veya sığdırılmaz.
          {includeAnswerKey ? ' Cevap anahtarı son sayfada yer alacak.' : ' Cevap anahtarı dahil edilmeyecek.'}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-4">
        {/* Primary Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onPrevious}
            icon={ArrowLeft}
          >
            Geri
          </Button>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={handleThemedPreview}
              icon={Eye}
            >
              Önizleme
            </Button>
            
            <Button
              variant="outline"
              onClick={handlePrintTest}
              icon={Printer}
            >
              Yazdır
            </Button>
            
            <Button
              onClick={() => setShowSaveModal(true)}
              icon={Save}
              variant="secondary"
            >
              Testi Kaydet
            </Button>
            
            <Button
              onClick={handleGenerateTestPDF}
              isLoading={isGenerating}
              icon={Download}
              size="lg"
            >
              {isGenerating ? 'PDF Oluşturuluyor...' : 'İndir'}
            </Button>
          </div>
        </div>

        {/* Extended Features */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-3">Gelişmiş Özellikler</h4>
          <p className="text-sm text-blue-800 mb-4">
            Testinizi kitapçık haline getirin veya online sınav olarak yayınlayın
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => {
                window.location.href = '/online-exam';
              }}
              icon={Monitor}
              variant="secondary"
            >
              Online Sınav Oluştur
            </Button>
            
            <Button
              onClick={handleCreateBooklet}
              icon={BookPlus}
              variant="secondary"
            >
              Kitapçık Oluştur
            </Button>
          </div>
        </div>
      </div>

      {/* Start Over Button */}
      <div className="text-center pt-4 border-t border-gray-200">
        <Button
          variant="ghost"
          onClick={onRestart}
          className="text-gray-600"
        >
          Yeni Test Oluştur
        </Button>
      </div>

      {/* Save Test Modal */}
      <SaveTestModal
      isOpen={showSaveModal}
      onClose={() => setShowSaveModal(false)}
      onSave={handleSaveTest}
      isLoading={isSaving}
      questions={questions}
      theme={getThemeSettings().theme}                  // ▼ eklendi
      watermarkConfig={getThemeSettings().watermark}    // ▼ eklendi
      includeAnswerKey={getThemeSettings().includeAnswerKey} // ▼ eklendi
      />
    </div>
  );
};