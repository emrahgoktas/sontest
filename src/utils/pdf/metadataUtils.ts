import { PDFDocument } from 'pdf-lib';
import { TestMetadata } from '../../types';
import { sanitizeTextForPDF } from './textUtils';

/**
 * PDF metadata utilities
 * 
 * Handles PDF document metadata and properties
 */

/**
 * Sets PDF metadata for better document properties
 * 
 * @param pdfDoc - PDF document to set metadata for
 * @param metadata - Test metadata to use
 * 
 * @example
 * ```typescript
 * setPDFMetadata(pdfDoc, {
 *   testName: 'Matematik Sınavı',
 *   teacherName: 'Ahmet Öğretmen',
 *   courseName: 'Matematik',
 *   className: '10-A'
 * });
 * ```
 */
export const setPDFMetadata = (pdfDoc: PDFDocument, metadata: TestMetadata): void => {
  // Sanitize metadata text to handle Turkish characters that cannot be encoded in WinAnsi
  const sanitizedTestName = sanitizeTextForPDF(metadata.testName || 'Test');
  const sanitizedTeacherName = sanitizeTextForPDF(metadata.teacherName || 'Test Oluşturucu');
  const sanitizedCourseName = sanitizeTextForPDF(metadata.courseName || 'Ders');
  const sanitizedClassName = sanitizeTextForPDF(metadata.className || 'Sınıf');
  
  pdfDoc.setTitle(sanitizedTestName);
  pdfDoc.setAuthor(sanitizedTeacherName);
  pdfDoc.setSubject(`${sanitizedCourseName} - ${sanitizedClassName}`);
  pdfDoc.setCreator('Akıllı Test Oluşturucu');
  pdfDoc.setProducer('PDF Test Generator v1.0');
  pdfDoc.setCreationDate(new Date());
};