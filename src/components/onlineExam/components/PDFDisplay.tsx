/**
 * PDF Display Component
 * Displays PDF pages in full-page format for online exams
 */

import React from 'react';
import { FileText, AlertCircle, Download } from 'lucide-react';
import { PDFDisplayProps } from '../../../types/onlineExamScreen';

export const PDFDisplay: React.FC<PDFDisplayProps> = ({
  pdfPages,
  currentQuestionIndex,
  questions,
  isCompleted
}) => {
  console.log('📄 PDFDisplay - pdfPages:', pdfPages?.length, 'pages available, questions:', questions?.length);
  
  // Check if we have real PDF data
  const hasRealPDF = pdfPages && pdfPages.length > 0 && 
    (pdfPages[0].includes('data:image/') || pdfPages[0].includes('data:application/pdf'));
  
  console.log('📄 PDF Type Check:', {
    hasPages: pdfPages?.length > 0,
    firstPageType: pdfPages?.[0]?.substring(0, 50),
    hasRealPDF
  });
  
  /**
   * Create PDF blob URL for iframe display
   */
  const createPDFBlobUrl = (pageUrl: string): string => {
    try {
      if (pageUrl.startsWith('data:application/pdf;base64,')) {
        const base64Content = pageUrl.split(',')[1];
        const binaryString = atob(base64Content);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'application/pdf' });
        return URL.createObjectURL(blob);
      } else if (pageUrl.startsWith('data:image/svg+xml;base64,')) {
        // Fallback for SVG content
        const base64Content = pageUrl.split(',')[1];
        const svgContent = atob(base64Content);
        const blob = new Blob([svgContent], { type: 'image/svg+xml' });
        return URL.createObjectURL(blob);
      }
      return pageUrl;
    } catch (error) {
      console.error('Error creating blob URL:', error);
      return '';
    }
  };

  /**
   * Check if content is PDF
   */
  const isPDFContent = (pageUrl: string): boolean => {
    return pageUrl.startsWith('data:application/pdf;base64,') || pageUrl.includes('.pdf');
  };

  /**
   * Check if content is SVG
   */
  const isSVGContent = (pageUrl: string): boolean => {
    return pageUrl.startsWith('data:image/svg+xml') && !isPDFContent(pageUrl);
  };

  if (pdfPages.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            PDF İçeriği Mevcut Değil
          </h3>
          <p className="text-gray-600">
            Bu sınav için PDF içeriği yüklenmemiş
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {pdfPages.map((pageUrl, index) => (
        <div key={index} className="border border-gray-200 rounded-lg shadow-sm bg-white">
          {/* Page Header */}
          <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Sayfa {index + 1}
              </span>
              <span className="text-xs text-gray-500">
                A4 Tam Boyut • {Math.min(8, questions.length - (index * 8))} Soru
              </span>
            </div>
          </div>
          
          {/* PDF Page Content */}
          <div className="bg-white p-4">
            <div className="w-full flex justify-center">
              {isPDFContent(pageUrl) ? (
                // Real PDF content - use iframe for full PDF display
                <iframe
                  src={createPDFBlobUrl(pageUrl)}
                  className="w-full border border-gray-200 rounded bg-white"
                  style={{
                    width: '100%',
                    height: '900px',
                    minHeight: '700px'
                  }}
                  title={`PDF Sayfa ${index + 1}`}
                  onLoad={() => {
                    console.log(`✅ Real PDF page ${index + 1} loaded successfully`);
                    console.log(`PDF URL type: ${pageUrl.substring(0, 50)}...`);
                  }}
                  onError={(e) => {
                    console.error(`❌ PDF page ${index + 1} failed to load:`, e);
                  }}
                />
              ) : isSVGContent(pageUrl) ? (
                // SVG content - use object element
                <div className="w-full max-w-4xl">
                  <object
                    data={createPDFBlobUrl(pageUrl)}
                    type="image/svg+xml"
                    className="w-full bg-white border border-gray-200 rounded"
                    style={{
                      width: '100%',
                      height: '700px',
                      minHeight: '600px'
                    }}
                    onLoad={() => console.log(`📄 SVG page ${index + 1} loaded successfully`)}
                    onError={(e) => {
                      console.error(`❌ SVG page ${index + 1} error:`, e);
                      // Fallback to iframe with SVG content
                      const target = e.target as HTMLObjectElement;
                      const iframe = document.createElement('iframe');
                      iframe.src = createPDFBlobUrl(pageUrl);
                      iframe.style.width = '100%';
                      iframe.style.height = '700px';
                      iframe.style.border = 'none';
                      target.parentNode?.replaceChild(iframe, target);
                    }}
                  >
                    {/* Fallback content */}
                    <div className="flex items-center justify-center bg-gray-100 rounded" style={{ height: '700px' }}>
                      <div className="text-center">
                        <AlertCircle className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">PDF içeriği yükleniyor...</p>
                      </div>
                    </div>
                  </object>
                </div>
              ) : (
                // Regular image content - fallback
                <img
                  src={pageUrl}
                  alt={`Sayfa ${index + 1}`}
                  className="w-full bg-white border border-gray-200 rounded"
                  style={{
                    width: '100%',
                    height: '700px',
                    objectFit: 'contain'
                  }}
                  onError={(e) => {
                    console.error(`❌ Image page ${index + 1} error:`, e);
                    const target = e.target as HTMLImageElement;
                    target.style.backgroundColor = '#f3f4f6';
                    target.alt = `Sayfa ${index + 1} yüklenemedi`;
                  }}
                  onLoad={() => {
                    console.log(`🖼️ Image page ${index + 1} loaded successfully`);
                  }}
                />
              )}
            </div>
          </div>
        </div>
      ))}
      
      {/* PDF Info Footer */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-blue-600" />
          <div>
            <h4 className="text-sm font-medium text-blue-900">
              {hasRealPDF ? '📄 Gerçek PDF Dökümanı - Öğretmen Yükledi' : '📋 Demo Sınav Dökümanı (SVG)'}
            </h4>
            <p className="text-xs text-blue-800">
              {pdfPages.length} sayfa • {questions.length} soru • 
              {hasRealPDF ? ' PDF Format - Yüklenen Dosya' : ' SVG Format - Demo İçerik'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};