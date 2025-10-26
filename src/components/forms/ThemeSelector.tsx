/**
 * Theme Selector Component (Dropdown Version)
 *
 * Kullanıcıya mevcut PDF temalarını sade bir dropdown menü ile gösterir.
 * Temalar `getAllThemes()` fonksiyonundan dinamik olarak alınır.
 */

import React from 'react';
import { Palette } from 'lucide-react';
import { ThemeType } from '../../types/themes';
import { getAllThemes } from '../../utils/pdf/themes/themeManager';

/**
 * Basit bir Select bileşeni (Shadcn UI yoksa fallback)
 */
interface SimpleSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

const SimpleSelect: React.FC<SimpleSelectProps> = ({ value, onChange, options }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="w-full border border-gray-300 rounded-lg p-2 bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
  >
    <option value="">Bir tema seçin</option>
    {options.map((opt) => (
      <option key={opt.value} value={opt.value}>
        {opt.label}
      </option>
    ))}
  </select>
);

interface ThemeSelectorProps {
  selectedTheme: ThemeType;
  onThemeChange: (theme: ThemeType) => void;
  className?: string;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  selectedTheme,
  onThemeChange,
  className = '',
}) => {
  const themes = getAllThemes();

  // dropdown için veriyi hazırla
  const themeOptions = themes.map((theme) => ({
    value: theme.id,
    label: theme.name,
  }));

  /**
   * Tema seçimini yönetir
   */
  const handleSelectChange = (value: string) => {
    onThemeChange(value as ThemeType);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Başlık */}
      <div className="flex items-center space-x-2">
        <Palette size={20} className="text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">PDF Teması</h3>
      </div>

      {/* Açıklama */}
      <p className="text-sm text-gray-600">
        Test PDF’inizin görünümünü belirlemek için bir tema seçin.
      </p>

      {/* Dropdown menü */}
      <SimpleSelect
        value={selectedTheme}
        onChange={handleSelectChange}
        options={themeOptions}
      />

      {/* Tema sayısı bilgisi */}
      <p className="text-xs text-gray-400 mt-1">
        Toplam {themes.length} tema mevcut
      </p>
    </div>
  );
};
