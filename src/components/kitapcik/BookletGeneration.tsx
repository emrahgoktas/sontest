import React, { useState } from 'react';
import { ArrowLeft, Download, Check, FileText, Printer, Eye } from 'lucide-react';
import { Button } from '../ui/Button';
import { TestMetadata } from '../../types';
import { ThemeType } from '../../types/themes';
import { Booklet, BookletSet } from '../../types/booklet';

/**
 * Kitapçık Oluşturma ve Kaydetme Bileşeni
 * Final PDF oluşturma ve arşivleme işlemleri
 */

interface BookletGenerationProps {
  booklets: Booklet[];
  metadata: TestMetadata;
  theme: ThemeType;
  onSave: (bookletSet: BookletSet) => void;
  onBack: () => void;
}

export const BookletGeneration: React.FC<BookletGenerationProps> = ({
  booklets,
  metadata,
  theme,
  onSave,
  onBack
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPDFs, setGeneratedPDFs] = useState<Record<string, Uint8Array>>({});
  const [generationProgress, setGenerationProgress] = useState(0);

  /**
   * Tüm kitapçıkları PDF olarak oluşturma
   */
  const generateAllPDFs = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      const pdfs: Record<string, Uint8Array> = {};
      
      for (let i = 0; i < booklets.length; i++) {
        const booklet = booklets[i];
        
        // Mock PDF generation - gerçek implementasyonda theme-based PDF oluşturulacak
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate generation time
        
        // Mock PDF bytes
        const mockPDFBytes = new Uint8Array([1, 2, 3, 4, 5]); // Placeholder
        pdfs[booklet.version] = mockPDFBytes;
        
        setGenerationProgress(((i + 1) / booklets.length) * 100);
      }
      
      setGeneratedPDFs(pdfs);
    } catch (error) {
      console.error('PDF oluşturma hatası:', error);
      alert('PDF oluşturulurken hata oluştu');
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Tek kitapçık PDF indirme
   */
  const downloadBookletPDF = (booklet: Booklet) => {
    try {
      // Generate PDF for the specific booklet using themed system
      const generatePDF = async () => {
        const { generateThemedTestPDF } = await import('../../utils/pdf/themedCore');
        
        const pdfBytes = await generateThemedTestPDF(metadata, booklet.questions, {
          theme,
          includeAnswerKey: true
        });
        
        // Create download link
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Kitapcik_${booklet.version}_${metadata.testName || 'Test'}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      };
      
      generatePDF();
    } catch (error) {
      console.error('PDF indirme hatası:', error);
      alert('PDF oluşturulurken hata oluştu');
    }
  };

  /**
   * Tüm kitapçıkları ZIP olarak indirme
   */
  const downloadAllPDFs = () => {
    try {
      const generateAllPDFs = async () => {
        const { generateThemedTestPDF } = await import('../../utils/pdf/themedCore');
        const JSZip = (await import('jszip')).default;
        
        const zip = new JSZip();
        
        // Generate PDF for each booklet
        for (const booklet of booklets) {
          const pdfBytes = await generateThemedTestPDF(metadata, booklet.questions, {
            theme,
            includeAnswerKey: true
          });
          
          zip.file(`Kitapcik_${booklet.version}_${metadata.testName || 'Test'}.pdf`, pdfBytes);
        }
        
        // Generate ZIP file
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        
        // Download ZIP
        const url = URL.createObjectURL(zipBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Kitapciklar_${metadata.testName || 'Test'}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      };
      
      generateAllPDFs();
    } catch (error) {
      console.error('ZIP oluşturma hatası:', error);
      alert('ZIP dosyası oluşturulurken hata oluştu');
    }
  };

  /**
   * Tek kitapçık önizleme
   */
  const previewBookletPDF = (booklet: Booklet) => {
    try {
      // Generate HTML preview for the booklet
      const htmlContent = generateBookletHTML(booklet, metadata, theme);
      const previewWindow = window.open('', '_blank');
      if (previewWindow) {
        previewWindow.document.write(htmlContent);
        previewWindow.document.close();
      } else {
        alert('Popup engelleyici nedeniyle önizleme açılamadı. Lütfen popup engelleyiciyi devre dışı bırakın.');
      }
    } catch (error) {
      console.error('Önizleme hatası:', error);
      alert('Önizleme oluşturulurken hata oluştu');
    }
  };

  /**
   * Tek kitapçık yazdırma
   */
  const printBookletPDF = (booklet: Booklet) => {
    try {
      // Generate HTML content for printing
      const htmlContent = generateBookletHTML(booklet, metadata, theme);
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
      } else {
        alert('Popup engelleyici nedeniyle yazdırma açılamadı. Lütfen popup engelleyiciyi devre dışı bırakın.');
      }
    } catch (error) {
      console.error('Yazdırma hatası:', error);
      alert('Yazdırma işlemi sırasında hata oluştu');
    }
  };

  /**
   * Generate HTML content for booklet preview/print
   */
  const generateBookletHTML = (booklet: Booklet, metadata: TestMetadata, theme: ThemeType): string => {
    const currentDate = new Date().toLocaleDateString('tr-TR');
    
    return `
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Kitapçık ${booklet.version} - ${metadata.testName || 'Test'}</title>
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
          .booklet-version {
            position: absolute;
            top: 20px;
            right: 20px;
            background: #333;
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            font-weight: bold;
            font-size: 18px;
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
            .booklet-version {
              position: static;
              display: inline-block;
              margin-bottom: 20px;
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
            .booklet-version {
              position: absolute;
              top: 10px;
              right: 10px;
            }
          }
        </style>
      </head>
      <body>
        <div class="booklet-version">Kitapçık ${booklet.version}</div>
        
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
          ${booklet.questions.map((question, index) => `
            <div class="question">
              <div class="question-number">${index + 1}.</div>
              <img src="${question.imageData}" alt="Soru ${index + 1}" class="question-image">
            </div>
          `).join('')}
        </div>

        <!-- Answer Key -->
        <div class="answer-key">
          <h2>CEVAP ANAHTARI - Kitapçık ${booklet.version}</h2>
          <div class="answer-grid">
            ${booklet.questions.map((question, index) => `
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
   * Kitapçık setini kaydetme
   */
  const handleSaveBookletSet = () => {
    const bookletSet: BookletSet = {
      id: `booklet_set_${Date.now()}`,
      testId: `test_${Date.now()}`,
      metadata,
      theme,
      booklets,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    onSave(bookletSet);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Kitapçık Oluşturma
        </h3>
        <p className="text-gray-600">
          Kitapçıklarınızı PDF olarak oluşturun ve arşivleyin
        </p>
      </div>

      {/* Generation Status */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="text-center space-y-4">
          {!isGenerating && Object.keys(generatedPDFs).length === 0 && (
            <div>
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                PDF Oluşturmaya Hazır
              </h4>
              <p className="text-gray-600 mb-4">
                {booklets.length} kitapçık versiyonu PDF olarak oluşturulacak
              </p>
              <Button
                onClick={generateAllPDFs}
                icon={FileText}
                size="lg"
              >
                Tüm Kitapçıkları Oluştur
              </Button>
            </div>
          )}

          {isGenerating && (
            <div>
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                PDF'ler Oluşturuluyor...
              </h4>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${generationProgress}%` }}
                ></div>
              </div>
              <p className="text-gray-600">
                {Math.round(generationProgress)}% tamamlandı
              </p>
            </div>
          )}

          {Object.keys(generatedPDFs).length > 0 && !isGenerating && (
            <div>
              <Check className="mx-auto h-12 w-12 text-green-600 mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                PDF'ler Başarıyla Oluşturuldu!
              </h4>
              <p className="text-gray-600 mb-4">
                {Object.keys(generatedPDFs).length} kitapçık PDF'i hazır
              </p>
              <div className="flex justify-center space-x-3">
                <Button
                  onClick={downloadAllPDFs}
                  icon={Download}
                  variant="secondary"
                >
                  Tümünü İndir (ZIP)
                </Button>
                <Button
                  onClick={handleSaveBookletSet}
                  icon={Check}
                >
                  Arşive Kaydet
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Kitapçık Listesi */}
      {Object.keys(generatedPDFs).length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-4">Oluşturulan Kitapçıklar</h4>
          <div className="space-y-3">
            {booklets.map(booklet => {
              const isGenerated = generatedPDFs[booklet.version];
              
              return (
                <div key={booklet.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="font-bold text-blue-600">{booklet.version}</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        Kitapçık {booklet.version}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booklet.questions.length} soru
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {isGenerated ? (
                      <>
                        <span className="text-sm text-green-600 font-medium">Hazır</span>
                        <Button
                          variant="outline"
                          size="sm"
                          icon={Eye}
                          onClick={() => previewBookletPDF(booklet)}
                        >
                          Önizle
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          icon={Download}
                          onClick={() => downloadBookletPDF(booklet)}
                        >
                          İndir
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          icon={Printer}
                          onClick={() => printBookletPDF(booklet)}
                        >
                          Yazdır
                        </Button>
                      </>
                    ) : (
                      <span className="text-sm text-gray-400">Bekliyor...</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Test Özeti */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Test Özeti</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Test Adı:</span>
            <div className="font-medium">{metadata.testName || 'Test'}</div>
          </div>
          <div>
            <span className="text-gray-600">Ders:</span>
            <div className="font-medium">{metadata.courseName || '-'}</div>
          </div>
          <div>
            <span className="text-gray-600">Kitapçık Sayısı:</span>
            <div className="font-medium">{booklets.length}</div>
          </div>
          <div>
            <span className="text-gray-600">Tema:</span>
            <div className="font-medium">{theme}</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-6 border-t border-gray-200">
        <Button
          variant="outline"
          onClick={onBack}
          icon={ArrowLeft}
          disabled={isGenerating}
        >
          Geri
        </Button>
        
        {Object.keys(generatedPDFs).length > 0 && (
          <Button
            onClick={handleSaveBookletSet}
            icon={Check}
          >
            Tamamla ve Kaydet
          </Button>
        )}
      </div>
    </div>
  );
};