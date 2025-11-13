/**
 * Theme system type definitions for PDF generation
 * 
 * Defines interfaces for pluggable themes, watermarks, and advanced layout options
 */

import { TestMetadata, CroppedQuestion } from './index';

/**
 * Available theme types
 */
export type ThemeType = 'classic'
 | 'yaprak-test' 
 | 'deneme-sinavi'
  | 'yazili-sinav' 
  | 'tyt-2024'
  | 'yks-2025'
  | 'yks-2025-2'
  | 'yks-2025-3'
  | 'yks-2025-4';

/**
 * Watermark configuration options
 */
export interface WatermarkConfig {
  type: 'none' | 'text' | 'image';
  content?: string; // Text content or base64 image data
  opacity?: number; // 0-1, default 0.3
  position?: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  size?: number; // Font size for text or scale for image
  rotation?: number; // Rotation angle in degrees
  color?: { r: number; g: number; b: number }; // Color for text watermarks
}

/**
 * Advanced page layout configuration
 */
export interface PageLayoutConfig {
  columns?: number; // Number of columns (1-3)
  questionSpacing?: number; // Spacing between questions
  backgroundColor?: { r: number; g: number; b: number };
  borderStyle?: 'none' | 'subtle' | 'bold';
  questionBoxStyle?: 'none' | 'minimal' | 'modern' | 'classic';
  headerStyle?: 'minimal' | 'standard' | 'detailed';
  footerStyle?: 'minimal' | 'standard' | 'detailed';
}

/**
 * Theme-specific field configuration
 */
export interface ThemeFields {
  schoolName?: boolean;
  studentName?: boolean;
  studentNumber?: boolean;
  signature?: boolean;
  examCode?: boolean;
  bookletNumber?: boolean;
  answerGrid?: boolean; // For bubble sheet style
}

/**
 * Complete theme configuration
 */
export interface ThemeConfig {
  id: ThemeType;
  name: string;
  description: string;
  
  // SVG background support
  backgroundSvgPath?: string;
  
  // Visual styling
  colors: {
    primary: { r: number; g: number; b: number };
    secondary: { r: number; g: number; b: number };
    accent: { r: number; g: number; b: number };
    background: { r: number; g: number; b: number };
    text: { r: number; g: number; b: number };
    border: { r: number; g: number; b: number };
  };
  
  // Layout configuration
  layout: PageLayoutConfig;
  
  // Theme-specific fields
  fields: ThemeFields;
  
  // Watermark settings
  defaultWatermark?: WatermarkConfig;
  
  // Answer key options
  includeAnswerKey?: boolean;
  answerKeyInMetadata?: boolean; // Store in PDF metadata if not included as page
}

/**
 * PDF generation options with theme support
 */
export interface PDFGenerationOptions {
  theme: ThemeType;
  watermark?: WatermarkConfig;
  customFields?: Record<string, string>; // Additional custom fields
  includeAnswerKey?: boolean;
  customLayout?: Partial<PageLayoutConfig>;
}

/**
 * Theme-specific metadata extension
 */
export interface ThemedTestMetadata extends TestMetadata {
  schoolName?: string;
  studentName?: string;
  studentNumber?: string;
  examCode?: string;
  bookletNumber?: string;
  customFields?: Record<string, string>;
}

/**
 * Theme plugin interface for extensibility
 */
export interface ThemePlugin {
  config: ThemeConfig;
  
  // Theme-specific rendering methods
  renderHeader?(page: any, metadata: ThemedTestMetadata, contentStartY: number): number;
  renderFooter?(page: any, pageNumber: number, totalPages: number): void;
  renderQuestionBox?(page: any, question: CroppedQuestion, layout: any): void;
  renderWatermark?(page: any, watermark: WatermarkConfig): void;
  renderAnswerKey?(pdfDoc: any, questions: CroppedQuestion[], totalPages: number): void;
  
  // Custom field rendering
  renderCustomFields?(page: any, metadata: ThemedTestMetadata, startY: number): number;
}