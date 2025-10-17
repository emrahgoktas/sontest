/**
 * Theme Selector Component
 * 
 * Allows users to choose from available PDF themes with preview and description
 */

import React from 'react';
import { Palette, Info } from 'lucide-react';
import { ThemeType, ThemeConfig } from '../../types/themes';
import { getAllThemes } from '../../utils/pdf/themes/themeManager';

/**
 * Theme Selector Component
 * 
 * Allows users to choose from available PDF themes with preview and description
 */

interface ThemeSelectorProps {
  selectedTheme: ThemeType;
  onThemeChange: (theme: ThemeType) => void;
  className?: string;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  selectedTheme,
  onThemeChange,
  className = ''
}) => {
  const themes = getAllThemes();
  
  /**
   * Handle theme selection with SVG validation
   */
  const handleThemeSelect = async (themeId: ThemeType) => {
    // Special handling for yaprak-test theme with SVG background
    if (themeId === 'yaprak-test') {
      try {
        // Validate PNG file exists and is accessible
        const response = await fetch('/themes/test-02.png');
        if (!response.ok) {
          console.warn('PNG theme file not found, will use fallback');
        } else {
          console.log('PNG theme file validated successfully');
        }
      } catch (error) {
        console.warn('PNG theme validation failed, will use fallback:', error);
      }
    } else if (themeId === 'deneme-sinavi') {
      try {
        // Validate PNG file exists and is accessible for deneme-sinavi theme
        const response = await fetch('/themes/test-03.png');
        if (!response.ok) {
          console.warn('PNG theme file not found for deneme-sinavi, will use fallback');
        } else {
          console.log('PNG theme file validated successfully for deneme-sinavi');
        }
      } catch (error) {
        console.warn('PNG theme validation failed for deneme-sinavi, will use fallback:', error);
      }
    } else if (themeId === 'yazili-sinav') {
      try {
        // Validate PNG file exists and is accessible for yazili-sinav theme
        const response = await fetch('/themes/test-05.png');
        if (!response.ok) {
          console.warn('PNG theme file not found for yazili-sinav, will use fallback');
        } else {
          console.log('PNG theme file validated successfully for yazili-sinav');
        }
      } catch (error) {
        console.warn('PNG theme validation failed for yazili-sinav, will use fallback:', error);
      }
    } else if (themeId === 'tyt-2024') {
      try {
        // Validate PNG file exists and is accessible for tyt-2024 theme
        const response = await fetch('/themes/test-04.png');
        if (!response.ok) {
          console.warn('PNG theme file not found for tyt-2024, will use fallback');
        } else {
          console.log('PNG theme file validated successfully for tyt-2024');
        }
      } catch (error) {
        console.warn('PNG theme validation failed for tyt-2024, will use fallback:', error);
      }
    }
    
    onThemeChange(themeId);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center space-x-2">
        <Palette size={20} className="text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">PDF Teması</h3>
      </div>
      
      <p className="text-sm text-gray-600">
        Test PDF'inizin görünümünü ve düzenini belirleyin
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {themes.map((theme) => (
          <ThemeCard
            key={theme.id}
            theme={theme}
            isSelected={selectedTheme === theme.id}
            onSelect={() => handleThemeSelect(theme.id)}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * Individual theme card component
 */
interface ThemeCardProps {
  theme: ThemeConfig;
  isSelected: boolean;
  onSelect: () => void;
}

const ThemeCard: React.FC<ThemeCardProps> = ({ theme, isSelected, onSelect }) => {
  return (
    <div
      className={`
        relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
        ${isSelected 
          ? 'border-blue-500 bg-blue-50 shadow-md' 
          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
        }
      `}
      onClick={onSelect}
    >
      {/* Theme preview colors */}
      <div className="flex space-x-2 mb-3">
        <div 
          className="w-4 h-4 rounded-full border border-gray-300"
          style={{ backgroundColor: `rgb(${theme.colors.primary.r * 255}, ${theme.colors.primary.g * 255}, ${theme.colors.primary.b * 255})` }}
        />
        <div 
          className="w-4 h-4 rounded-full border border-gray-300"
          style={{ backgroundColor: `rgb(${theme.colors.secondary.r * 255}, ${theme.colors.secondary.g * 255}, ${theme.colors.secondary.b * 255})` }}
        />
        <div 
          className="w-4 h-4 rounded-full border border-gray-300"
          style={{ backgroundColor: `rgb(${theme.colors.accent.r * 255}, ${theme.colors.accent.g * 255}, ${theme.colors.accent.b * 255})` }}
        />
      </div>
      
      {/* Theme info */}
      <h4 className="font-medium text-gray-900 mb-1">{theme.name}</h4>
      <p className="text-sm text-gray-600 mb-3">{theme.description}</p>
      
      {/* Theme features */}
      <div className="space-y-1">
        <div className="flex items-center text-xs text-gray-500">
          <Info size={12} className="mr-1" />
          <span>{theme.layout.columns} sütun düzeni</span>
        </div>
        
        {theme.fields.studentName && (
          <div className="text-xs text-gray-500">• Öğrenci bilgileri alanı</div>
        )}
        
        {theme.fields.schoolName && (
          <div className="text-xs text-gray-500">• Okul bilgileri alanı</div>
        )}
        
        {theme.fields.signature && (
          <div className="text-xs text-gray-500">• İmza alanı</div>
        )}
        
        {theme.defaultWatermark && theme.defaultWatermark.type !== 'none' && (
          <div className="text-xs text-gray-500">• Filigran desteği</div>
        )}
        
        {!theme.includeAnswerKey && (
          <div className="text-xs text-gray-500">• Cevap anahtarı gizli</div>
        )}
      </div>
      
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full" />
        </div>
      )}
    </div>
  );
};