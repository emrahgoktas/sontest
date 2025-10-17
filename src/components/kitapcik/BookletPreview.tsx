import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Eye, Download, Printer } from 'lucide-react';
import { Button } from '../ui/Button';
import { TestMetadata, CroppedQuestion } from '../../types';
import { ThemeType } from '../../types/themes';
import { Booklet } from '../../types/booklet';

/**
 * Kitapçık Önizleme Bileşeni
 * Oluşturulan kitapçıkları önizleme ve PDF işlemleri
 */

interface BookletPreviewProps {
  booklets: Booklet[];
  metadata: TestMetadata;
  theme: ThemeType;
  onGenerate: () => void;
  onBack: () => void;
}

export const BookletPreview: React.FC<BookletPreviewProps> = ({
  booklets,
  metadata,
  theme,
  onGenerate,
  onBack
}) => {
  const [selectedBooklet, setSelectedBooklet] = useState(0);
  const [previewMode, setPreviewMode] = useState<'grid' | 'list'>('grid');

  const currentBooklet = booklets[selectedBooklet];

  /**
   * PDF önizleme
   */
  const handlePreviewPDF = async (booklet: Booklet) => {
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
   * PDF indirme
   */
  const handleDownloadPDF = async (booklet: Booklet) => {
    try {
      // Generate PDF for the specific booklet
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
    } catch (error) {
      console.error('PDF indirme hatası:', error);
      alert('PDF oluşturulurken hata oluştu');
    }
  };

  /**
   * Yazdırma
   */
  const handlePrint = async (booklet: Booklet) => {
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Kitapçık Önizlemesi
        </h3>
        <p className="text-gray-600">
          Oluşturulan kitapçıkları kontrol edin ve PDF işlemlerini gerçekleştirin
        </p>
      </div>

      {/* Test Bilgileri */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Test Bilgileri</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-blue-800">
          <div><strong>Test Adı:</strong> {metadata.testName || 'Test'}</div>
          <div><strong>Ders:</strong> {metadata.courseName || '-'}</div>
          <div><strong>Sınıf:</strong> {metadata.className || '-'}</div>
          <div><strong>Tema:</strong> {theme}</div>
        </div>
      </div>

      {/* Kitapçık Seçimi */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-gray-900">Kitapçık Seçimi</h4>
          <div className="flex space-x-2">
            <button
              onClick={() => setPreviewMode('grid')}
              className={`px-3 py-1 rounded text-sm ${
                previewMode === 'grid' ? 'bg-blue-100 text-blue-700' : 'text-gray-600'
              }`}
            >
              Izgara
            </button>
            <button
              onClick={() => setPreviewMode('list')}
              className={`px-3 py-1 rounded text-sm ${
                previewMode === 'list' ? 'bg-blue-100 text-blue-700' : 'text-gray-600'
              }`}
            >
              Liste
            </button>
          </div>
        </div>

        <div className="flex space-x-2 mb-4">
          {booklets.map((booklet, index) => (
            <button
              key={booklet.id}
              onClick={() => setSelectedBooklet(index)}
              className={`
                px-4 py-2 rounded-lg border-2 transition-all duration-200 font-medium
                ${selectedBooklet === index
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
                }
              `}
            >
              Kitapçık {booklet.version}
            </button>
          ))}
        </div>

        {/* Kitapçık İşlemleri */}
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            icon={Eye}
            onClick={() => handlePreviewPDF(currentBooklet)}
          >
            PDF Önizle
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={() => handleDownloadPDF(currentBooklet)}
          >
            PDF İndir
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={Printer}
            onClick={() => handlePrint(currentBooklet)}
          >
            Yazdır
          </Button>
        </div>
      </div>

      {/* Soru Önizlemesi */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-4">
          Kitapçık {currentBooklet?.version} - Sorular ({currentBooklet?.questions?.length || 0})
        </h4>

        {previewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {currentBooklet?.questions?.map((question, index) => (
              <div key={question.id} className="border border-gray-200 rounded-lg p-3">
                <div className="text-sm font-medium text-gray-900 mb-2">
                  {index + 1}. Soru
                </div>
                <img
                  src={question.imageData}
                  alt={`Soru ${index + 1}`}
                  className="w-full h-20 object-contain bg-gray-50 rounded border mb-2"
                />
                <div className="text-xs text-gray-500 text-center">
                  Doğru: {question.correctAnswer}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {currentBooklet?.questions?.map((question, index) => (
              <div key={question.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {index + 1}
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <img
                    src={question.imageData}
                    alt={`Soru ${index + 1}`}
                    className="w-16 h-12 object-contain bg-gray-50 rounded border"
                  />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    Soru {index + 1}
                  </div>
                  <div className="text-xs text-gray-500">
                    Doğru Cevap: {question.correctAnswer} | {question.actualWidth}×{question.actualHeight}px
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Kitapçık Özeti */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Tüm Kitapçıklar Özeti</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {booklets?.map(booklet => (
            <div key={booklet.id} className="text-center p-3 bg-white rounded border">
              <div className="text-lg font-bold text-blue-600 mb-1">
                {booklet.version}
              </div>
              <div className="text-sm text-gray-600 mb-2">
                {booklet?.questions?.length || 0} soru
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => handlePreviewPDF(booklet)}
                  className="w-full text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                >
                  Önizle
                </button>
                <button
                  onClick={() => handleDownloadPDF(booklet)}
                  className="w-full text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
                >
                  İndir
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-6 border-t border-gray-200">
        <Button
          variant="outline"
          onClick={onBack}
          icon={ArrowLeft}
        >
          Geri
        </Button>
        
        <Button
          onClick={onGenerate}
          icon={ArrowRight}
          iconPosition="right"
        >
          Kitapçıkları Oluştur
        </Button>
      </div>
    </div>
  );
};