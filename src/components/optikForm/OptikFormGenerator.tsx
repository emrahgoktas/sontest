import React, { useState } from 'react';
import { FileText, Download, Upload, Settings } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { OptikFormConfig, OptikForm } from '../../types/booklet';

/**
 * Optik Form Oluşturucu Bileşeni
 * SVG tabanlı optik cevap formları oluşturma
 */

interface OptikFormGeneratorProps {
  questionCount: number;
  onFormGenerated: (form: OptikForm) => void;
}

export const OptikFormGenerator: React.FC<OptikFormGeneratorProps> = ({
  questionCount,
  onFormGenerated
}) => {
  const [config, setConfig] = useState<Partial<OptikFormConfig>>({
    name: 'Standart Optik Form',
    questionCount,
    optionCount: 5,
    isDefault: true
  });
  const [customSvg, setCustomSvg] = useState<string>('');
  const [useCustom, setUseCustom] = useState(false);

  /**
   * Standart optik form SVG oluşturma
   */
  const generateStandardSVG = (questionCount: number, optionCount: number): string => {
    const questionsPerColumn = 25;
    const columns = Math.ceil(questionCount / questionsPerColumn);
    const svgWidth = columns * 200 + 100;
    const svgHeight = 800;

    let svgContent = `
      <svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <style>
            .form-title { font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; }
            .question-number { font-family: Arial, sans-serif; font-size: 10px; }
            .option-label { font-family: Arial, sans-serif; font-size: 8px; }
            .bubble { fill: none; stroke: #000; stroke-width: 1; }
          </style>
        </defs>
        
        <!-- Header -->
        <rect x="10" y="10" width="${svgWidth - 20}" height="60" fill="none" stroke="#000" stroke-width="2"/>
        <text x="${svgWidth / 2}" y="35" text-anchor="middle" class="form-title">CEVAP ANAHTARI</text>
        
        <!-- Student Info -->
        <text x="20" y="55" class="question-number">Ad Soyad: ________________________</text>
        <text x="${svgWidth - 200}" y="55" class="question-number">Sınıf: ____________</text>
    `;

    // Generate question bubbles
    for (let col = 0; col < columns; col++) {
      const startQuestion = col * questionsPerColumn + 1;
      const endQuestion = Math.min(startQuestion + questionsPerColumn - 1, questionCount);
      const colX = 20 + col * 200;

      for (let q = startQuestion; q <= endQuestion; q++) {
        const rowY = 100 + (q - startQuestion) * 25;
        
        // Question number
        svgContent += `<text x="${colX}" y="${rowY + 12}" class="question-number">${q}.</text>`;
        
        // Option bubbles
        const options = ['A', 'B', 'C', 'D', 'E'].slice(0, optionCount);
        options.forEach((option, index) => {
          const bubbleX = colX + 25 + index * 20;
          const bubbleY = rowY + 2;
          
          svgContent += `
            <circle cx="${bubbleX}" cy="${bubbleY + 8}" r="6" class="bubble"/>
            <text x="${bubbleX}" y="${bubbleY - 2}" text-anchor="middle" class="option-label">${option}</text>
          `;
        });
      }
    }

    svgContent += '</svg>';
    return svgContent;
  };

  /**
   * Özel SVG yükleme
   */
  const handleCustomSVGUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'image/svg+xml') {
      alert('Lütfen SVG dosyası seçin');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const svgContent = e.target?.result as string;
      setCustomSvg(svgContent);
    };
    reader.readAsText(file);
  };

  /**
   * Form oluşturma
   */
  const generateForm = () => {
    const svgContent = useCustom && customSvg 
      ? customSvg 
      : generateStandardSVG(config.questionCount || questionCount, config.optionCount || 5);

    const formConfig: OptikFormConfig = {
      id: `config_${Date.now()}`,
      name: config.name || 'Optik Form',
      questionCount: config.questionCount || questionCount,
      optionCount: config.optionCount || 5,
      customSvg: useCustom ? customSvg : undefined,
      isDefault: !useCustom
    };

    const form: OptikForm = {
      id: `form_${Date.now()}`,
      bookletId: '', // Will be set by parent
      config: formConfig,
      svgContent,
      createdAt: new Date()
    };

    onFormGenerated(form);
  };

  /**
   * SVG önizleme
   */
  const previewSVG = () => {
    const svgContent = useCustom && customSvg 
      ? customSvg 
      : generateStandardSVG(config.questionCount || questionCount, config.optionCount || 5);

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  /**
   * SVG indirme
   */
  const downloadSVG = () => {
    const svgContent = useCustom && customSvg 
      ? customSvg 
      : generateStandardSVG(config.questionCount || questionCount, config.optionCount || 5);

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `optik-form-${config.questionCount}-soru.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="bg-purple-600 rounded-lg p-2">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Optik Form Oluşturucu
          </h2>
        </div>
        <p className="text-gray-600">
          Sınavınız için optik cevap formu oluşturun
        </p>
      </div>

      {/* Form Tipi Seçimi */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Form Tipi</h3>
        
        <div className="space-y-4">
          <label className="flex items-center space-x-3">
            <input
              type="radio"
              checked={!useCustom}
              onChange={() => setUseCustom(false)}
              className="text-blue-600 focus:ring-blue-500"
            />
            <div>
              <span className="font-medium text-gray-900">Standart Form</span>
              <p className="text-sm text-gray-500">
                Otomatik oluşturulan standart optik form
              </p>
            </div>
          </label>

          <label className="flex items-center space-x-3">
            <input
              type="radio"
              checked={useCustom}
              onChange={() => setUseCustom(true)}
              className="text-blue-600 focus:ring-blue-500"
            />
            <div>
              <span className="font-medium text-gray-900">Özel Form</span>
              <p className="text-sm text-gray-500">
                Kendi SVG formunuzu yükleyin
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Standart Form Ayarları */}
      {!useCustom && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Settings className="mr-2" size={20} />
            Form Ayarları
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Form Adı"
              value={config.name || ''}
              onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
              placeholder="örn: Matematik Sınavı Optik Form"
            />

            <Input
              label="Soru Sayısı"
              type="number"
              min="1"
              max="200"
              value={config.questionCount?.toString() || questionCount.toString()}
              onChange={(e) => setConfig(prev => ({ ...prev, questionCount: parseInt(e.target.value) || questionCount }))}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Şık Sayısı
              </label>
              <select
                value={config.optionCount || 5}
                onChange={(e) => setConfig(prev => ({ ...prev, optionCount: parseInt(e.target.value) as 3 | 4 | 5 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={3}>3 Şık (A-C)</option>
                <option value={4}>4 Şık (A-D)</option>
                <option value={5}>5 Şık (A-E)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Özel Form Yükleme */}
      {useCustom && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Upload className="mr-2" size={20} />
            Özel SVG Yükleme
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SVG Dosyası Seçin
              </label>
              <input
                type="file"
                accept=".svg"
                onChange={handleCustomSVGUpload}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Sadece SVG formatında dosyalar kabul edilir
              </p>
            </div>

            {customSvg && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800">
                  ✓ SVG dosyası başarıyla yüklendi
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Önizleme ve İşlemler */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Form Önizlemesi</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
          <div>
            <span className="text-gray-600">Soru Sayısı:</span>
            <div className="font-medium">{config.questionCount || questionCount}</div>
          </div>
          <div>
            <span className="text-gray-600">Şık Sayısı:</span>
            <div className="font-medium">{config.optionCount || 5}</div>
          </div>
          <div>
            <span className="text-gray-600">Form Tipi:</span>
            <div className="font-medium">{useCustom ? 'Özel' : 'Standart'}</div>
          </div>
          <div>
            <span className="text-gray-600">Durum:</span>
            <div className="font-medium text-green-600">Hazır</div>
          </div>
        </div>

        <div className="flex space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={previewSVG}
          >
            Önizle
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={downloadSVG}
          >
            SVG İndir
          </Button>
          <Button
            onClick={generateForm}
            icon={FileText}
          >
            Formu Oluştur
          </Button>
        </div>
      </div>
    </div>
  );
};