import React, { useState } from 'react';
import { Download, FileText, Eye, Printer, Save, BookOpen, Monitor } from 'lucide-react';
import { Button } from '../ui/Button';
import { ThemeSelector } from '../forms/ThemeSelector';
import { WatermarkConfig } from '../forms/WatermarkConfig';
import { TestMetadata, CroppedQuestion, ManualQuestion, TestSourceType } from '../../types';
import { ThemeType, WatermarkConfig as WatermarkConfigType } from '../../types/themes';
import { generateThemedTestPDF } from '../../utils/pdf/themedCore';
import { generateTestFilename } from '../../utils/pdfRender';
import { BookletCreator } from '../kitapcik/BookletCreator';

/**
 * Themed Test Builder Wizard Component
 * Handles both PDF cropped questions and manual questions
 */

interface ThemedTestBuilderWizardProps {
  sourceType: TestSourceType;
  questions?: CroppedQuestion[];
  manualQuestions?: ManualQuestion[];
  metadata: TestMetadata;
  onBack: () => void;
}

export const ThemedTestBuilderWizard: React.FC<ThemedTestBuilderWizardProps> = ({
  sourceType,
  questions = [],
  manualQuestions = [],
  metadata,
  onBack
}) => {
  const [selectedTheme, setSelectedTheme] = useState<ThemeType>('classic');
  const [watermarkConfig, setWatermarkConfig] = useState<WatermarkConfigType>({ type: 'none' });
  const [includeAnswerKey, setIncludeAnswerKey] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showBookletCreator, setShowBookletCreator] = useState(false);

  // Get the appropriate questions based on source type
  const getQuestions = (): CroppedQuestion[] => {
    if (sourceType === 'manual') {
      // Convert manual questions to cropped question format
      return manualQuestions.map(mq => convertManualToCropped(mq));
    }
    return questions;
  };

  /**
   * Convert manual question to cropped question format
   */
  const convertManualToCropped = (manualQuestion: ManualQuestion): CroppedQuestion => {
    // Validate manual question data
    if (!manualQuestion || !manualQuestion.id) {
      console.warn('Invalid manual question data:', manualQuestion);
      return {
        id: `fallback_${Date.now()}`,
        imageData: '',
        correctAnswer: 'A',
        order: 0,
        cropArea: { x: 0, y: 0, width: 800, height: 600, pageNumber: 1 },
        actualWidth: 800,
        actualHeight: 600
      };
    }
    
    // Create a larger, high-quality text-based image representation
    let imageData = '';
    
    try {
      imageData = manualQuestion.imageData || createHighQualityTextImage(manualQuestion);
    } catch (imageError) {
      console.warn('Image creation failed for question:', manualQuestion.id, imageError);
      // Create a simple fallback image
      imageData = createSimpleFallbackImage(manualQuestion);
    }
    
    return {
      id: manualQuestion.id,
      imageData,
      correctAnswer: manualQuestion.correctAnswer,
      order: manualQuestion.order,
      cropArea: { x: 0, y: 0, width: 1200, height: 900, pageNumber: 1 },
      actualWidth: 1200,
      actualHeight: 900
    };
  };

  /**
   * Create a high-quality, larger text-based image for questions without images
   */
  const createHighQualityTextImage = (manualQuestion: ManualQuestion): string => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return '';
    
    // Set much larger canvas size for better PDF quality
    canvas.width = 1200;
    canvas.height = 900;
    
    // Set background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add subtle border
    ctx.strokeStyle = '#e5e5e5';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
    
    // Set larger text style for better PDF readability
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 36px Arial, sans-serif';
    
    let y = 60;
    
    // Draw question text
    const questionLines = wrapText(ctx, manualQuestion.questionText, canvas.width - 120);
    questionLines.forEach(line => {
      ctx.fillText(line, 40, y);
      y += 50;
    });
    
    y += 40;
    
    // Set font for options (still large for PDF quality)
    ctx.font = '28px Arial, sans-serif';
    
    // Draw options
    Object.entries(manualQuestion.options).forEach(([key, value]) => {
      const optionText = `${key}) ${value}`;
      const optionLines = wrapText(ctx, optionText, canvas.width - 120);
      optionLines.forEach(line => {
        ctx.fillText(line, 60, y);
        y += 40;
      });
      y += 20;
    });
    
    return canvas.toDataURL('image/png');
  };

  /**
   * Wrap text to fit within canvas width
   */
  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + ' ' + word).width;
      if (width < maxWidth) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  };

  /**
   * Create a simple fallback image
   */
  const createSimpleFallbackImage = (manualQuestion: ManualQuestion): string => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return '';
    
    canvas.width = 800;
    canvas.height = 600;
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#333333';
    ctx.font = '24px Arial, sans-serif';
    ctx.fillText('Soru yüklenemedi', 40, 60);
    
    return canvas.toDataURL('image/png');
  };

  /**
   * Generate and download PDF
   */
  const handleGeneratePDF = async () => {
    // Validate questions before PDF generation
    const processedQuestions = getQuestions();
    
    if (!processedQuestions || processedQuestions.length === 0) {
      alert('PDF oluşturmak için en az 1 soru gereklidir');
      return;
    }
    
    // Validate metadata
    if (!metadata) {
      alert('Test metadata bilgisi eksik. PDF oluşturulamaz.');
      return;
    }
    
    setIsGenerating(true);
    
    try {
      console.log('🔄 PDF Generation started:', {
        sourceType,
        questionsCount: processedQuestions.length,
        theme: selectedTheme,
        hasWatermark: watermarkConfig.type !== 'none'
      });
      
      const pdfBytes = await generateThemedTestPDF(metadata, processedQuestions, {
        theme: selectedTheme,
        watermark: watermarkConfig,
        includeAnswerKey
      });
      
      console.log('✅ PDF Generated successfully, size:', pdfBytes.length, 'bytes');
      
      // Create download link
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = generateTestFilename(metadata);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log('✅ PDF Download completed');
      
    } catch (error) {
      console.error('PDF oluşturma hatası:', error);
      
      // Enhanced error handling with specific messages
      let errorMessage = 'PDF oluşturulurken bir hata oluştu.';
      
      if (error instanceof Error) {
        if (error.message.includes('memory') || error.message.includes('quota')) {
          errorMessage = 'Bellek yetersiz. Daha az soru ile tekrar deneyin.';
        } else if (error.message.includes('image') || error.message.includes('embed')) {
          errorMessage = 'Soru görselleri işlenirken hata oluştu. Soruları kontrol edin.';
        } else if (error.message.includes('theme')) {
          errorMessage = 'Tema yüklenirken hata oluştu. Farklı tema deneyin.';
        }
      }
      
      alert(errorMessage + ' Lütfen tekrar deneyin.');
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Generate HTML preview
   */
  const handlePreview = () => {
    const processedQuestions = getQuestions();
    const htmlContent = generateTestHTML(processedQuestions);
    const previewWindow = window.open('', '_blank');
    if (previewWindow) {
      previewWindow.document.write(htmlContent);
      previewWindow.document.close();
    } else {
      alert('Popup engelleyici nedeniyle önizleme açılamadı.');
    }
  };

  /**
   * Generate HTML for preview/print
   */
  const generateTestHTML = (processedQuestions: CroppedQuestion[]): string => {
    const currentDate = new Date().toLocaleDateString('tr-TR');
    
    return `
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${metadata.testName || 'Test'}</title>
        <style>
          body { font-family: 'Times New Roman', serif; line-height: 1.6; max-width: 1200px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
          .questions-container { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 40px; }
          .question { break-inside: avoid; margin-bottom: 20px; padding: 15px; border: 1px solid #e5e5e5; border-radius: 8px; }
          .question-number { font-weight: bold; margin-bottom: 10px; font-size: 16px; }
          .question-image { max-width: 100%; height: auto; margin-bottom: 10px; border: 1px solid #ddd; border-radius: 4px; }
          .answer-key { page-break-before: always; margin-top: 40px; padding-top: 20px; border-top: 2px solid #333; }
          .answer-grid { display: grid; grid-template-columns: repeat(10, 1fr); gap: 10px; max-width: 800px; margin: 0 auto; }
          .answer-item { text-align: center; padding: 8px 4px; border: 1px solid #333; font-weight: bold; font-size: 12px; }
          @media print { body { margin: 0; padding: 15px; } .question { break-inside: avoid; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${metadata.testName || 'TEST'}</h1>
          <p>Kaynak: ${sourceType === 'manual' ? 'Manuel Oluşturulmuş' : 'PDF\'den Kırpılmış'} | Tarih: ${currentDate}</p>
        </div>
        <div class="questions-container">
          ${processedQuestions.map((question, index) => `
            <div class="question">
              <div class="question-number">${index + 1}.</div>
              <img src="${question.imageData}" alt="Soru ${index + 1}" class="question-image">
            </div>
          `).join('')}
        </div>
        ${includeAnswerKey ? `
          <div class="answer-key">
            <h2>CEVAP ANAHTARI</h2>
            <div class="answer-grid">
              ${processedQuestions.map((question, index) => `
                <div class="answer-item">${index + 1}.${question.correctAnswer}</div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </body>
      </html>
    `;
  };

  /**
   * Handle print
   */
  const handlePrint = () => {
    const processedQuestions = getQuestions();
    const htmlContent = generateTestHTML(processedQuestions);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    } else {
      alert('Popup engelleyici nedeniyle yazdırma açılamadı.');
    }
  };

  /**
   * Handle booklet creation
   */
  const handleCreateBooklet = () => {
    const processedQuestions = getQuestions();
    
    if (!processedQuestions || processedQuestions.length === 0) {
      alert('Kitapçık oluşturmak için önce sorular gerekli');
      return;
    }
    
    if (!metadata) {
      alert('Test metadata bilgisi eksik. Kitapçık oluşturulamaz.');
      return;
    }
    
    console.log('📚 Creating booklet with:', {
      questionsCount: processedQuestions.length,
      theme: selectedTheme,
      metadata: metadata
    });
    
    setShowBookletCreator(true);
  };

  /**
   * Handle booklet creation completion
   */
  const handleBookletCreated = () => {
    alert('Kitapçık başarıyla oluşturuldu!');
    setShowBookletCreator(false);
  };

  const processedQuestions = getQuestions();

  // Show booklet creator if requested
  if (showBookletCreator) {
    return (
      <BookletCreator
        metadata={metadata}
        questions={processedQuestions}
        theme={selectedTheme}
        onBack={() => setShowBookletCreator(false)}
        onSave={handleBookletCreated}
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Test Kitapçığı Oluştur</h2>
          <p className="text-gray-600">
            {sourceType === 'manual' 
              ? `${manualQuestions.length} manuel soru ile test oluşturun`
              : `${questions.length} kırpılmış soru ile test oluşturun`
            }
          </p>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="bg-gray-50 rounded-lg p-4">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>{sourceType === 'manual' ? 'Soru Editörüne Dön' : 'Test Oluşturucuya Dön'}</span>
        </Button>
      </div>

      {/* Source Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Test Bilgileri</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-blue-800">
          <div><strong>Kaynak:</strong> {sourceType === 'manual' ? 'Manuel' : 'PDF Kırpma'}</div>
          <div><strong>Soru Sayısı:</strong> {processedQuestions.length}</div>
          <div><strong>Test Adı:</strong> {metadata.testName || 'Test'}</div>
          <div><strong>Durum:</strong> Hazır</div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Left Column - Theme and Settings */}
        <div className="space-y-6">
          {/* Theme Selection */}
          <ThemeSelector
            selectedTheme={selectedTheme}
            onThemeChange={setSelectedTheme}
          />

          {/* Watermark Configuration */}
          <WatermarkConfig
            watermark={watermarkConfig}
            onWatermarkChange={setWatermarkConfig}
          />

          {/* Advanced Settings */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900">Gelişmiş Ayarlar</h4>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={includeAnswerKey}
                onChange={(e) => setIncludeAnswerKey(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Cevap anahtarını dahil et</span>
            </label>
          </div>
        </div>

        {/* Right Column - Preview */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-4">Soru Önizlemesi</h4>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {processedQuestions.slice(0, 5).map((question, index) => (
                <div key={question.id} className="border border-gray-200 rounded p-3 bg-gray-50">
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
                      <div><strong>Kaynak:</strong> {sourceType === 'manual' ? 'Manuel' : 'PDF'}</div>
                    </div>
                  </div>
                </div>
              ))}
              
              {processedQuestions.length > 5 && (
                <div className="text-center text-blue-600 text-sm">
                  +{processedQuestions.length - 5} soru daha
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => {
                window.location.href = '/online-exam';
              }}
              icon={Monitor}
              size="lg"
              fullWidth
              className="bg-green-600 hover:bg-green-700"
            >
              Online Sınav Oluştur ({processedQuestions.length} soru)
            </Button>
            
            <Button
              onClick={handleGeneratePDF}
              isLoading={isGenerating}
              icon={Download}
              size="lg"
              fullWidth
            >
              {isGenerating ? 'PDF Oluşturuluyor...' : 'PDF İndir'}
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
            
            <div className="pt-2">
              <Button
                onClick={handleCreateBooklet}
                icon={BookOpen}
                size="lg"
                fullWidth
                variant="secondary"
              >
                Kitapçık Oluştur (A-E Versiyonları)
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};