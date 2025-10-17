import React, { useState, useRef } from 'react';
import { Upload, FileText, X, AlertCircle } from 'lucide-react';
import { Button } from '../../ui/Button';
import { validatePDFFile, convertPDFToImages } from '../../../utils/cropUtils';
import { uploadPDFFile } from '../../../utils/api';

/**
 * PDF Upload Section Component
 * Handles PDF file upload and processing
 */

interface PDFUploadSectionProps {
  onPDFProcessed: (pdfData: {
    pdfUrl?: string;
    pdfId?: string;
    pdfPages: string[];
    pageCount: number;
  }) => void;
}

export const PDFUploadSection: React.FC<PDFUploadSectionProps> = ({
  onPDFProcessed
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [pdfPreview, setPdfPreview] = useState<{
    pages: string[];
    pageCount: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Handle file selection
   */
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validation = validatePDFFile(file);
    if (!validation.isValid) {
      setUploadError(validation.error || 'Invalid file');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setUploadError(null);
    processPDFFile(file);
  };

  /**
   * Process PDF file
   */
  const processPDFFile = async (file: File) => {
    setIsProcessing(true);
    setUploadError(null);

    try {
      // Process PDF with compression for localStorage
      const { numPages, pageImages } = await convertPDFToImages(file, {
        compressionLevel: 0.7, // Compress to 70% quality for storage
        targetWidth: 800, // Limit width to 800px
        targetHeight: 600 // Limit height to 600px
      });
      
      setPdfPreview({
        pages: pageImages,
        pageCount: numPages
      });

      // Save PDF data to localStorage with size optimization
      try {
        const pdfDataForStorage = {
          pageImages: pageImages.slice(0, 10), // Limit to first 10 pages
          numPages: Math.min(numPages, 10),
          fileName: file.name,
          uploadedAt: new Date().toISOString(),
          compressed: true
        };
        
        const dataString = JSON.stringify(pdfDataForStorage);
        const dataSizeMB = (dataString.length / 1024 / 1024).toFixed(2);
        
        console.log(`📊 PDF data size: ${dataSizeMB}MB`);
        
        // Check if data is too large for localStorage (5MB limit)
        if (dataString.length > 5 * 1024 * 1024) {
          console.warn('⚠️ PDF data too large, using reduced quality');
          
          // Further compress by reducing pages and quality
          const reducedData = {
            pageImages: pageImages.slice(0, 5), // Only first 5 pages
            numPages: Math.min(numPages, 5),
            fileName: file.name,
            uploadedAt: new Date().toISOString(),
            compressed: true,
            reduced: true
          };
          
          localStorage.setItem('uploadedPDFData', JSON.stringify(reducedData));
          console.log('💾 Saved reduced PDF data');
        } else {
          localStorage.setItem('uploadedPDFData', dataString);
          console.log('💾 Saved PDF data');
        }
      } catch (storageError) {
        console.warn('⚠️ localStorage save failed, continuing without storage');
        // Continue without localStorage - exam will work with questions only
      }

      // Use local processing only - backend upload is optional
      try {
        // Try backend upload first, fallback to local processing
        try {
          const uploadResult = await uploadPDFFile(file);
          if (uploadResult.success) {
            onPDFProcessed({
              pdfUrl: uploadResult.pdfUrl,
              pdfId: uploadResult.pdfId,
              pdfPages: pageImages,
              pageCount: numPages
            });
          } else {
            throw new Error(uploadResult.message || 'Upload failed');
          }
        } catch (uploadError) {
          console.warn('Backend PDF upload failed, using local processing:', uploadError);
          // Fallback to local processing
          onPDFProcessed({
            pdfPages: pageImages,
            pageCount: numPages
          });
        }
      } catch (backendError) {
        console.warn('PDF processing error:', backendError);
        // Use local data as fallback
        onPDFProcessed({
          pdfPages: pageImages,
          pageCount: numPages
        });
      }

    } catch (error) {
      console.error('PDF processing error:', error);
      setUploadError('PDF işlenirken hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Remove selected file
   */
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPdfPreview(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Handle drag and drop
   */
  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    
    if (file) {
      const validation = validatePDFFile(file);
      if (!validation.isValid) {
        setUploadError(validation.error || 'Invalid file');
        return;
      }

      setSelectedFile(file);
      setUploadError(null);
      processPDFFile(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">PDF Dosyası Yükle</h3>
      
      {!selectedFile ? (
        <div
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-300"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <div>
            <p className="text-sm font-medium text-gray-900">
              PDF dosyasını buraya sürükleyin
            </p>
            <p className="text-xs text-gray-500">
              veya dosya seçmek için tıklayın
            </p>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Maksimum dosya boyutu: 50MB
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* File Info */}
          <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-900">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-green-700">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  {pdfPreview && ` • ${pdfPreview.pageCount} sayfa`}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              icon={X}
              onClick={handleRemoveFile}
              className="text-red-600 hover:text-red-700"
            >
              Kaldır
            </Button>
          </div>

          {/* Processing State */}
          {isProcessing && (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mr-3"></div>
              <span className="text-gray-600">PDF işleniyor...</span>
            </div>
          )}

          {/* PDF Preview */}
          {pdfPreview && !isProcessing && (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">PDF Önizlemesi</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {pdfPreview.pages.slice(0, 3).map((pageImage, index) => (
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
                
                {pdfPreview.pageCount > 3 && (
                  <div className="border border-gray-200 rounded-lg p-4 flex items-center justify-center bg-gray-50">
                    <div className="text-center text-gray-600">
                      <div className="text-sm font-medium">+{pdfPreview.pageCount - 3}</div>
                      <div className="text-xs">sayfa daha</div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  ✓ PDF başarıyla işlendi. {pdfPreview.pageCount} sayfa online sınavda görüntülenecek.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Upload Error */}
      {uploadError && (
        <div className="mt-4 flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
          <AlertCircle size={16} />
          <span className="text-sm">{uploadError}</span>
        </div>
      )}
    </div>
  );
};