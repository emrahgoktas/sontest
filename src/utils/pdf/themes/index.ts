/**
 * Theme system main export module
 * 
 * Provides centralized access to all themes and theme utilities
 */

export * from './classic';
export * from './yaprakTest';
export * from './denemeSinavi';
export * from './yaziliSinav';
export * from './tyt2024';
export * from './yks2025';
export * from './yks2025Term2';
export * from './yks2025Term3';
export * from './yks2025Term4';
export * from './themeManager';
export * from './watermarkUtils';

// Re-export types
export type { 
  ThemeType, 
  ThemeConfig, 
  WatermarkConfig, 
  PageLayoutConfig,
  ThemeFields,
  PDFGenerationOptions,
  ThemedTestMetadata,
  ThemePlugin
} from '../../../types/themes';