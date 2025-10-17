import React, { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ThemeSelector } from './ThemeSelector';
import { WatermarkConfig } from './WatermarkConfig';
import { TestMetadata, PDFInfo } from '../../types';
import { ThemeType, WatermarkConfig as WatermarkConfigType, ThemedTestMetadata } from '../../types/themes';
import { convertPDFToImages, validatePDFFile } from '../../utils/cropUtils';


/**
 * Enhanced PDF Upload Form Component with Theme Support
 * Handles PDF file upload, metadata collection, theme selection, and watermark configuration
 */

interface PDFUploadFormProps {
  metadata: TestMetadata;
  onMetadataChange: (metadata: TestMetadata) => void;
  onPDFUpload: (pdfInfo: PDFInfo) => void;
  onNext: () => void;
  isLoading: boolean;
}

export const PDFUploadForm: React.FC<PDFUploadFormProps> = ({
  metadata,
  onMetadataChange,
  onPDFUpload,
  onNext,
  isLoading
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<ThemeType>('classic');
  const [watermarkConfig, setWatermarkConfig] = useState<WatermarkConfigType>({ type: 'none' });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [includeAnswerKey, setIncludeAnswerKey] = useState(true); // Add state for answer key checkbox
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { userInfo } = useUser();

  // Initialize form with user data if available
  const [formMetadata, setFormMetadata] = useState(() => {
    const initialMetadata = { 
      ...metadata,
      questionSpacing: metadata.questionSpacing || 5
    };
    
    // Set default values from user context if available
    if (userInfo) {
      if (!initialMetadata.teacherName && userInfo.fullName) {
        initialMetadata.teacherName = userInfo.fullName;
      }
      if (!initialMetadata.courseName && userInfo.subject) {
        initialMetadata.courseName = userInfo.subject;
      }
      if (!initialMetadata.className && userInfo.gradeLevel) {
        initialMetadata.className = userInfo.gradeLevel;
      }
    }
    
    return initialMetadata;
  });

  /**
   * Handle file selection
   */
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = validatePDFFile(file);
    if (!validation.isValid) {
      setUploadError(validation.error || 'Invalid file');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setUploadError(null);
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
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  /**
   * Process PDF and proceed to next step
   */
  const handleProceed = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setUploadError(null);

    try {
     // const { numPages, pageImages, pdfDocument } = await convertPDFToImages(selectedFile);
      const { numPages, pageImages, pdfDocument } = await convertPDFToImages(selectedFile, { lazy: true });

      
      const pdfInfo: PDFInfo = {
        file: selectedFile,
        numPages,
        pageImages,
        pdfDocument
      };

      // Store theme, watermark preferences, and answer key setting in metadata
      const themedMetadata: ThemedTestMetadata = {
        ...formMetadata,
        customFields: {
          selectedTheme,
          watermarkConfig: JSON.stringify(watermarkConfig),
          includeAnswerKey: includeAnswerKey.toString() // Store answer key preference
        }
      };

      onPDFUpload(pdfInfo);
      onMetadataChange(themedMetadata); 
      onNext();
    } catch (error) {
      setUploadError('PDF işleme hatası. Lütfen tekrar deneyin.');
      console.error('PDF processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Update metadata field
   */
  const updateMetadata = (field: keyof TestMetadata, value: string | number) => {
    const updatedMetadata = {
      ...formMetadata,
      [field]: value
    };
    
    setFormMetadata(updatedMetadata);
    onMetadataChange(updatedMetadata);
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          PDF Yükleme ve Test Ayarları
        </h2>
        <p className="text-gray-600">
          Test oluşturmak için PDF dosyanızı yükleyin ve ayarlarınızı yapın
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Left Column - PDF Upload */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">PDF Dosyası</h3>
          
          {/* File drop zone */}
          <div
            className={`
              relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300
              ${selectedFile 
                ? 'border-green-300 bg-green-50' 
                : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
              }
            `}
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
            
            {selectedFile ? (
              <div className="space-y-3">
                <FileText className="mx-auto h-12 w-12 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-900">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-green-700">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Farklı dosya seç
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    PDF dosyasını buraya sürükleyin
                  </p>
                  <p className="text-xs text-gray-500">
                    veya dosya seçmek için tıklayın
                  </p>
                </div>
                <p className="text-xs text-gray-400">
                  Maksimum dosya boyutu: 50MB
                </p>
              </div>
            )}
          </div>

          {/* Upload error */}
          {uploadError && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle size={16} />
              <span className="text-sm">{uploadError}</span>
            </div>
          )}

          {/* Basic Metadata */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Temel Bilgiler</h4>
            
            <Input
              label="Test Adı"
              placeholder="örn: 1. Dönem Sınavı"
              value={formMetadata.testName || ''}
              onChange={(e) => updateMetadata('testName', e.target.value)}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Sınıf"
                placeholder="örn: 10-A"
                value={formMetadata.className || ''}
                onChange={(e) => updateMetadata('className', e.target.value)}
              />

              <Input
                label="Ders"
                placeholder="örn: Matematik"
                value={formMetadata.courseName || ''}
                onChange={(e) => updateMetadata('courseName', e.target.value)}
              />
            </div>

            <Input
              label="Öğretmen Adı"
              placeholder="örn: Ali Veli"
              value={formMetadata.teacherName || ''}
              onChange={(e) => updateMetadata('teacherName', e.target.value)}
            />

            <Input
              label="Sorular Arası Boşluk (mm)"
              type="number"
              min="0"
              max="50"
              value={formMetadata.questionSpacing.toString()}
              onChange={(e) => updateMetadata('questionSpacing', parseInt(e.target.value) || 5)}
              helpText="Sorular arasında bırakılacak boşluk miktarı"
            />
          </div>
        </div>

        {/* Right Column - Theme and Advanced Settings */}
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

          {/* Advanced Settings Toggle */}
          <div className="pt-4 border-t border-gray-200">
            <Button
              variant="ghost"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full"
            >
              {showAdvanced ? 'Gelişmiş Ayarları Gizle' : 'Gelişmiş Ayarları Göster'}
            </Button>
          </div>

          {/* Advanced Settings */}
          {showAdvanced && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900">Gelişmiş Ayarlar</h4>
              
              <div className="space-y-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={includeAnswerKey}
                    onChange={(e) => setIncludeAnswerKey(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Cevap anahtarını dahil et</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    defaultChecked={false}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Sayfa numaralarını gizle</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    defaultChecked={false}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Soru numaralarını büyüt</span>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end pt-6 border-t border-gray-200">
        <Button
          onClick={handleProceed}
          disabled={!selectedFile || isLoading}
          isLoading={isProcessing}
          size="lg"
          icon={Upload}
        >
          {isProcessing ? 'PDF İşleniyor...' : 'Soru Kırpma Ekranına Geç'}
        </Button>
      </div>
    </div>
  );
};