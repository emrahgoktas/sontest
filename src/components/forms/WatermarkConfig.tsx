/**
 * Watermark Configuration Component
 * 
 * Allows users to configure watermark settings for PDF generation
 */

import React, { useState } from 'react';
import { Droplets, Type, Image, Eye, EyeOff, Upload } from 'lucide-react';
import { WatermarkConfig as WatermarkConfigType } from '../../types/themes';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

/**
 * Watermark Configuration Component
 * 
 * Allows users to configure watermark settings for PDF generation
 */

interface WatermarkConfigProps {
  watermark: WatermarkConfigType;
  onWatermarkChange: (watermark: WatermarkConfigType) => void;
  className?: string;
}

export const WatermarkConfig: React.FC<WatermarkConfigProps> = ({
  watermark,
  onWatermarkChange,
  className = ''
}) => {
  const [showPreview, setShowPreview] = useState(false);

  const updateWatermark = (updates: Partial<WatermarkConfigType>) => {
    onWatermarkChange({ ...watermark, ...updates });
  };

  /**
   * Handle image file selection for watermark
   */
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Lütfen geçerli bir görsel dosyası seçin (PNG, JPG, etc.)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Görsel dosyası 5MB\'dan küçük olmalıdır');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Data = e.target?.result as string;
      updateWatermark({ 
        type: 'image',
        content: base64Data,
        opacity: watermark.opacity || 0.1,
        position: watermark.position || 'center',
        size: watermark.size || 100
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Droplets size={20} className="text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filigran (Watermark)</h3>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          icon={showPreview ? EyeOff : Eye}
          onClick={() => setShowPreview(!showPreview)}
        >
          {showPreview ? 'Önizlemeyi Gizle' : 'Önizleme'}
        </Button>
      </div>
      
      <p className="text-sm text-gray-600">
        PDF sayfalarına filigran ekleyerek belgenizi kişiselleştirin
      </p>
      
      {/* Watermark type selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Filigran Türü
        </label>
        
        <div className="grid grid-cols-3 gap-3">
          {[
            { type: 'none' as const, label: 'Yok', icon: EyeOff },
            { type: 'text' as const, label: 'Metin', icon: Type },
            { type: 'image' as const, label: 'Görsel', icon: Image }
          ].map(({ type, label, icon: Icon }) => (
            <button
              key={type}
              onClick={() => updateWatermark({ type })}
              className={`
                p-3 rounded-lg border-2 transition-all duration-200 flex flex-col items-center space-y-2
                ${watermark.type === type
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }
              `}
            >
              <Icon size={20} />
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Text watermark configuration */}
      {watermark.type === 'text' && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <Input
            label="Filigran Metni"
            value={watermark.content || ''}
            onChange={(e) => updateWatermark({ content: e.target.value })}
            placeholder="örn: DENEME, YAPRAK TEST"
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Opaklık (0-1)"
              type="number"
              min="0"
              max="1"
              step="0.01"
              value={watermark.opacity?.toString() || '0.1'}
              onChange={(e) => updateWatermark({ opacity: parseFloat(e.target.value) || 0.1 })}
            />
            
            <Input
              label="Boyut"
              type="number"
              min="10"
              max="100"
              value={watermark.size?.toString() || '48'}
              onChange={(e) => updateWatermark({ size: parseInt(e.target.value) || 48 })}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pozisyon
              </label>
              <select
                value={watermark.position || 'center'}
                onChange={(e) => updateWatermark({ position: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="center">Merkez</option>
                <option value="top-left">Sol Üst</option>
                <option value="top-right">Sağ Üst</option>
                <option value="bottom-left">Sol Alt</option>
                <option value="bottom-right">Sağ Alt</option>
              </select>
            </div>
            
            <Input
              label="Döndürme (derece)"
              type="number"
              min="-180"
              max="180"
              value={watermark.rotation?.toString() || '0'}
              onChange={(e) => updateWatermark({ rotation: parseInt(e.target.value) || 0 })}
            />
          </div>
        </div>
      )}
      
      {/* Image watermark configuration */}
      {watermark.type === 'image' && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          {/* Image upload area */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Filigran Görseli
            </label>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="watermark-image-upload"
              />
              <label
                htmlFor="watermark-image-upload"
                className="cursor-pointer flex flex-col items-center space-y-2"
              >
                <Upload size={32} className="text-gray-400" />
                <span className="text-sm text-gray-600">
                  Görsel yüklemek için tıklayın
                </span>
                <span className="text-xs text-gray-500">
                  PNG, JPG, GIF (Max 5MB)
                </span>
              </label>
            </div>
            
            {/* Show uploaded image preview */}
            {watermark.content && (
              <div className="mt-3">
                <img
                  src={watermark.content}
                  alt="Filigran önizleme"
                  className="max-w-32 max-h-32 object-contain mx-auto border border-gray-200 rounded"
                />
              </div>
            )}
          </div>
          
          {/* Image watermark settings */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Opaklık (0-1)"
              type="number"
              min="0"
              max="1"
              step="0.01"
              value={watermark.opacity?.toString() || '0.1'}
              onChange={(e) => updateWatermark({ opacity: parseFloat(e.target.value) || 0.1 })}
            />
            
            <Input
              label="Boyut (%)"
              type="number"
              min="10"
              max="200"
              value={watermark.size?.toString() || '100'}
              onChange={(e) => updateWatermark({ size: parseInt(e.target.value) || 100 })}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pozisyon
              </label>
              <select
                value={watermark.position || 'center'}
                onChange={(e) => updateWatermark({ position: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="center">Merkez</option>
                <option value="top-left">Sol Üst</option>
                <option value="top-right">Sağ Üst</option>
                <option value="bottom-left">Sol Alt</option>
                <option value="bottom-right">Sağ Alt</option>
              </select>
            </div>
            
            <Input
              label="Döndürme (derece)"
              type="number"
              min="-180"
              max="180"
              value={watermark.rotation?.toString() || '0'}
              onChange={(e) => updateWatermark({ rotation: parseInt(e.target.value) || 0 })}
            />
          </div>
        </div>
      )}
      
      {/* Preview */}
      {showPreview && watermark.type !== 'none' && watermark.content && (
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Filigran Önizlemesi</h4>
          <div className="relative h-32 bg-gray-100 rounded border overflow-hidden">
            {watermark.type === 'text' ? (
              <div
                className="absolute inset-0 flex items-center justify-center text-gray-400 select-none pointer-events-none"
                style={{
                  fontSize: `${(watermark.size || 48) / 4}px`,
                  opacity: watermark.opacity || 0.1,
                  transform: `rotate(${watermark.rotation || 0}deg)`,
                  color: watermark.color 
                    ? `rgb(${watermark.color.r * 255}, ${watermark.color.g * 255}, ${watermark.color.b * 255})`
                    : undefined
                }}
              >
                {watermark.content}
              </div>
            ) : (
              <img
                src={watermark.content}
                alt="Filigran önizleme"
                className="absolute inset-0 w-full h-full object-contain select-none pointer-events-none"
                style={{
                  opacity: watermark.opacity || 0.1,
                  transform: `rotate(${watermark.rotation || 0}deg) scale(${(watermark.size || 100) / 100})`
                }}
              />
            )}
            <div className="absolute inset-0 flex items-center justify-center text-gray-700 text-sm">
              Test İçeriği Burada Görünecek
            </div>
          </div>
        </div>
      )}
    </div>
  );
};