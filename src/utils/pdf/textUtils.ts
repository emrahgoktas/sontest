import { TURKISH_CHAR_MAP } from './constants';

/**
 * Text processing utilities for PDF generation
 * 
 * Handles text sanitization and formatting for PDF compatibility
 */

/**
 * Sanitizes Turkish characters for PDF encoding compatibility
 * 
 * @param text - Text to sanitize
 * @returns Text with Turkish characters replaced
 * 
 * @example
 * ```typescript
 * const sanitized = sanitizeTextForPDF('Türkçe Öğretmeni');
 * // Returns: "Turkce Ogretmeni"
 * ```
 */
export const sanitizeTextForPDF = (text: string): string => {
  return text.replace(/[ıİşŞçÇğĞüÜöÖ]/g, (match) => TURKISH_CHAR_MAP[match] || match);
};

/**
 * Generates a standardized filename for exported test PDFs
 * 
 * @param metadata - Test metadata containing class, course, and test names
 * @returns Formatted filename with timestamp
 * 
 * @example
 * ```typescript
 * const filename = generateTestFilename({
 *   className: '10-A',
 *   courseName: 'Matematik',
 *   testName: '1. Dönem Sınavı'
 * });
 * // Returns: "10-A_Matematik_1-Donem-Sinavi_2024-01-15.pdf"
 * ```
 */
export const generateTestFilename = (metadata: { className?: string; courseName?: string; testName?: string }): string => {
  const parts = [];
  
  if (metadata.className) parts.push(sanitizeTextForPDF(metadata.className));
  if (metadata.courseName) parts.push(sanitizeTextForPDF(metadata.courseName));
  if (metadata.testName) parts.push(sanitizeTextForPDF(metadata.testName));
  
  const baseName = parts.length > 0 ? parts.join('_') : 'Test';
  const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  
  return `${baseName}_${timestamp}.pdf`;
};